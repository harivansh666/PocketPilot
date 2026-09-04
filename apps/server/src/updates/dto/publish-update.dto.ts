import { IsString, IsObject, IsOptional, IsArray } from 'class-validator';

export class AssetUploadDto {
  @IsString()
  key: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  ext?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsString()
  contentBase64: string;
}

export class PublishUpdateDto {
  @IsString()
  runtimeVersion: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsObject()
  launchAsset: any;

  @IsArray()
  assets: any[];

  @IsOptional()
  @IsArray()
  assetFiles?: AssetUploadDto[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RollbackUpdateDto {
  @IsString()
  runtimeVersion: string;

  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  targetUpdateId?: string;
}
