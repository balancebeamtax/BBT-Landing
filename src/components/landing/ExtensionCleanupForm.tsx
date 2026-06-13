"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  extensionCleanupFormSchema,
  type ExtensionCleanupFormValues,
  entityTypeOptions,
  deadlineSegmentOptions,
  bookkeepingSoftwareOptions,
  roleOptions,
  revenueRangeOptions,
  yesNoUnsureOptions,
  reconciledOptions,
  monthsBehindOptions,
  accountsToReviewOptions,
  businessFactorsOptions,
  helpNeededOptions,
  biggestIssueOptions,
} from "@/lib/schemas/extension-cleanup";
import { usStateOptions } from "@/lib/us-states";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { track, trackOnce } from "@/lib/analytics";
import { CalendlyModal } from "./CalendlyModal";

const FUNNEL_ORIGIN = "extension-cleanup-review";

// ---- Multi-step wizard config (Spec 5) ------------------------------------

type Step = 1 | 2 | 3 | 4 | 5;
type FieldName = keyof ExtensionCleanupFormValues;

const TOTAL_STEPS = 5;
const STORAGE_KEY = "bbt-extension-cleanup-form-v1";

// Required fields gated by the Next button before advancing. Optional fields
// are omitted; the two conditional Step-3 fields are added dynamically when an
// extension was filed (see handleNext), and the consent/superRefine checks run
// at final submit.
const STEP_VALIDATION_FIELDS: Record<Step, readonly FieldName[]> = {
  1: ["first_name", "last_name", "email", "phone"],
  2: ["entity_type", "state", "bookkeeping_software", "role", "revenue_range"],
  3: ["filed_extension", "preparer_requested"],
  4: ["reconciled_through_yearend", "months_behind", "accounts_to_review"],
  5: ["help_needed", "biggest_issue", "consent_sms", "consent_terms"],
};

// Every field owned by each step — used to route a failed final submit back to
// the earliest step that still has an error.
const STEP_ALL_FIELDS: Record<Step, readonly FieldName[]> = {
  1: ["first_name", "last_name", "email", "phone", "business_name", "business_website"],
  2: ["entity_type", "state", "industry", "bookkeeping_software", "role", "revenue_range"],
  3: ["filed_extension", "deadline_segment", "extended_because_books", "preparer_requested"],
  4: ["reconciled_through_yearend", "months_behind", "accounts_to_review", "business_factors"],
  5: ["help_needed", "biggest_issue", "biggest_issue_other", "notes", "consent_sms", "consent_marketing", "consent_terms"],
};

// Move focus to the first focusable control inside the now-visible step
// container so keyboard/screen-reader users land in the new step on navigation.
function focusFirstControl(container: HTMLElement | null) {
  if (!container) return;
  const el = container.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  // preventScroll so the focus jump doesn't fight the smooth scrollIntoView
  // that runs alongside it (see the focus-on-step-change effect).
  el?.focus({ preventScroll: true });
}

function getUrlParam(key: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(key) || "";
}

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-text-deadline">
      {message}
    </p>
  );
}

