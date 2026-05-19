import { Module } from '@nestjs/common';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GalleryAccessService } from './gallery-access.service';
@Module({
  imports: [CloudinaryModule],
  controllers: [GalleriesController],
  providers: [GalleriesService, GalleryAccessService],
  exports: [GalleryAccessService],
})
export class GalleriesModule {}
