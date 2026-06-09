/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { UserInvitationService } from '../user-invitation.service';

const mockMailerService = {
  sendMail: jest.fn(),
};

describe('UserInvitationService', () => {
  let service: UserInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInvitationService,
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<UserInvitationService>(UserInvitationService);
    jest.clearAllMocks();
  });

  describe('sendInviteEmail', () => {
    const params = {
      email: 'john@example.com',
      firstname: 'John',
      temporaryPassword: 'Temp@1234',
    };

    it('should call sendMail with correct recipient and subject', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendInviteEmail(params);

      expect(mockMailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: params.email,
          subject: 'You have been invited',
        }),
      );
    });

    it('should include firstname, email and temporaryPassword in html body', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendInviteEmail(params);

      const { html } = mockMailerService.sendMail.mock.calls[0][0] as {
        html: string;
      };
      expect(html).toContain(params.firstname);
      expect(html).toContain(params.email);
      expect(html).toContain(params.temporaryPassword);
    });

    it('should call sendMail exactly once', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendInviteEmail(params);

      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should propagate error if sendMail throws', async () => {
      const error = new Error('SMTP unavailable');
      mockMailerService.sendMail.mockRejectedValue(error);

      await expect(service.sendInviteEmail(params)).rejects.toThrow(
        'SMTP unavailable',
      );
    });
  });
});
