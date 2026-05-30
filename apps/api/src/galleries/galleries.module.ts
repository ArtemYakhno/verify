import { forwardRef, Module } from '@nestjs/common';
import { GalleriesController } from './galleries.controller';
import { GalleriesService } from './galleries.service';
import { GalleryAccessService } from './gallery-access.service';
import { GalleryCountersService } from './gallery-counters.service';
import { UsersModule } from '../users/users.module';
import { UserExistsPipe } from '../common/pipes/user-exist.pipe';
import { ImagesModule } from '../images/images.module';
@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => ImagesModule)],
  controllers: [GalleriesController],
  providers: [
    GalleriesService,
    GalleryAccessService,
    GalleryCountersService,
    UserExistsPipe,
  ],
  exports: [GalleryAccessService, GalleryCountersService, GalleriesService],
})
export class GalleriesModule {}
