import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, name: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/change-password?token=${token}`;
    const companyName = 'factuYana';

    await this.mailerService.sendMail({
      to: email,
      subject: '🔒 Restablece tu contraseña',
      template: './reset-password',
      context: {
        name,
        resetUrl,
        companyName,
        year: new Date().getFullYear(),
      },
    });
  }
}
