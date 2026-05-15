import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [HttpModule],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
