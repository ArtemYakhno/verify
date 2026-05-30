import { ConfigService } from '@nestjs/config';

export const getMailConfig = (configService: ConfigService) => {
  const host = configService.get<string>('EMAIL_HOST');
  const port = configService.get<number>('EMAIL_PORT');
  const from = configService.get<string>('EMAIL_FROM');

  return {
    transport: {
      host,
      port,
      secure: false,
      ignoreTLS: true,
    },
    defaults: {
      from: `"No Reply" <${from}>`,
    },
  };
};
