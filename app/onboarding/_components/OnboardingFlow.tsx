"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldOfStudyStep } from "./FieldOfStudyStep";
import { VerifyDalStep } from "./VerifyDalStep";

export function OnboardingFlow({
  initialStep,
  needsDalVerification,
  verifyError,
}: {
  initialStep: number;
  needsDalVerification: boolean;
  verifyError?: string | null;
}) {
  const [step, setStep] = useState(initialStep);
  const totalSteps = needsDalVerification ? 2 : 1;

  function onFieldOfStudyComplete() {
    if (needsDalVerification) {
      setStep(1);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= step ? "bg-foreground" : "bg-border",
            )}
          />
        ))}
      </div>

      {step === 0 && <FieldOfStudyStep onNext={onFieldOfStudyComplete} />}
      {step === 1 && <VerifyDalStep initialError={verifyError} />}
    </div>
  );
}
