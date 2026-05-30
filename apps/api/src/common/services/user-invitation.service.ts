import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserInvitationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendInviteEmail(params: {
    email: string;
    firstname: string;
    temporaryPassword: string;
  }) {
    await this.mailerService.sendMail({
      to: params.email,
      subject: 'You have been invited',
      html: `
        <p>Hello, ${params.firstname}.</p>
        <p>Your account has been created.</p>
        <p><b>Email:</b> ${params.email}</p>
        <p><b>Temporary password:</b> ${params.temporaryPassword}</p>
        <p>Please sign in and change your password immediately.</p>
      `,
    });
  }
}
