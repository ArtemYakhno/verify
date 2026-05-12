import { Module } from '@nestjs/common';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { GalleryOwnerGuard } from './guards/gallery-owner.guard';

@Module({
  controllers: [GalleriesController],
  providers: [GalleriesService, GalleryOwnerGuard],
})
export class GalleriesModule {}
