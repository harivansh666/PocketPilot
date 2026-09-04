import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import db from '../db';
import { otaUpdatesTable } from '../db/schema/otaUpdatesTable';
import { otaAssetsTable } from '../db/schema/otaAssetsTable';
import { eq, and, desc } from 'drizzle-orm';
import { AssetUploadDto, PublishUpdateDto, RollbackUpdateDto } from './dto/publish-update.dto';

export interface ActiveManifestMap {
  [key: string]: {
    activeUpdateId: string | null;
    history: string[];
  };
}

@Injectable()
export class UpdatesService {
  private readonly logger = new Logger(UpdatesService.name);
  private readonly storageDir: string;
  private readonly assetsDir: string;
  private readonly manifestsDir: string;
  private readonly activeManifestsPath: string;

  constructor() {
    const rootDir = process.cwd();
    this.storageDir = path.resolve(rootDir, 'uploads', 'updates');
    this.assetsDir = path.join(this.storageDir, 'assets');
    this.manifestsDir = path.join(this.storageDir, 'manifests');
    this.activeManifestsPath = path.join(this.storageDir, 'active-manifests.json');

    this.ensureDirectories();
  }

  private ensureDirectories() {
    try {
      if (!fs.existsSync(this.storageDir)) fs.mkdirSync(this.storageDir, { recursive: true });
      if (!fs.existsSync(this.assetsDir)) fs.mkdirSync(this.assetsDir, { recursive: true });
      if (!fs.existsSync(this.manifestsDir)) fs.mkdirSync(this.manifestsDir, { recursive: true });
      if (!fs.existsSync(this.activeManifestsPath)) {
        fs.writeFileSync(this.activeManifestsPath, JSON.stringify({}), 'utf-8');
      }
    } catch (e) {
      this.logger.warn('Disk storage initialization skipped (Vercel serverless environment)');
    }
  }

