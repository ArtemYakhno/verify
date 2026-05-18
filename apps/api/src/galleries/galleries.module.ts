import { Module } from '@nestjs/common';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GalleryAccessService } from './gallery-access.service';
import { GalleryOwnerGuard } from '../common/guards/gallery-owner.guard';

@Module({
  imports: [CloudinaryModule],
  controllers: [GalleriesController],
  providers: [GalleriesService, GalleryOwnerGuard, GalleryAccessService],
  exports: [GalleryAccessService],
})
export class GalleriesModule {}
