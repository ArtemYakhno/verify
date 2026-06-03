import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './services/hash.service';
import { PasswordGeneratorService } from './services/password-generator.service';
import { UserInvitationService } from './services/user-invitation.service';
import { CloudinaryService } from './services/cloudinary.service';
import { getMailConfig } from './configs/mail.config';
import { MediaCleanupService } from './services/media-cleanup.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getMailConfig,
    }),
    HttpModule,
  ],
  providers: [
    HashService,
    PasswordGeneratorService,
    UserInvitationService,
    CloudinaryService,
    MediaCleanupService,
  ],
  exports: [
    HashService,
    PasswordGeneratorService,
    UserInvitationService,
    CloudinaryService,
    MediaCleanupService,
  ],
})
export class CommonModule {}
