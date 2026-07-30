import { z } from "zod";

const optionalEmail = z.union([z.literal(""), z.email("Enter a valid email address")]);
const optionalUrl = z.union([z.literal(""), z.url("Enter a valid URL")]);

const settingsObjectSchema = z.object({
  company_name: z.string().trim().min(2, "Company name is required").max(120),
  legal_name: z.string().trim().max(160),
  tax_number: z.string().trim().max(80),
  phone: z.string().trim().max(40),
  email: optionalEmail,
  website: optionalUrl,
  address: z.string().trim().max(500),
  city: z.string().trim().max(100),
  country: z.string().trim().max(100),
  logo_url: z.string(),
  currency_code: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
  currency_symbol: z.string().trim().min(1).max(8),
  currency_position: z.enum(["before", "after"]),
  decimal_places: z.coerce.number().int().min(0).max(4),
  tax_enabled: z.boolean(),
  tax_name: z.string().trim().min(1).max(30),
  tax_rate: z.coerce.number().min(0).max(100),
  prices_include_tax: z.boolean(),
  invoice_prefix: z.string().trim().min(1).max(12).regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens"),
  invoice_footer: z.string().trim().max(500),
  invoice_terms: z.string().trim().max(1000),
  show_logo_on_invoice: z.boolean(),
  receipt_header: z.string().trim().max(300),
  receipt_footer: z.string().trim().max(500),
  receipt_paper_size: z.enum(["58mm", "80mm", "a4"]),
  email_from_name: z.string().trim().max(120),
  email_from_address: optionalEmail,
  email_reply_to: optionalEmail,
  backup_enabled: z.boolean(),
  backup_frequency: z.enum(["daily", "weekly", "monthly"]),
  backup_retention_days: z.coerce.number().int().min(1).max(3650),
  default_theme: z.enum(["light", "dark", "system"]),
  compact_mode: z.boolean(),
});

const nullableTextFields = [
  "company_name", "legal_name", "tax_number", "phone", "email", "website",
  "address", "city", "country", "logo_url", "currency_code", "currency_symbol",
  "tax_name", "invoice_prefix", "invoice_footer", "invoice_terms",
  "receipt_header", "receipt_footer", "email_from_name", "email_from_address",
  "email_reply_to",
];

export const settingsSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const normalized = { ...value };
  nullableTextFields.forEach((field) => {
    if (normalized[field] == null) normalized[field] = "";
  });
  return normalized;
}, settingsObjectSchema);

export const settingsDefaults = {
  company_name: "Retail POS",
  legal_name: "",
  tax_number: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  country: "",
  logo_url: "",
  currency_code: "PKR",
  currency_symbol: "Rs",
  currency_position: "before",
  decimal_places: 2,
  tax_enabled: false,
  tax_name: "Tax",
  tax_rate: 0,
  prices_include_tax: false,
  invoice_prefix: "INV",
  invoice_footer: "",
  invoice_terms: "",
  show_logo_on_invoice: true,
  receipt_header: "",
  receipt_footer: "",
  receipt_paper_size: "80mm",
  email_from_name: "",
  email_from_address: "",
  email_reply_to: "",
  backup_enabled: false,
  backup_frequency: "weekly",
  backup_retention_days: 30,
  default_theme: "system",
  compact_mode: false,
};
