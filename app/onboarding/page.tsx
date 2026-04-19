import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingFlow } from "./_components/OnboardingFlow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");

  const user = session.user as {
    dalEmail?: string | null;
    fieldOfStudy?: string | null;
  };

  // Already fully onboarded — send them to the app
  if (user.fieldOfStudy && user.dalEmail) redirect("/");

  const needsDalVerification = !user.dalEmail;
  const initialStep = user.fieldOfStudy ? 1 : 0;

  const { error } = await searchParams;
  const verifyError =
    error === "expired"
      ? "That verification link has expired. Please request a new one."
      : error === "invalid"
        ? "Invalid verification link. Please try again."
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OnboardingFlow
        initialStep={initialStep}
        needsDalVerification={needsDalVerification}
        verifyError={verifyError}
      />
    </div>
  );
}
