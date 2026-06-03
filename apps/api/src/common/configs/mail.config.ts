import { ConfigService } from '@nestjs/config';

const toBool = (value?: string) => value === 'true';
const toNumber = (value?: string, fallback?: number) =>
  value ? Number(value) : fallback;

export const getMailConfig = (configService: ConfigService) => {
  const host = configService.get<string>('EMAIL_HOST');
  const port = toNumber(configService.get<string>('EMAIL_PORT'), 1025);
  const from =
    configService.get<string>('EMAIL_FROM') ?? 'no-reply@example.com';

  const secure = toBool(configService.get<string>('EMAIL_SECURE'));
  const ignoreTLS = toBool(configService.get<string>('EMAIL_IGNORE_TLS'));
  const requireTLS = toBool(configService.get<string>('EMAIL_REQUIRE_TLS'));

  const user = configService.get<string>('EMAIL_USER');
  const pass = configService.get<string>('EMAIL_PASSWORD');
  const replyTo = configService.get<string>('EMAIL_REPLY_TO');

  return {
    transport: {
      host,
      port,
      secure,
      ignoreTLS,
      requireTLS,
      ...(user && pass
        ? {
            auth: {
              user,
              pass,
            },
          }
        : {}),
    },
    defaults: {
      from: `"No Reply" <${from}>`,
      ...(replyTo ? { replyTo } : {}),
    },
  };
};
