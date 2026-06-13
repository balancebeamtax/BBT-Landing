import { z } from "zod";
import { usStateOptions } from "@/lib/us-states";

// Zod schema for the /extension-cleanup-review intake form.
// Field names match the GHL workflow build spec (Section A.1 payload contract).

export const entityTypeOptions = [
  { value: "sole_prop", label: "Schedule C / sole proprietor" },
  { value: "smllc_1040", label: "Single-member LLC filing with Form 1040" },
  { value: "partnership", label: "Partnership / multi-member LLC" },
  { value: "s_corp", label: "S corporation" },
  { value: "c_corp", label: "C corporation" },
  { value: "unsure", label: "Not sure" },
] as const;

export const deadlineSegmentOptions = [
  { value: "scorp_partnership_sep15", label: "September 15, 2026 (S corp / partnership)" },
  { value: "schedule_c_oct15", label: "October 15, 2026 (Schedule C / single-member LLC)" },
  { value: "unsure", label: "Not sure" },
] as const;

export const bookkeepingSoftwareOptions = [
  { value: "qbo", label: "QuickBooks Online" },
  { value: "qb_desktop", label: "QuickBooks Desktop" },
  { value: "xero", label: "Xero" },
  { value: "excel_or_sheets", label: "Excel or Google Sheets" },
  { value: "none", label: "No system" },
  { value: "unsure", label: "Not sure" },
] as const;

export const yesNoUnsureOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
] as const;

export const reconciledOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partly", label: "Partly" },
  { value: "unsure", label: "Not sure" },
] as const;

export const monthsBehindOptions = [
  { value: "none", label: "None" },
  { value: "1_3", label: "1 to 3 months" },
  { value: "4_6", label: "4 to 6 months" },
  { value: "7_12", label: "7 to 12 months" },
  { value: "12_plus", label: "More than 12 months" },
  { value: "unsure", label: "Not sure" },
] as const;

export const accountsToReviewOptions = [
  { value: "1_2", label: "1 to 2" },
  { value: "3_5", label: "3 to 5" },
  { value: "6_plus", label: "6 or more" },
  { value: "unsure", label: "Not sure" },
] as const;

export const businessFactorsOptions = [
  { value: "payroll", label: "Payroll" },
  { value: "sales_tax", label: "Sales tax" },
  { value: "inventory", label: "Inventory" },
  { value: "loans", label: "Business loans" },
  { value: "contractors", label: "Contractor payments" },
  { value: "none", label: "None of these" },
  { value: "unsure", label: "Not sure" },
] as const;

export const helpNeededOptions = [
  { value: "cleanup_before_prep", label: "Cleanup before tax preparation" },
  { value: "catch_up", label: "Catch-up bookkeeping" },
  { value: "tax_prep_books_review", label: "Tax preparation and books review" },
  { value: "monthly_after_filing", label: "Monthly bookkeeping after filing" },
  { value: "back_filing", label: "Back-filing or prior-year help" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const biggestIssueOptions = [
  { value: "no_trusted_bookkeeper", label: "I haven't found a bookkeeper I can trust" },
  { value: "no_money_to_start", label: "I don't have the money to begin" },
  { value: "previous_bookkeeper_withholding", label: "My other bookkeeper is holding on to necessary information" },
  { value: "dont_know_where_to_begin", label: "I have no idea where to begin" },
  { value: "other", label: "Other" },
] as const;

export const roleOptions = [
  { value: "owner", label: "Owner" },
  { value: "cfo_controller", label: "CFO or Controller" },
  { value: "bookkeeper", label: "Internal bookkeeper" },
  { value: "office_manager", label: "Office manager" },
  { value: "other", label: "Other" },
] as const;

export const revenueRangeOptions = [
  { value: "under_100k", label: "Under $100K" },
  { value: "100k_500k", label: "$100K–$500K" },
  { value: "500k_1m", label: "$500K–$1M" },
  { value: "1m_5m", label: "$1M–$5M" },
  { value: "over_5m", label: "Over $5M" },
  { value: "prefer_not_say", label: "Prefer not to say" },
] as const;

// Phone: accept loose formatting; we strip to digits server-side.
const phoneRegex = /^[\d\s\-\+\(\)\.]{7,20}$/;

// Base object schema. Kept internal and separate from the exported client
// schema because the conditional-required rule is added via `.superRefine()`,
// which yields a ZodEffects — and ZodEffects has no `.extend()`/`.strict()`.
// serverPayloadSchema therefore extends THIS object, then applies the same
// refinement, so both client and server enforce identical conditional logic.
const extensionCleanupFormObject = z.object({
  // Contact
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number").min(7).max(20),
  business_name: z.string().max(120).optional().or(z.literal("")),
  business_website: z.string().max(200).optional().or(z.literal("")),

  // Business details
  entity_type: z.enum(entityTypeOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select your entity type" }),
  }),
  state: z.enum(usStateOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select your state" }),
  }),
  industry: z.string().max(80).optional().or(z.literal("")),
  bookkeeping_software: z.enum(
    bookkeepingSoftwareOptions.map((o) => o.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Select your current bookkeeping software" }) }
  ),
  role: z.enum(roleOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select your role" }),
  }),
  revenue_range: z.enum(
    revenueRangeOptions.map((o) => o.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Select your approximate annual revenue" }) }
  ),

  // Extension status
  filed_extension: z.enum(yesNoUnsureOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select whether you filed an extension" }),
  }),
  // Conditional on filed_extension !== "no". Nullable so they can submit as
  // null when hidden; conditional-required is enforced by applyConditionalRules.
  deadline_segment: z
    .enum(deadlineSegmentOptions.map((o) => o.value) as [string, ...string[]], {
      errorMap: () => ({ message: "Select the deadline that applies to you" }),
    })
    .nullable(),
  extended_because_books: z
    .enum(["yes", "partly", "no", "unsure"], {
      errorMap: () => ({ message: "Tell us whether the books drove the extension" }),
    })
    .nullable(),
  preparer_requested: z.enum(["yes", "no", "not_yet"], {
    errorMap: () => ({ message: "Tell us if your preparer has asked for reports" }),
  }),

  // Bookkeeping status
  reconciled_through_yearend: z.enum(
    reconciledOptions.map((o) => o.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Select your reconciliation status" }) }
  ),
  months_behind: z.enum(monthsBehindOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Estimate how many months are unreconciled" }),
  }),
  accounts_to_review: z.enum(
    accountsToReviewOptions.map((o) => o.value) as [string, ...string[]],
    { errorMap: () => ({ message: "Estimate how many accounts need review" }) }
  ),
  business_factors: z
    .array(z.enum(businessFactorsOptions.map((o) => o.value) as [string, ...string[]]))
    .default([]),

  // Help needed
  help_needed: z.enum(helpNeededOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select what you are looking for" }),
  }),
  biggest_issue: z.enum(biggestIssueOptions.map((o) => o.value) as [string, ...string[]], {
    errorMap: () => ({ message: "Select the biggest issue holding up filing" }),
  }),
  // Optional free text revealed when biggest_issue === "other". Not required
  // even when "other" is selected (see Spec 4). Submits as "" otherwise.
  biggest_issue_other: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),

  // Consent (TCPA + marketing)
  consent_sms: z.boolean().refine((v) => v === true || v === false, {
    message: "Indicate your SMS preference",
  }),
  consent_marketing: z.boolean().optional().default(false),
  consent_terms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the consent statement to submit" }),
  }),
});

