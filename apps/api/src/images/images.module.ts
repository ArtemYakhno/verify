import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageOwnerGuard } from './guards/image-owner.guard';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { GalleriesModule } from '../galleries/galleries.module';

@Module({
  imports: [CloudinaryModule, GalleriesModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImageOwnerGuard],
})
export class ImagesModule {}
