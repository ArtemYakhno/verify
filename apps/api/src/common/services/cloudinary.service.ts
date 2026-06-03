import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import * as crypto from 'crypto';
import { isAxiosError } from 'axios';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly folder = 'uploads';
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.cloudName = this.configService.getOrThrow('CLOUDINARY_CLOUD_NAME');
    this.apiKey = this.configService.getOrThrow('CLOUDINARY_API_KEY');
    this.apiSecret = this.configService.getOrThrow('CLOUDINARY_API_SECRET');
  }

  async uploadImage(
    fileBuffer: Buffer,
    originalFilename: string,
  ): Promise<CloudinaryUploadResponse> {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = this.generateSignature({
      folder: this.folder,
      timestamp,
    });

    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: originalFilename });
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', this.folder);
    formData.append('signature', signature);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<CloudinaryUploadResponse>(
          `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
          formData,
          { headers: formData.getHeaders() },
        ),
      );

      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
      };
    } catch (error) {
      this.logCloudinaryError(error, 'upload', {
        originalFilename,
        folder: this.folder,
      });

      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = this.generateSignature({
      public_id: publicId,
      timestamp,
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);

    try {
      await firstValueFrom(
        this.httpService.post(
          `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
          formData,
          { headers: formData.getHeaders() },
        ),
      );
    } catch (error) {
      this.logCloudinaryError(error, 'delete', { publicId });
      throw new InternalServerErrorException(
        'Failed to delete image from Cloudinary',
      );
    }
  }

  async downloadImageBuffer(url: string): Promise<Buffer> {
    const { data } = await this.httpService.axiosRef.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(data);
  }

  private logCloudinaryError(
    error: unknown,
    action: 'upload' | 'delete',
    meta: Record<string, unknown>,
  ) {
    if (isAxiosError(error)) {
      this.logger.error(
        [
          `Cloudinary ${action} failed`,
          `meta=${JSON.stringify(meta)}`,
          `status=${error.response?.status ?? 'unknown'}`,
          `response=${JSON.stringify(error.response?.data ?? {})}`,
        ].join(' | '),
        error.stack,
      );

      return;
    }

    this.logger.error(
      `Cloudinary ${action} failed | meta=${JSON.stringify(meta)}`,
      error instanceof Error ? error.stack : String(error),
    );
  }

  private generateSignature(params: Record<string, string | number>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    return crypto
      .createHash('sha256')
      .update(sorted + this.apiSecret)
      .digest('hex');
  }
}