// Conditional-required rule shared by the client and server schemas: when an
// extension was filed (or might have been), both follow-up answers are
// required; when filed_extension === "no" they are hidden and submit as null.
// Typed structurally so it applies to both the base output and the wider
// server payload output.
function applyConditionalRules(
  data: {
    filed_extension: string;
    deadline_segment: string | null;
    extended_because_books: string | null;
  },
  ctx: z.RefinementCtx
) {
  if (data.filed_extension !== "no") {
    if (!data.deadline_segment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadline_segment"],
        message: "Select the deadline that applies to you",
      });
    }
    if (!data.extended_because_books) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["extended_because_books"],
        message: "Tell us whether the books drove the extension",
      });
    }
  }
}

export const extensionCleanupFormSchema =
  extensionCleanupFormObject.superRefine(applyConditionalRules);

export type ExtensionCleanupFormValues = z.infer<typeof extensionCleanupFormSchema>;

// Server-side payload contract for POST /api/landing-lead.
// Built from the plain base ZodObject (so `.extend()`/`.strict()` are available),
// extended with transport metadata, marketing attribution, and anti-bot fields.
// `.strict()` rejects any key not declared here. `business_factors` arrives as a
// comma-joined string on the wire (the form joins the multi-select before POST),
// so the array field from the base schema is overridden to a string. The same
// conditional-required refinement as the client schema is applied last, so a
// hand-crafted POST with filed_extension !== "no" and a null follow-up is
// rejected server-side too.
export const serverPayloadSchema = extensionCleanupFormObject
  .extend({
    form_origin: z.literal("extension-cleanup-review"),
    page_url: z.string().url().max(2048),
    submitted_at: z.string().datetime(),
    utm_source: z.string().max(200).regex(/^[^\x00-\x1F\x7F]*$/).default(""),
    utm_medium: z.string().max(200).regex(/^[^\x00-\x1F\x7F]*$/).default(""),
    utm_campaign: z.string().max(200).regex(/^[^\x00-\x1F\x7F]*$/).default(""),
    utm_content: z.string().max(200).regex(/^[^\x00-\x1F\x7F]*$/).default(""),
    utm_term: z.string().max(200).regex(/^[^\x00-\x1F\x7F]*$/).default(""),
    gclid: z.string().max(500).regex(/^[A-Za-z0-9_\-.]*$/).default(""),
    fbclid: z.string().max(500).regex(/^[A-Za-z0-9_\-.]*$/).default(""),
    business_factors: z.string().max(200).default(""),
    _hp: z.string().max(0, "honeypot must be empty").default(""),
    _t: z.number().int().positive(),
    _turnstile_token: z.string().max(2000).optional(),
  })
  .strict()
  .superRefine(applyConditionalRules);

export type ServerPayload = z.infer<typeof serverPayloadSchema>;