  private getPrivateKey(): string | null {
    if (process.env.OTA_PRIVATE_KEY) {
      return process.env.OTA_PRIVATE_KEY.replace(/\\n/g, '\n');
    }
    const rootDir = process.cwd();
    const possiblePaths = [
      path.resolve(rootDir, 'apps', 'mobile', 'certs', 'private-key.pem'),
      path.resolve(rootDir, '..', 'mobile', 'certs', 'private-key.pem'),
      path.resolve(rootDir, 'certs', 'private-key.pem'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    }
    return null;
  }

  validateSecret(secret?: string): void {
    const adminSecret = process.env.OTA_ADMIN_SECRET || 'pocketpilot-ota-secret-key';
    if (!secret || secret !== adminSecret) {
      throw new UnauthorizedException('Invalid OTA Secret Key');
    }
  }

  private getActiveMap(): ActiveManifestMap {
    try {
      if (fs.existsSync(this.activeManifestsPath)) {
        const raw = fs.readFileSync(this.activeManifestsPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      // Ignore on Vercel
    }
    return {};
  }

  private saveActiveMap(map: ActiveManifestMap): void {
    try {
      fs.writeFileSync(this.activeManifestsPath, JSON.stringify(map, null, 2), 'utf-8');
    } catch (e) {
      // Ignore on Vercel
    }
  }

  signManifest(manifestString: string): string {
    const privateKey = this.getPrivateKey();
    if (!privateKey) {
      this.logger.warn('Private key for code signing not found. Returning unsigned manifest.');
      return '';
    }

    try {
      const sign = crypto.createSign('SHA256');
      sign.update(manifestString);
      sign.end();
      return sign.sign(privateKey, 'base64');
    } catch (e) {
      this.logger.error('Failed to sign manifest:', e);
      return '';
    }
  }

  async getLatestManifest(runtimeVersion: string, platform: string, channel: string = 'production') {
    // 1. Try fetching from Neon Postgres Database first (Vercel serverless persistence)
    try {
      if (process.env.DATABASE_URL) {
        const dbRecords = await db
          .select()
          .from(otaUpdatesTable)
          .where(
            and(
              eq(otaUpdatesTable.runtimeVersion, runtimeVersion),
              eq(otaUpdatesTable.platform, platform),
              eq(otaUpdatesTable.channel, channel),
              eq(otaUpdatesTable.isActive, true),
            ),
          )
          .orderBy(desc(otaUpdatesTable.createdAt))
          .limit(1);

        if (dbRecords && dbRecords.length > 0) {
          const record = dbRecords[0];
          const manifest = record.manifest;
          const manifestString = JSON.stringify(manifest);
          const signature = this.signManifest(manifestString);
          return { manifest, manifestString, signature };
        }
      }
    } catch (e) {
      this.logger.warn('Database manifest lookup skipped/failed, trying local file fallback:', e.message);
    }

    // 2. Local File Fallback (for local development / VPS)
    const key = `${runtimeVersion}:${platform}:${channel}`;
    const activeMap = this.getActiveMap();
    const entry = activeMap[key];

    if (!entry || !entry.activeUpdateId) {
      return null;
    }

    const manifestFile = path.join(this.manifestsDir, `${entry.activeUpdateId}.json`);
    if (!fs.existsSync(manifestFile)) {
      return null;
    }

    try {
      const raw = fs.readFileSync(manifestFile, 'utf-8');
      const manifest = JSON.parse(raw);
      const signature = this.signManifest(raw);
      return { manifest, manifestString: raw, signature };
    } catch (e) {
      this.logger.error(`Error reading manifest file ${entry.activeUpdateId}:`, e);
      return null;
    }
  }

  async uploadAsset(dto: AssetUploadDto) {
    if (process.env.DATABASE_URL) {
      try {
        const existing = await db
          .select()
          .from(otaAssetsTable)
          .where(eq(otaAssetsTable.assetPath, dto.path));

        if (existing.length > 0) {
          await db
            .update(otaAssetsTable)
            .set({ contentBase64: dto.contentBase64, contentType: dto.contentType })
            .where(eq(otaAssetsTable.id, existing[0].id));
        } else {
          await db.insert(otaAssetsTable).values({
            assetPath: dto.path,
            contentBase64: dto.contentBase64,
            contentType: dto.contentType,
          });
        }
      } catch (e) {
        this.logger.error('Failed to save asset to Neon Database:', e.message);
      }
    }

    try {
      const targetPath = path.join(this.assetsDir, dto.path);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const buffer = Buffer.from(dto.contentBase64, 'base64');
      fs.writeFileSync(targetPath, buffer);
    } catch (e) {
      // Ignored if on read-only serverless environment
    }
    return { success: true, path: dto.path };
  }

  async uploadAssetBuffer(assetPath: string, buffer: Buffer) {
    if (process.env.DATABASE_URL) {
      try {
        const contentBase64 = buffer.toString('base64');
        const existing = await db
          .select()
          .from(otaAssetsTable)
          .where(eq(otaAssetsTable.assetPath, assetPath));

        if (existing.length > 0) {
          await db
            .update(otaAssetsTable)
            .set({ contentBase64 })
            .where(eq(otaAssetsTable.id, existing[0].id));
        } else {
          await db.insert(otaAssetsTable).values({
            assetPath,
            contentBase64,
          });
        }
      } catch (e) {
        this.logger.error('Failed to save asset buffer to Neon Database:', e.message);
      }
    }

    try {
      const targetPath = path.join(this.assetsDir, assetPath);
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetPath, buffer);
    } catch (e) {
      // Ignored if on read-only serverless environment
    }
    return { success: true, path: assetPath };
  }

  async publishUpdate(dto: PublishUpdateDto) {
    const channel = dto.channel || 'production';
    const updateId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // 1. Build manifest JSON
    const manifest = {
      id: updateId,
      createdAt,
      runtimeVersion: dto.runtimeVersion,
      launchAsset: dto.launchAsset,
      assets: dto.assets,
      metadata: dto.metadata || {},
      extra: {},
    };

    // 2. Persist to Neon Postgres DB if available
    if (process.env.DATABASE_URL) {
      try {
        // Deactivate previous active updates for this runtime/platform/channel
        await db
          .update(otaUpdatesTable)
          .set({ isActive: false })
          .where(
            and(
              eq(otaUpdatesTable.runtimeVersion, dto.runtimeVersion),
              eq(otaUpdatesTable.platform, dto.platform),
              eq(otaUpdatesTable.channel, channel),
            ),
          );

        // Insert new active update
        await db.insert(otaUpdatesTable).values({
          updateId,
          runtimeVersion: dto.runtimeVersion,
          platform: dto.platform,
          channel,
          manifest: manifest as any,
          isActive: true,
        });

        this.logger.log(`Saved OTA update ${updateId} to Neon Postgres Database`);
      } catch (e) {
        this.logger.error('Failed to save update to Neon Postgres Database:', e.message);
      }
    }

    // 3. Fallback file save (for local dev)
    try {
      const manifestString = JSON.stringify(manifest);
      const manifestFile = path.join(this.manifestsDir, `${updateId}.json`);
      fs.writeFileSync(manifestFile, manifestString, 'utf-8');

      const key = `${dto.runtimeVersion}:${dto.platform}:${channel}`;
      const activeMap = this.getActiveMap();
      if (!activeMap[key]) {
        activeMap[key] = { activeUpdateId: null, history: [] };
      }
      activeMap[key].history.push(updateId);
      activeMap[key].activeUpdateId = updateId;
      this.saveActiveMap(activeMap);
    } catch (e) {
      // Ignored on serverless
    }

    this.logger.log(`Published OTA update ${updateId} for ${dto.runtimeVersion}:${dto.platform}:${channel}`);
    return {
      success: true,
      updateId,
      createdAt,
      runtimeVersion: dto.runtimeVersion,
      platform: dto.platform,
      channel,
    };
  }

  async rollbackUpdate(dto: RollbackUpdateDto) {
    const channel = dto.channel || 'production';
    let message = 'Rollback executed';

    // 1. Rollback in Neon Postgres DB
    if (process.env.DATABASE_URL) {
      try {
        if (dto.targetUpdateId) {
          // Set specific update active
          await db
            .update(otaUpdatesTable)
            .set({ isActive: false })
            .where(
              and(
                eq(otaUpdatesTable.runtimeVersion, dto.runtimeVersion),
                eq(otaUpdatesTable.platform, dto.platform),
                eq(otaUpdatesTable.channel, channel),
              ),
            );

          await db
            .update(otaUpdatesTable)
            .set({ isActive: true })
            .where(eq(otaUpdatesTable.updateId, dto.targetUpdateId));
          message = `Rolled back database active state to update ${dto.targetUpdateId}`;
        } else {
          // Deactivate latest active update
          const activeRecords = await db
            .select()
            .from(otaUpdatesTable)
            .where(
              and(
                eq(otaUpdatesTable.runtimeVersion, dto.runtimeVersion),
                eq(otaUpdatesTable.platform, dto.platform),
                eq(otaUpdatesTable.channel, channel),
                eq(otaUpdatesTable.isActive, true),
              ),
            );

          if (activeRecords.length > 0) {
            await db
              .update(otaUpdatesTable)
              .set({ isActive: false })
              .where(eq(otaUpdatesTable.id, activeRecords[0].id));
            message = `Deactivated active OTA update ${activeRecords[0].updateId} in Database. Client will use embedded native bundle.`;
          }
        }
      } catch (e) {
        this.logger.error('Database rollback failed:', e.message);
      }
    }

    // 2. Fallback file rollback
    try {
      const key = `${dto.runtimeVersion}:${dto.platform}:${channel}`;
      const activeMap = this.getActiveMap();
      const entry = activeMap[key];
      if (entry) {
        if (dto.targetUpdateId) {
          entry.activeUpdateId = dto.targetUpdateId;
        } else if (entry.history.length > 1) {
          entry.history.pop();
          entry.activeUpdateId = entry.history[entry.history.length - 1];
        } else {
          entry.activeUpdateId = null;
        }
        this.saveActiveMap(activeMap);
      }
    } catch (e) {
      // Ignored on serverless
    }

    return {
      success: true,
      message,
    };
  }

  getAssetFilePath(assetPath: string): string | null {
    const fullPath = path.join(this.assetsDir, assetPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
    return null;
  }

  async getAssetFromDb(assetPath: string): Promise<Buffer | null> {
    if (process.env.DATABASE_URL) {
      try {
        const records = await db
          .select()
          .from(otaAssetsTable)
          .where(eq(otaAssetsTable.assetPath, assetPath))
          .limit(1);

        if (records.length > 0) {
          return Buffer.from(records[0].contentBase64, 'base64');
        }
      } catch (e) {
        this.logger.error('Database asset lookup failed:', e.message);
      }
    }
    return null;
  }
}
