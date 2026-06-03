import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import { CloudinaryService } from '../cloudinary.service';

const mockHttpService = {
  post: jest.fn(),
  axiosRef: {
    get: jest.fn(),
  },
};

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const map: Record<string, string> = {
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
      CLOUDINART_FOLDER: 'uploads',
    };
    return map[key];
  }),
};

function makeAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: {} } as never,
  };
}

function makeAxiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    data,
    status,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: {} } as never,
  };
  return error;
}

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image and return secure_url and public_id', async () => {
      const responseData = {
        secure_url: 'https://cdn.example.com/img.jpg',
        public_id: 'uploads/abc123',
      };
      mockHttpService.post.mockReturnValue(of(makeAxiosResponse(responseData)));

      const result = await service.uploadImage(Buffer.from('img'), 'photo.jpg');

      expect(result).toEqual({
        secure_url: responseData.secure_url,
        public_id: responseData.public_id,
      });
    });

    it('should post to correct Cloudinary upload URL', async () => {
      mockHttpService.post.mockReturnValue(
        of(makeAxiosResponse({ secure_url: 'url', public_id: 'id' })),
      );

      await service.uploadImage(Buffer.from('img'), 'photo.jpg');

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
        expect.anything(),
        expect.anything(),
      );
    });

    it('should throw InternalServerErrorException on Axios error', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => makeAxiosError(400, { error: { message: 'Bad' } })),
      );

      await expect(
        service.uploadImage(Buffer.from('img'), 'photo.jpg'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on generic error', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(
        service.uploadImage(Buffer.from('img'), 'photo.jpg'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteImage', () => {
    it('should call Cloudinary destroy endpoint', async () => {
      mockHttpService.post.mockReturnValue(
        of(makeAxiosResponse({ result: 'ok' })),
      );

      await service.deleteImage('uploads/abc123');

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://api.cloudinary.com/v1_1/test-cloud/image/destroy',
        expect.anything(),
        expect.anything(),
      );
    });

    it('should return deleted status on success', async () => {
      mockHttpService.post.mockReturnValue(
        of(makeAxiosResponse({ result: 'ok' })),
      );

      await expect(service.deleteImage('uploads/abc123')).resolves.toEqual({
        status: 'deleted',
        publicId: 'uploads/abc123',
      });
    });

    it('should return not_found status when Cloudinary responds with not found', async () => {
      mockHttpService.post.mockReturnValue(
        of(makeAxiosResponse({ result: 'not found' })),
      );

      await expect(service.deleteImage('uploads/missing')).resolves.toEqual({
        status: 'not_found',
        publicId: 'uploads/missing',
      });
    });

    it('should throw Error on Axios error', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => makeAxiosError(401, { error: 'Unauthorized' })),
      );

      await expect(service.deleteImage('uploads/abc123')).rejects.toThrow(
        Error,
      );
    });

    it('should throw Error on generic error', async () => {
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('timeout')),
      );

      await expect(service.deleteImage('uploads/abc123')).rejects.toThrow(
        Error,
      );
    });
  });

  describe('downloadImageBuffer', () => {
    it('should return a Buffer from downloaded ArrayBuffer', async () => {
      const arrayBuffer = new TextEncoder().encode('image-bytes').buffer;
      mockHttpService.axiosRef.get.mockResolvedValue({ data: arrayBuffer });

      const result = await service.downloadImageBuffer(
        'https://cdn.example.com/img.jpg',
      );

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(Buffer.from(arrayBuffer));
    });

    it('should call axiosRef.get with responseType: arraybuffer', async () => {
      const arrayBuffer = new ArrayBuffer(0);
      mockHttpService.axiosRef.get.mockResolvedValue({ data: arrayBuffer });

      await service.downloadImageBuffer('https://cdn.example.com/img.jpg');

      expect(mockHttpService.axiosRef.get).toHaveBeenCalledWith(
        'https://cdn.example.com/img.jpg',
        { responseType: 'arraybuffer' },
      );
    });
  });

  describe('generateSignature (via uploadImage)', () => {
    it('should include correct signature in form data', async () => {
      mockHttpService.post.mockReturnValue(
        of(makeAxiosResponse({ secure_url: 'url', public_id: 'id' })),
      );

      await service.uploadImage(Buffer.from('img'), 'photo.jpg');

      const [, formData] = mockHttpService.post.mock.calls[0] as [
        string,
        FormData,
      ];

      const buffer = (formData as unknown as { _streams: unknown[] })._streams;
      const formString = buffer.join('');

      expect(formString).toContain('signature');
    });

    it('should produce deterministic signature for same params', () => {
      const params = { folder: 'uploads', timestamp: 1700000000 };
      const secret = 'test-secret';
      const sorted = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k as keyof typeof params]}`)
        .join('&');

      const expected = crypto
        .createHash('sha256')
        .update(sorted + secret)
        .digest('hex');

      expect(expected).toHaveLength(64);
    });
  });
});
