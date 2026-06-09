import { z } from "zod";

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
  { value: "spreadsheet", label: "Spreadsheet" },
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
  { value: "behind", label: "Books are behind" },
  { value: "unreconciled", label: "Accounts are not reconciled" },
  { value: "missing_docs", label: "Missing documents or statements" },
  { value: "qb_messy", label: "QuickBooks is messy" },
  { value: "prior_bk_issue", label: "Prior bookkeeper issue" },
  { value: "unknown", label: "I do not know what is wrong" },
  { value: "other", label: "Other" },
] as const;

// Phone: accept loose formatting; we strip to digits server-side.
const phoneRegex = /^[\d\s\-\+\(\)\.]{7,20}$/;

export const extensionCleanupFormSchema = z.object({
  // Contact
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number").min(7).max(20),
  business_name: z.string().max(120).optional().or(z.literal("")),
  business_website: z.string().max(200).optional().or(z.literal("")),

  // Business details
  entity_type: z.enum(entityTypeOptions.map((o) => o.value) as [string, ...string[]]),
  state: z.string().min(2, "State is required").max(50),
  industry: z.string().max(80).optional().or(z.literal("")),
  bookkeeping_software: z.enum(
    bookkeepingSoftwareOptions.map((o) => o.value) as [string, ...string[]]
  ),

  // Extension status
  filed_extension: z.enum(yesNoUnsureOptions.map((o) => o.value) as [string, ...string[]]),
  deadline_segment: z.enum(
    deadlineSegmentOptions.map((o) => o.value) as [string, ...string[]]
  ),
  extended_because_books: z.enum(["yes", "partly", "no", "unsure"]),
  preparer_requested: z.enum(["yes", "no", "not_yet"]),

  // Bookkeeping status
  reconciled_through_yearend: z.enum(
    reconciledOptions.map((o) => o.value) as [string, ...string[]]
  ),
  months_behind: z.enum(monthsBehindOptions.map((o) => o.value) as [string, ...string[]]),
  accounts_to_review: z.enum(
    accountsToReviewOptions.map((o) => o.value) as [string, ...string[]]
  ),
  business_factors: z
    .array(z.enum(businessFactorsOptions.map((o) => o.value) as [string, ...string[]]))
    .default([]),

  // Help needed
  help_needed: z.enum(helpNeededOptions.map((o) => o.value) as [string, ...string[]]),
  biggest_issue: z.enum(biggestIssueOptions.map((o) => o.value) as [string, ...string[]]),
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

export type ExtensionCleanupFormValues = z.infer<typeof extensionCleanupFormSchema>;
