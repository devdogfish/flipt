import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { emailButton, emailWrapper } from "@/lib/email";

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

function welcomeEmailHtml(name: string) {
  const firstName = name?.split(" ")[0] || "there";
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:560px;margin:40px auto;padding:0 16px;">
<p>Hey ${firstName},</p>
<p>My name is Luigi — I built <a href="https://flashcardbrowser.com">Flashcardbrowser</a>.</p>
<p>The idea is simple: a shared library of flashcard decks specific to Dal courses, so students don't have to rebuild the same material from scratch every semester.</p>
<p>Here are 3 things to get started:</p>
<ol>
  <li><a href="https://flashcardbrowser.com/decks">Browse decks for your Dal courses</a></li>
  <li><a href="https://flashcardbrowser.com/decks/new">Create a deck for a course you're enrolled in</a></li>
  <li><a href="https://flashcardbrowser.com/decks/import">Generate cards from your lecture notes with AI</a></li>
</ol>
<p><strong>P.S.: What brought you here? And what would you like to see in Flashcardbrowser in the future?</strong></p>
<p>Hit "Reply" and let me know. I read and reply to every email.</p>
<p>Cheers,<br>Luigi</p>
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
              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { dalEmail: record.email },
                });
              } catch (e: any) {
                if (e?.code !== "P2002") throw e;
                // concurrent hook call already set dalEmail — safe to ignore
              }
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
