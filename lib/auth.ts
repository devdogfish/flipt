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

// TODO: Update this to your verified Resend sender domain
const FROM_EMAIL = "noreply@flashcardbrowser.cards";
const APP_NAME = "flashcardbrowser";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://flashcardbrowser.cards",
    "https://www.flashcardbrowser.cards",
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
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Reset your ${APP_NAME} password`,
        text: `Click the link below to reset your password. This link expires in 1 hour.\n\n${url}`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `Verify your ${APP_NAME} email`,
        text: `Click the link below to verify your email address.\n\n${url}`,
      });
    },
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `Your ${APP_NAME} sign-in link`,
          text: `Click the link below to sign in. This link expires in 5 minutes.\n\n${url}`,
        });
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
