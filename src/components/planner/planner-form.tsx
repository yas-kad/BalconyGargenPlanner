"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { track } from "@/lib/analytics/track";
import { SAVED_PLAN_KEY, savePendingChat } from "@/lib/chat/pending";
import type { CountryOption } from "@/lib/countries";
import {
  initialAnswers,
  plannerSteps,
  validateStep,
  type FieldErrors,
  type FieldName,
  type PlannerAnswers,
} from "@/lib/planner/answers";
import { encodePhoto } from "@/lib/planner/encode-photo";
import { toPlanAnswers } from "@/lib/planner/submission";
import { PlannerProgress } from "@/components/planner/planner-progress";
import { BalconyStep } from "@/components/planner/steps/balcony-step";
import { LocationStep } from "@/components/planner/steps/location-step";
import { PreferencesStep } from "@/components/planner/steps/preferences-step";
import { buttonStyles } from "@/components/ui/button-styles";

export function PlannerForm({ countries }: { countries: readonly CountryOption[] }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<PlannerAnswers>(initialAnswers);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isStarting, setIsStarting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const step = plannerSteps[stepIndex];
  const isLastStep = stepIndex === plannerSteps.length - 1;

  function updateSection<S extends keyof PlannerAnswers>(
    section: S,
    patch: Partial<PlannerAnswers[S]>,
  ) {
    setAnswers((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const field of Object.keys(patch)) delete next[field as FieldName];
      return next;
    });
  }

  function focusHeading() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      headingRef.current?.focus({ preventScroll: true });
    });
  }

  function focusFirstInvalidField(stepErrors: FieldErrors) {
    const [firstField] = Object.keys(stepErrors);
    requestAnimationFrame(() => {
      const field = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstField}"]`,
      );
      field?.scrollIntoView({ block: "start" });
      field
        ?.querySelector<HTMLElement>("input, select")
        ?.focus({ preventScroll: true });
    });
  }

  function goToStep(index: number) {
    setStepIndex(index);
    setErrors({});
    focusHeading();
  }

  async function startChat() {
    setIsStarting(true);

    const file = answers.balcony.photo;
    // An unreadable photo shouldn't block the plan; the chat works without it.
    const photo = file ? await encodePhoto(file).catch(() => undefined) : undefined;
    const planAnswers = toPlanAnswers(answers);
    try {
      sessionStorage.removeItem(SAVED_PLAN_KEY);
    } catch {
      // Storage can be blocked; the new questionnaire still replaces the pending chat.
    }
    savePendingChat({ answers: planAnswers, photo });

    track("questionnaire_completed", {
      country: planAnswers.location.country,
      hasPhoto: Boolean(photo),
    });
    router.push("/chat");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isStarting) return;

    const stepErrors = validateStep(step.id, answers);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusFirstInvalidField(stepErrors);
      return;
    }

    track("questionnaire_step", { step: stepIndex + 1, stepId: step.id });

    if (!isLastStep) {
      goToStep(stepIndex + 1);
      return;
    }

    void startChat();
  }

  function renderStep() {
    switch (step.id) {
      case "location":
        return (
          <LocationStep
            countries={countries}
            values={answers.location}
            errors={errors}
            onChange={(patch) => updateSection("location", patch)}
          />
        );
      case "balcony":
        return (
          <BalconyStep
            values={answers.balcony}
            errors={errors}
            onChange={(patch) => updateSection("balcony", patch)}
          />
        );
      case "preferences":
        return (
          <PreferencesStep
            values={answers.preferences}
            errors={errors}
            onChange={(patch) => updateSection("preferences", patch)}
          />
        );
    }
  }

  return (
    <div>
      <h1 className="sr-only">Create your balcony plan</h1>
      <PlannerProgress steps={plannerSteps} currentIndex={stepIndex} complete={isStarting} />

      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="planner-step-heading"
        className="mt-8 rounded-[1.75rem] border border-leaf-100 bg-white shadow-sm shadow-leaf-900/5"
      >
        <div className="px-5 pt-7 pb-8 sm:px-8 sm:pt-9 sm:pb-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-leaf-600 uppercase">
            Step {stepIndex + 1} of {plannerSteps.length}
          </p>
          <h2
            id="planner-step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 font-display text-3xl font-medium tracking-tight text-balance outline-none sm:text-4xl"
          >
            {step.heading}
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{step.description}</p>
          <div className="mt-8">{renderStep()}</div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 rounded-b-[1.75rem] border-t border-leaf-100 bg-white/95 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-8 sm:py-5">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => goToStep(stepIndex - 1)}
              className={buttonStyles({ variant: "ghost", className: "-ml-2" })}
            >
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </button>
          )}
          <button
            type="submit"
            aria-disabled={isStarting}
            className={buttonStyles({ className: "ml-auto flex-1 sm:flex-none sm:px-7" })}
          >
            {isStarting ? (
              <>
                Starting your plan
                <LoaderCircle aria-hidden className="size-4 animate-spin" />
              </>
            ) : (
              <>
                {isLastStep ? "Create my plan" : "Next"}
                <ArrowRight aria-hidden className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
