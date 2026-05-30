import { Injectable, PipeTransform } from '@nestjs/common';
import { GalleriesService } from '../../galleries/galleries.service';

@Injectable()
export class GalleryExistsPipe implements PipeTransform<
  number,
  Promise<number>
> {
  constructor(private readonly galleriesService: GalleriesService) {}

  async transform(galleryId: number): Promise<number> {
    const gallery = await this.galleriesService.findById(galleryId, 'active');
    return gallery.id;
  }
}
