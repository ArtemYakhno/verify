import { forwardRef, Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { GalleriesModule } from '../galleries/galleries.module';
import { ImageAccessService } from './image-access.service';
import { GalleryExistsPipe } from '../common/pipes/gallery-exist.pipe';
@Module({
  imports: [forwardRef(() => GalleriesModule)],
  controllers: [ImagesController],
  providers: [ImagesService, ImageAccessService, GalleryExistsPipe],
  exports: [ImageAccessService, ImagesService],
})
export class ImagesModule {}