export function ExtensionCleanupForm() {
  const [submitState, setSubmitState] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [calendlyOpen, setCalendlyOpen] = React.useState(false);
  const [submittedValues, setSubmittedValues] =
    React.useState<ExtensionCleanupFormValues | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  // Anti-bot: timestamp at first render (fill-time check) + honeypot field ref.
  const formRenderTimeRef = React.useRef<number>(Date.now());
  const hpRef = React.useRef<HTMLInputElement>(null);

  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL_EXTENSION_CLEANUP || "";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
    reset,
  } = useForm<ExtensionCleanupFormValues>({
    resolver: zodResolver(extensionCleanupFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      business_name: "",
      business_website: "",
      entity_type: undefined,
      state: undefined,
      industry: "",
      bookkeeping_software: undefined,
      role: undefined,
      revenue_range: undefined,
      filed_extension: undefined,
      // null (not undefined) so the nullable schema validates them as absent
      // when filed_extension === "no" hides them.
      deadline_segment: null,
      extended_because_books: null,
      preparer_requested: undefined,
      reconciled_through_yearend: undefined,
      months_behind: undefined,
      accounts_to_review: undefined,
      business_factors: [],
      help_needed: undefined,
      biggest_issue: undefined,
      biggest_issue_other: "",
      notes: "",
      consent_sms: false,
      consent_marketing: false,
      consent_terms: undefined as unknown as true,
    },
    mode: "onBlur",
  });

  // ---- Wizard step state (Spec 5) -----------------------------------------
  const [currentStep, setCurrentStep] = React.useState<Step>(1);
  // Points at the currently-mounted step container (only one renders at a time),
  // used to move focus into the new step on navigation.
  const stepContainerRef = React.useRef<HTMLDivElement>(null);
  // Set just before a navigation so the focus effect moves focus into the new
  // step — but NOT on the initial mount or sessionStorage restore.
  const shouldFocusStepRef = React.useRef(false);
  // Mirrors currentStep so the debounced value-persist subscription always
  // saves the latest step without re-subscribing on every step change.
  const currentStepRef = React.useRef<Step>(currentStep);
  React.useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Persist form values + step to sessionStorage. The form `values` do NOT
  // contain the freshness-tied anti-bot fields (_hp is an unregistered DOM
  // input; _t is a render-time ref; the turnstile token is added at submit),
  // so nothing freshness-bound is stored and _t naturally regenerates on every
  // remount — satisfying the Spec 5 security note without an explicit strip.
  const persistState = React.useCallback(
    (values: Partial<ExtensionCleanupFormValues>, step: Step) => {
      if (typeof window === "undefined") return;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ values, step }));
      } catch {
        /* sessionStorage may throw in privacy mode / quota — ignore */
      }
    },
    []
  );

  // Restore on mount.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        values?: Partial<ExtensionCleanupFormValues>;
        step?: number;
      };
      if (saved.values) reset(saved.values);
      if (saved.step && saved.step >= 1 && saved.step <= TOTAL_STEPS) {
        setCurrentStep(saved.step as Step);
      }
    } catch {
      /* corrupt payload — ignore and start fresh */
    }
  }, [reset]);

  // Persist on change (debounced 500ms).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: number | undefined;
    const subscription = watch((values) => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        persistState(values as ExtensionCleanupFormValues, currentStepRef.current);
      }, 500);
    });
    return () => {
      if (timer) window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, persistState]);

  // Move focus into the new step (its first control) and scroll that step into
  // view after an explicit navigation. Runs once the new step container has
  // mounted, so both stay in sync for Next, Back, popstate, and onInvalid.
  React.useEffect(() => {
    if (shouldFocusStepRef.current) {
      shouldFocusStepRef.current = false;
      focusFirstControl(stepContainerRef.current);
      stepContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  // Browser back/forward — popstate is the single source that applies history
  // step changes (covers both the browser buttons and the in-form Back, which
  // delegates to history.back()).
  React.useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const step = (e.state as { step?: number } | null)?.step;
      const next: Step = step && step >= 1 && step <= TOTAL_STEPS ? (step as Step) : 1;
      shouldFocusStepRef.current = true;
      setCurrentStep(next);
      persistState(getValues(), next);
      // Scroll + focus are handled by the focus-on-step-change effect.
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [getValues, persistState]);

  async function handleNext() {
    const fields: FieldName[] = [...STEP_VALIDATION_FIELDS[currentStep]];
    if (currentStep === 3 && watch("filed_extension") !== "no") {
      fields.push("deadline_segment", "extended_because_books");
    }
    const valid = await trigger(fields);
    if (!valid) return;

    const next = Math.min(TOTAL_STEPS, currentStep + 1) as Step;
    track("form_step_advance", { step: currentStep, next });
    shouldFocusStepRef.current = true;
    setCurrentStep(next);
    persistState(getValues(), next);
    if (typeof window !== "undefined") {
      window.history.pushState({ step: next }, "", `#step-${next}`);
    }
    // Scroll + focus are handled by the focus-on-step-change effect.
  }

  function handleBack() {
    if (currentStep <= 1) return;
    track("form_step_back", { from: currentStep, to: currentStep - 1 });
    // Delegate to history so the in-form Back and the browser Back stay in
    // sync; the popstate handler applies the step change, scroll, and focus.
    if (typeof window !== "undefined") window.history.back();
  }

  // If a final submit fails validation (e.g. a restored session with an
  // incomplete earlier step), route the user to the earliest step with an error
  // instead of failing silently on a hidden field.
  const onInvalid = (formErrors: Record<string, unknown>) => {
    const erroredFields = Object.keys(formErrors);
    for (const step of [1, 2, 3, 4, 5] as Step[]) {
      if (STEP_ALL_FIELDS[step].some((f) => erroredFields.includes(f))) {
        shouldFocusStepRef.current = true;
        setCurrentStep(step);
        // Scroll + focus are handled by the focus-on-step-change effect.
        return;
      }
    }
  };

  // Fire form_start once on first user interaction.
  const onAnyFocus = React.useCallback(() => {
    trackOnce("extension_cleanup_form_start", "form_start", {
      funnel: FUNNEL_ORIGIN,
    });
    trackOnce(
      "extension_cleanup_form_start_specific",
      "extension_cleanup_form_start"
    );
  }, []);

  const onSubmit = async (values: ExtensionCleanupFormValues) => {
    setSubmitState("submitting");
    setErrorMessage("");

    const payload = {
      ...values,
      form_origin: FUNNEL_ORIGIN,
      page_url: typeof window !== "undefined" ? window.location.href : "",
      submitted_at: new Date().toISOString(),
      business_factors: Array.isArray(values.business_factors)
        ? values.business_factors.join(",")
        : (values.business_factors ?? ""),
      // Only forward the free-text when "Other" is the selected issue.
      biggest_issue_other:
        values.biggest_issue === "other" ? (values.biggest_issue_other ?? "") : "",
      // When no extension was filed, the follow-ups are hidden — send null.
      deadline_segment:
        values.filed_extension === "no" ? null : values.deadline_segment,
      extended_because_books:
        values.filed_extension === "no" ? null : values.extended_because_books,
      utm_source: getUrlParam("utm_source"),
      utm_medium: getUrlParam("utm_medium"),
      utm_campaign: getUrlParam("utm_campaign"),
      utm_content: getUrlParam("utm_content"),
      utm_term: getUrlParam("utm_term"),
      gclid: getUrlParam("gclid"),
      fbclid: getUrlParam("fbclid"),
      _hp: hpRef.current?.value ?? "",
      _t: formRenderTimeRef.current,
    };

    try {
      // Trailing slash required: next.config.mjs sets trailingSlash:true, so
      // POSTing to "/api/landing-lead" 308-redirects to "/api/landing-lead/".
      // Hit the canonical URL directly to avoid the redirect hop.
      const res = await fetch("/api/landing-lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 200) {
        track("generate_lead", {
          funnel: FUNNEL_ORIGIN,
          entity_type: values.entity_type,
          deadline_segment: values.deadline_segment ?? undefined,
        });
        track("extension_cleanup_form_submit", { entity_type: values.entity_type });
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
        setSubmittedValues(values);
        setSubmitState("success");
        setCalendlyOpen(true);
        return;
      }

      if (res.status === 429) {
        setErrorMessage("Too many submissions, please wait a moment and try again.");
        setSubmitState("error");
        return;
      }

      if (res.status === 422) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; field?: string };
        if (body.error === "disposable_email") {
          setErrorMessage("Please use a business email address.");
        } else if (body.error === "session_expired") {
          formRenderTimeRef.current = Date.now() - 5000;
          setErrorMessage("Your session timed out — please press submit again.");
        } else {
          const FIELD_LABELS: Record<string, string> = {
            first_name: "first name", last_name: "last name",
            business_name: "business name", notes: "notes",
            email: "email", phone: "phone",
          };
          const label = body.field ? FIELD_LABELS[body.field] ?? body.field.replace(/_/g, " ") : "";
          setErrorMessage(
            label
              ? `Please check the ${label} field and try again.`
              : "Please check your information and try again."
          );
        }
        setSubmitState("error");
        return;
      }

      setErrorMessage("Something went wrong. Please call us at 888-343-5908 and we will help directly.");
      setSubmitState("error");
    } catch {
      setErrorMessage("Network error. Please try again or call 888-343-5908.");
      setSubmitState("error");
    }
  };

  if (submitState === "success" && submittedValues) {
    return (
      <>
        <div className="rounded-lg border border-border bg-surface p-8 md:p-10 shadow-sm">
          <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
            Thank you. We received your request.
          </h3>
          <p className="text-text-muted mb-6">
            The next step is to schedule your consultation so we can talk
            through what is holding up tax preparation. A confirmation
            email is on its way to{" "}
            <span className="font-semibold text-text-primary">
              {submittedValues.email}
            </span>
            .
          </p>
          <Button
            type="button"
            onClick={() => setCalendlyOpen(true)}
            size="lg"
          >
            Pick a time on the calendar
          </Button>
          <div className="mt-6 text-sm text-text-muted">
            Doesn&apos;t see a time that works?{" "}
            <a
              className="text-cta-primary underline-offset-4 hover:underline font-semibold"
              href={`mailto:dave.rios@balancebeamteam.com?subject=Extension%20Cleanup%20Review%20-%20alternate%20time&body=Hi%20Dave%2C%20I%20submitted%20the%20extension%20cleanup%20form%20but%20the%20available%20times%20don%27t%20work%20for%20me.%20Could%20we%20try%3A%20%5Byour%20preferred%20time%5D`}
            >
              Email me directly with what does
            </a>
            .
          </div>
        </div>
        <CalendlyModal
          open={calendlyOpen}
          onOpenChange={setCalendlyOpen}
          calendlyUrl={calendlyUrl}
          prefill={{
            name: `${submittedValues.first_name} ${submittedValues.last_name}`,
            email: submittedValues.email,
          }}
        />
      </>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onFocus={onAnyFocus}
        noValidate
        className="space-y-8"
      >
        {/* Step 1 — Contact information */}
        {currentStep === 1 && (
        <div ref={stepContainerRef} role="group" aria-label="Contact information" className="scroll-mt-24 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                autoComplete="given-name"
                aria-invalid={!!errors.first_name}
                aria-describedby={errors.first_name ? "first_name-error" : undefined}
                {...register("first_name")}
              />
              <FieldError message={errors.first_name?.message} />
            </div>
            <div>
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                autoComplete="family-name"
                aria-invalid={!!errors.last_name}
                {...register("last_name")}
              />
              <FieldError message={errors.last_name?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 555-5555"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_name">
                Business name{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </Label>
              <Input
                id="business_name"
                autoComplete="organization"
                {...register("business_name")}
              />
            </div>
            <div>
              <Label htmlFor="business_website">
                Business website or social profile{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </Label>
              <Input
                id="business_website"
                inputMode="url"
                {...register("business_website")}
              />
            </div>
          </div>
        </div>
        )}

        {/* Step 2 — Business details */}
        {currentStep === 2 && (
        <div ref={stepContainerRef} role="group" aria-label="Business details" className="scroll-mt-24 space-y-4">
          <div>
            <Label htmlFor="entity_type">Entity type</Label>
            <Controller
              control={control}
              name="entity_type"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="entity_type" aria-invalid={!!errors.entity_type}>
                    <SelectValue placeholder="Select your entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.entity_type?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="state" aria-invalid={!!errors.state}>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStateOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.state?.message} />
            </div>
            <div>
              <Label htmlFor="industry">
                Industry{" "}
                <span className="font-normal text-text-muted">(optional)</span>
              </Label>
              <Input id="industry" {...register("industry")} />
            </div>
          </div>

          <div>
            <Label htmlFor="bookkeeping_software">Current bookkeeping software</Label>
            <Controller
              control={control}
              name="bookkeeping_software"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="bookkeeping_software"
                    aria-invalid={!!errors.bookkeeping_software}
                  >
                    <SelectValue placeholder="Select your current software" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookkeepingSoftwareOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.bookkeeping_software?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">What&apos;s your role?</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.role?.message} />
            </div>
            <div>
              <Label htmlFor="revenue_range">Approx annual revenue?</Label>
              <Controller
                control={control}
                name="revenue_range"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id="revenue_range"
                      aria-invalid={!!errors.revenue_range}
                    >
                      <SelectValue placeholder="Select annual revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueRangeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.revenue_range?.message} />
            </div>
          </div>
        </div>
        )}

        {/* Step 3 — Extension and tax-prep status */}
        {currentStep === 3 && (
        <div ref={stepContainerRef} role="group" aria-label="Extension and tax-prep status" className="scroll-mt-24 space-y-4">
          <RadioField
            name="filed_extension"
            label="Did you file a federal extension for the 2025 tax return?"
            options={yesNoUnsureOptions}
            control={control}
            error={errors.filed_extension?.message}
          />

          {/* Hidden when no extension was filed (Spec 3). shouldUnregister
              stays false (rhf default), so toggling no -> yes restores prior
              answers; payload coerces these to null while "no" is selected. */}
          {watch("filed_extension") !== "no" && (
            <>
              <RadioField
                name="deadline_segment"
                label="Which deadline are you working toward?"
                options={deadlineSegmentOptions}
                control={control}
                error={errors.deadline_segment?.message}
              />

              <RadioField
                name="extended_because_books"
                label="Did you extend because the books were not ready?"
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "partly", label: "Partly" },
                  { value: "no", label: "No" },
                  { value: "unsure", label: "Not sure" },
                ]}
                control={control}
                error={errors.extended_because_books?.message}
              />
            </>
          )}

          <RadioField
            name="preparer_requested"
            label="Has a tax preparer already requested reports, records, or cleanup?"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not_yet", label: "Not yet" },
            ]}
            control={control}
            error={errors.preparer_requested?.message}
          />
        </div>
        )}

        {/* Step 4 — Bookkeeping status */}
        {currentStep === 4 && (
        <div ref={stepContainerRef} role="group" aria-label="Bookkeeping status" className="scroll-mt-24 space-y-4">
          <RadioField
            name="reconciled_through_yearend"
            label="Are your 2025 books reconciled through year-end?"
            options={reconciledOptions}
            control={control}
            error={errors.reconciled_through_yearend?.message}
          />

          <div>
            <Label htmlFor="months_behind">
              How many months are currently unreconciled or incomplete?
            </Label>
            <Controller
              control={control}
              name="months_behind"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="months_behind">
                    <SelectValue placeholder="Select an estimate" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthsBehindOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.months_behind?.message} />
          </div>

          <div>
            <Label htmlFor="accounts_to_review">
              How many bank and credit card accounts need review?
            </Label>
            <Controller
              control={control}
              name="accounts_to_review"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="accounts_to_review">
                    <SelectValue placeholder="Select an estimate" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountsToReviewOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.accounts_to_review?.message} />
          </div>

          <fieldset>
            <legend className="block text-sm font-semibold text-text-primary mb-2">
              Do you have payroll, sales tax, inventory, loans, or contractor
              payments? <span className="font-normal text-text-muted">(select all that apply)</span>
            </legend>
            <Controller
              control={control}
              name="business_factors"
              render={({ field }) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {businessFactorsOptions.map((o) => {
                    const checked = (field.value || []).includes(o.value);
                    return (
                      <label
                        key={o.value}
                        className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 cursor-pointer hover:bg-surface-alt"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const next = new Set(field.value || []);
                            if (c) next.add(o.value);
                            else next.delete(o.value);
                            field.onChange(Array.from(next));
                          }}
                        />
                        <span className="text-base">{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </fieldset>
        </div>
        )}

        {/* Step 5 — What help do you need? + consent + submit */}
        {currentStep === 5 && (
        <div ref={stepContainerRef} role="group" aria-label="What help do you need?" className="scroll-mt-24 space-y-6">
          <div className="space-y-4">
          <div>
            <Label htmlFor="help_needed">What are you looking for?</Label>
            <Controller
              control={control}
              name="help_needed"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="help_needed">
                    <SelectValue placeholder="Select what fits best" />
                  </SelectTrigger>
                  <SelectContent>
                    {helpNeededOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.help_needed?.message} />
          </div>

          <div>
            <Label htmlFor="biggest_issue">
              What is the biggest issue holding up filing?
            </Label>
            <Controller
              control={control}
              name="biggest_issue"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="biggest_issue">
                    <SelectValue placeholder="Select the closest match" />
                  </SelectTrigger>
                  <SelectContent>
                    {biggestIssueOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.biggest_issue?.message} />

            {watch("biggest_issue") === "other" && (
              <div className="mt-3">
                <Label htmlFor="biggest_issue_other">
                  Tell us more{" "}
                  <span className="font-normal text-text-muted">(optional)</span>
                </Label>
                <Input
                  id="biggest_issue_other"
                  aria-invalid={!!errors.biggest_issue_other}
                  {...register("biggest_issue_other")}
                />
                <FieldError message={errors.biggest_issue_other?.message} />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="notes">
              Anything else we should know before the consultation?{" "}
              <span className="font-normal text-text-muted">(optional)</span>
            </Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>
          </div>

          {/* Consent */}
          <fieldset className="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
          <legend className="sr-only">Consent and submission</legend>

          <Controller
            control={control}
            name="consent_sms"
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <span className="text-sm text-text-primary">
                  I agree to receive text messages from Balance Beam at the
                  phone number provided about my consultation and related
                  follow-up. Message and data rates may apply. Reply STOP at
                  any time to opt out.
                </span>
              </label>
            )}
          />

          <Controller
            control={control}
            name="consent_marketing"
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <span className="text-sm text-text-primary">
                  Send me occasional educational emails on bookkeeping and tax
                  topics. <span className="text-text-muted">(Optional.)</span>
                </span>
              </label>
            )}
          />

          <Controller
            control={control}
            name="consent_terms"
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(c) => field.onChange(c === true ? true : undefined)}
                  className="mt-0.5"
                  aria-invalid={!!errors.consent_terms}
                />
                <span className="text-sm text-text-primary">
                  By submitting this form, I&apos;m requesting that Balance Beam
                  Bookkeeping and Tax contact me about bookkeeping cleanup, tax
                  preparation support, or related services. Submitting this
                  form does not create a client relationship.
                </span>
              </label>
            )}
          />
          <FieldError message={errors.consent_terms?.message} />
          </fieldset>
        </div>
        )}

        {/*
          Honeypot: hidden from real users, harvested by bots. Named `fax_number`
          (not website_url / address) so browser autofill never populates it — an
          autofilled honeypot would silently drop a real lead. Value is mapped to
          `_hp` in the POST payload.
        */}
        <input
          ref={hpRef}
          type="text"
          name="fax_number"
          defaultValue=""
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleBack}
              >
                ← Back
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}

            {currentStep < TOTAL_STEPS ? (
              <Button type="button" size="lg" onClick={handleNext}>
                Next →
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={submitState === "submitting"}
              >
                {submitState === "submitting"
                  ? "Sending…"
                  : "Request my cleanup review"}
              </Button>
            )}
          </div>

          {submitState === "error" && (
            <p role="alert" className="text-sm text-text-deadline">
              {errorMessage || "Something went wrong sending your request."}{" "}
              Try again, or email{" "}
              <a
                href="mailto:dave.rios@balancebeamteam.com"
                className="underline font-semibold"
              >
                dave.rios@balancebeamteam.com
              </a>
              .
            </p>
          )}
        </div>
      </form>
    </>
  );
}

// Local helper for label+RadioGroup pattern repeated several times.
function RadioField({
  name,
  label,
  options,
  control,
  error,
}: {
  name: keyof ExtensionCleanupFormValues;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-text-primary mb-2">
        {label}
      </legend>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <RadioGroup
            onValueChange={field.onChange}
            value={(field.value ?? undefined) as string | undefined}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {options.map((o) => (
              <label
                key={o.value}
                className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 cursor-pointer hover:bg-surface-alt"
              >
                <RadioGroupItem value={o.value} />
                <span className="text-base">{o.label}</span>
              </label>
            ))}
          </RadioGroup>
        )}
      />
      <FieldError message={error} />
    </fieldset>
  );
}
