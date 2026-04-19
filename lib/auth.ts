import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "noreply@flashcardbrowser.com";
const FROM_LUIGI = "Luigi from flashcardbrowser <luigi@flashcardbrowser.com>";
const APP_NAME = "flashcardbrowser";

function emailButton(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#FFD400;color:#000;font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;font-family:sans-serif;">${label}</a>`;
}

function emailWrapper(body: string, url: string) {
  return `<!DOCTYPE html><html><body style="background:#f5f5f5;margin:0;padding:40px 0;font-family:sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
  <div style="background:#000;padding:24px 32px;">
    <span style="color:#FFD400;font-size:20px;font-weight:700;letter-spacing:-0.5px;">flashcardbrowser.</span>
  </div>
  <div style="padding:32px;">
    ${body}
    <p style="color:#aaa;font-size:12px;margin-top:32px;">Or copy and paste this link into your browser:<br>
    <span style="color:#555;word-break:break-all;">${url}</span></p>
    <p style="color:#aaa;font-size:12px;margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</div>
</body></html>`;
}

function welcomeEmailHtml(name: string) {
  const firstName = name?.split(" ")[0] || "there";
  return `<!DOCTYPE html><html><body style="background:#f5f5f5;margin:0;padding:40px 0;font-family:sans-serif;">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;">
  <div style="background:#000;padding:24px 32px;">
    <span style="color:#FFD400;font-size:20px;font-weight:700;letter-spacing:-0.5px;">flashcardbrowser.</span>
  </div>
  <div style="padding:32px;">
    <p style="color:#111;font-size:16px;margin:0 0 16px;">Hey ${firstName},</p>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
      My name is Luigi — I built flashcardbrowser. Thanks for signing up, it genuinely means a lot.
    </p>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
      The whole point of flashcardbrowser is to build a shared index of flashcard decks that's extremely specific to Dal courses —
      so students don't have to recreate the same decks from scratch every year. You study smarter, and whatever you contribute stays useful for the next person.
    </p>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">
      I'd love to know what would make flashcardbrowser your go-to study tool. What's missing? What would make you actually use it every week?
    </p>
    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Hit reply and let me know — I read every response personally.
    </p>
    <p style="color:#111;font-size:15px;margin:0;">— Luigi<br>
    <span style="color:#aaa;font-size:13px;">Creator of flashcardbrowser &nbsp;·&nbsp; <a href="https://flashcardbrowser.com" style="color:#aaa;">flashcardbrowser.com</a></span></p>
  </div>
</div>
</body></html>`;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://flashcardbrowser.com",
    "https://www.flashcardbrowser.com",
    "http://localhost:3000",
  ],

  user: {
    additionalFields: {
      dalEmail: {
        type: "string",
        nullable: true,
        required: false,
        input: false,
      },
      fieldOfStudy: {
        type: "string",
        nullable: true,
        required: false,
        input: true,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const cleanUrl = url.replace(/\s/g, "");
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Reset your ${APP_NAME} password`,
        html: emailWrapper(`
          <h2 style="margin:0 0 8px;font-size:22px;">Reset your password</h2>
          <p style="color:#555;margin:0 0 24px;">Click the button below to reset your password. This link expires in 1 hour.</p>
          ${emailButton(cleanUrl, "Reset password")}
        `, cleanUrl),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const cleanUrl = url.replace(/\s/g, "");
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Verify your email — ${APP_NAME}`,
        html: emailWrapper(`
          <h2 style="margin:0 0 8px;font-size:22px;">Welcome to ${APP_NAME}!</h2>
          <p style="color:#555;margin:0 0 24px;">Thanks for signing up. Click the button below to verify your email address and get started.</p>
          ${emailButton(cleanUrl, "Verify my email")}
        `, cleanUrl),
      });
    },
  },

  databaseHooks: {
    user: {
      update: {
        after: async (user) => {
          if (!user.emailVerified) return;
          try {
            const record = await prisma.user.findUnique({
              where: { id: user.id },
              select: { email: true, dalEmail: true, welcomeEmailSent: true },
            });
            if (!record) return;

            // Auto-verify Dal email when user signed up with @dal.ca
            if (record.email.endsWith("@dal.ca") && !record.dalEmail) {
              await prisma.user.update({
                where: { id: user.id },
                data: { dalEmail: record.email },
              });
            }

            if (record.welcomeEmailSent) return;
            // Mark first to prevent duplicate sends on concurrent updates
            await prisma.user.update({
              where: { id: user.id },
              data: { welcomeEmailSent: true },
            });
            await getResend().emails.send({
              from: FROM_LUIGI,
              to: user.email,
              subject: "A quick note from the creator of flashcardbrowser",
              html: welcomeEmailHtml(user.name || ""),
            });
          } catch (err) {
            console.error("[welcome-email] failed to send:", err);
          }
        },
      },
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const cleanUrl = url.replace(/\s/g, "");
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Your ${APP_NAME} sign-in link`,
          html: emailWrapper(`
            <h2 style="margin:0 0 8px;font-size:22px;">Sign in to ${APP_NAME}</h2>
            <p style="color:#555;margin:0 0 24px;">Click the button below to sign in. This link expires in 5 minutes.</p>
            ${emailButton(cleanUrl, "Sign in")}
          `, cleanUrl),
        });
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
