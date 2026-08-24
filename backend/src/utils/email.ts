import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendResetPasswordEmail(email: string, prenom: string, resetUrl: string) {
  if (!resend) {
    console.log('\n==================================================');
    console.log(`[DEV EMAIL] Réinitialisation de mot de passe pour ${prenom} (${email})`);
    console.log(`Lien : ${resetUrl}`);
    console.log('==================================================\n');
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Jeunes Blogueurs <noreply@tondomaine.ci>',
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <h2 style="color: #18181b; margin-bottom: 16px;">Bonjour ${prenom},</h2>
        <p style="color: #3f3f46; line-height: 1.5;">Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme <strong>Jeunes Blogueurs</strong>.</p>
        <p style="color: #3f3f46; line-height: 1.5;">Ce lien est valable pendant <strong>30 minutes</strong> :</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="color: #71717a; font-size: 13px; line-height: 1.4;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité — votre mot de passe actuel restera inchangé.
        </p>
      </div>
    `
  });
}