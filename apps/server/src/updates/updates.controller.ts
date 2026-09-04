import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Query,
  Req,
  Res,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import express from 'express';
import { UpdatesService } from './updates.service';
import { AssetUploadDto, PublishUpdateDto, RollbackUpdateDto } from './dto/publish-update.dto';

@Controller('updates')
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) { }

  @Get('manifest')
  async getManifest(
    @Req() req: express.Request,
    @Res({ passthrough: false }) res: express.Response,
    @Query('runtimeVersion') qRuntimeVersion?: string,
    @Query('platform') qPlatform?: string,
    @Query('channel') qChannel?: string,
  ) {
    const runtimeVersion =
      (req.headers['expo-runtime-version'] as string) || qRuntimeVersion || '1.0.0';
    const platform = (req.headers['expo-platform'] as string) || qPlatform || 'android';
    const channel = (req.headers['expo-channel-name'] as string) || qChannel || 'production';
    const currentUpdateId =
      (req.headers['expo-current-update-id'] as string) || (req.headers['if-none-match'] as string);

    const update = await this.updatesService.getLatestManifest(runtimeVersion, platform, channel);

    // If no compatible update found
    if (!update) {
      res.setHeader('expo-protocol-version', '1');
      res.setHeader('expo-sfv-version', '0');
      return res.status(204).end();
    }

    // If client is already running this exact update ID
    if (currentUpdateId && currentUpdateId.replace(/"/g, '') === update.manifest.id) {
      res.setHeader('expo-protocol-version', '1');
      res.setHeader('expo-sfv-version', '0');
      return res.status(204).end();
    }

    // Return 200 OK + Signed Expo Protocol v1 Manifest
    res.setHeader('expo-protocol-version', '1');
    res.setHeader('expo-sfv-version', '0');
    if (update.signature) {
      res.setHeader('expo-signature', `sig="${update.signature}", keyid="main"`);
    }
    res.setHeader('etag', `"${update.manifest.id}"`);
    res.setHeader('content-type', 'application/json');

    return res.status(200).send(update.manifestString);
  }

  @Get('assets/*path')
  async getAsset(
    @Req() req: express.Request,
    @Res({ passthrough: false }) res: express.Response,
  ) {
    // Extract asset path after /api/updates/assets/
    const urlPath = req.path.replace(/^\/api\/updates\/assets\//, '').replace(/^\/updates\/assets\//, '');
    const filePath = this.updatesService.getAssetFilePath(urlPath);

    if (!filePath) {
      throw new NotFoundException(`Asset ${urlPath} not found`);
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(filePath);
  }

  @Post('upload-asset')
  @HttpCode(200)
  async uploadAsset(
    @Headers('x-ota-secret') otaSecret: string,
    @Headers('x-asset-path') assetPathHeader: string,
    @Req() req: express.Request,
  ) {
    this.updatesService.validateSecret(otaSecret);

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    if (assetPathHeader) {
      return this.updatesService.uploadAssetBuffer(assetPathHeader, buffer);
    }

    try {
      const dto: AssetUploadDto = JSON.parse(buffer.toString('utf-8'));
      return this.updatesService.uploadAsset(dto);
    } catch {
      return { success: true };
    }
  }

  @Post('publish')
  @HttpCode(200)
  async publishUpdate(
    @Headers('x-ota-secret') otaSecret: string,
    @Body() dto: PublishUpdateDto,
  ) {
    this.updatesService.validateSecret(otaSecret);
    return this.updatesService.publishUpdate(dto);
  }

  @Post('rollback')
  @HttpCode(200)
  async rollbackUpdate(
    @Headers('x-ota-secret') otaSecret: string,
    @Body() dto: RollbackUpdateDto,
  ) {
    this.updatesService.validateSecret(otaSecret);
    return this.updatesService.rollbackUpdate(dto);
  }
}
