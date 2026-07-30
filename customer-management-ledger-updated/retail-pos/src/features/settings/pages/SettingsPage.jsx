import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  DatabaseBackup,
  FileText,
  Mail,
  Palette,
  ReceiptText,
  Save,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useTheme from "@/hooks/useTheme";

import {
  FormInput,
  FormSelect,
  FormTextarea,
  LoadingSkeleton,
  PageHeader,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import useAuthStore from "@/store/authStore";
import SettingsSection from "../components/SettingsSection";
import {
  useSettings,
  useUpdateSettings,
  useUploadCompanyLogo,
} from "../hooks/useSettings";
import { settingsDefaults, settingsSchema } from "../schemas/settingsSchema";
import useSettingsStore from "../store/settingsStore";

const normalizeFormSettings = (values = {}) => Object.fromEntries(
  Object.entries(settingsDefaults).map(([key, defaultValue]) => [
    key,
    values?.[key] ?? defaultValue,
  ])
);

const sections = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "invoice", label: "Invoice & Tax", icon: FileText },
  { id: "receipt", label: "Receipt", icon: ReceiptText },
  { id: "email", label: "Email", icon: Mail },
  { id: "backup", label: "Backup", icon: DatabaseBackup },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function ToggleField({ label, description, registration, disabled }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <input
        type="checkbox"
        disabled={disabled}
        className="mt-1 size-4 accent-blue-600"
        {...registration}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const activeSection = useSettingsStore((state) => state.activeSection);
  const setActiveSection = useSettingsStore((state) => state.setActiveSection);
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const canManage = role?.slug === "admin" || permissions.includes("settings.manage") || (Boolean(user) && !role);
  const { setTheme } = useTheme();
  const { data, isLoading, isError, error } = useSettings();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: settingsDefaults,
  });

  const update = useUpdateSettings({
    onSuccess: (settings) => {
      reset(normalizeFormSettings(settings));
      setTheme(settings.default_theme);
      toast.success("Settings saved");
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  const uploadLogo = useUploadCompanyLogo({
    onSuccess: (url) => {
      setValue("logo_url", url, { shouldDirty: true, shouldValidate: true });
      toast.success("Logo uploaded. Save settings to apply it.");
    },
    onError: (uploadError) => toast.error(uploadError.message),
  });

  useEffect(() => {
    if (data) reset(normalizeFormSettings(data));
  }, [data, reset]);

  const logoUrl = watch("logo_url");
  const taxEnabled = watch("tax_enabled");
  const backupEnabled = watch("backup_enabled");

  const fieldProps = (name) => ({
    disabled: !canManage,
    error: errors[name]?.message,
    ...register(name),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage company identity, documents, localization, backups, and appearance."
          actions={
            canManage ? (
              <Button
                size="lg"
                disabled={!isDirty || update.isPending}
                onClick={handleSubmit((values) => update.mutate(values))}
              >
                <Save />
                {update.isPending ? "Saving..." : "Save changes"}
              </Button>
            ) : null
          }
        />

        {!canManage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            You have read-only access. An administrator can change these settings.
          </div>
        ) : null}

        {isLoading ? <LoadingSkeleton rows={7} /> : null}
        {isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load settings: {error.message}
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Settings sections">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    activeSection === id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>

            <form onSubmit={handleSubmit((values) => update.mutate(values))} className="min-w-0">
              {activeSection === "company" ? (
                <SettingsSection
                  title="Company profile"
                  description="Details shown across invoices, receipts, reports, and emails."
                >
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm font-medium">Company logo</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Company logo" className="size-full object-contain p-2" />
                        ) : (
                          <Building2 className="size-9 text-slate-400" />
                        )}
                      </div>
                      {canManage ? (
                        <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                          {uploadLogo.isPending ? "Uploading..." : "Upload logo"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            className="sr-only"
                            disabled={uploadLogo.isPending}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) uploadLogo.mutate(file);
                              event.target.value = "";
                            }}
                          />
                        </label>
                      ) : null}
                      <span className="text-xs text-slate-500">PNG, JPG, WebP, or SVG. Maximum 2 MB.</span>
                    </div>
                  </div>
                  <FormInput label="Company name" required {...fieldProps("company_name")} />
                  <FormInput label="Legal name" {...fieldProps("legal_name")} />
                  <FormInput label="Tax / registration number" {...fieldProps("tax_number")} />
                  <FormInput label="Phone" {...fieldProps("phone")} />
                  <FormInput label="Email" type="email" {...fieldProps("email")} />
                  <FormInput label="Website" type="url" placeholder="https://example.com" {...fieldProps("website")} />
                  <FormTextarea label="Address" className="sm:col-span-2" {...fieldProps("address")} />
                  <FormInput label="City" {...fieldProps("city")} />
                  <FormInput label="Country" {...fieldProps("country")} />
                </SettingsSection>
              ) : null}

              {activeSection === "invoice" ? (
                <div className="space-y-5">
                  <SettingsSection title="Currency" description="Default money formatting throughout the system.">
                    <FormInput label="ISO currency code" required maxLength={3} {...fieldProps("currency_code")} />
                    <FormInput label="Currency symbol" required {...fieldProps("currency_symbol")} />
                    <FormSelect
                      label="Symbol position"
                      options={[
                        { value: "before", label: "Before amount (Rs 100)" },
                        { value: "after", label: "After amount (100 Rs)" },
                      ]}
                      {...fieldProps("currency_position")}
                    />
                    <FormSelect
                      label="Decimal places"
                      options={[0, 1, 2, 3, 4].map((value) => ({ value: String(value), label: String(value) }))}
                      {...fieldProps("decimal_places")}
                    />
                  </SettingsSection>
                  <SettingsSection title="Tax and invoices" description="Defaults used when generating future transactions.">
                    <ToggleField label="Enable tax" description="Allow tax calculations on invoices." disabled={!canManage} registration={register("tax_enabled")} />
                    <ToggleField label="Prices include tax" description="Treat entered prices as tax-inclusive." disabled={!canManage || !taxEnabled} registration={register("prices_include_tax")} />
                    <FormInput label="Tax name" disabled={!canManage || !taxEnabled} error={errors.tax_name?.message} {...register("tax_name")} />
                    <FormInput label="Tax rate (%)" type="number" step="0.01" disabled={!canManage || !taxEnabled} error={errors.tax_rate?.message} {...register("tax_rate")} />
                    <FormInput label="Invoice prefix" required {...fieldProps("invoice_prefix")} />
                    <ToggleField label="Show logo on invoices" disabled={!canManage} registration={register("show_logo_on_invoice")} />
                    <FormTextarea label="Invoice terms" className="sm:col-span-2" {...fieldProps("invoice_terms")} />
                    <FormTextarea label="Invoice footer" className="sm:col-span-2" {...fieldProps("invoice_footer")} />
                  </SettingsSection>
                </div>
              ) : null}

              {activeSection === "receipt" ? (
                <SettingsSection title="Receipt template" description="Configure thermal and A4 receipt defaults.">
                  <FormSelect
                    label="Paper size"
                    options={[
                      { value: "58mm", label: "58 mm thermal" },
                      { value: "80mm", label: "80 mm thermal" },
                      { value: "a4", label: "A4" },
                    ]}
                    {...fieldProps("receipt_paper_size")}
                  />
                  <div />
                  <FormTextarea label="Receipt header" className="sm:col-span-2" {...fieldProps("receipt_header")} />
                  <FormTextarea label="Receipt footer" className="sm:col-span-2" {...fieldProps("receipt_footer")} />
                </SettingsSection>
              ) : null}

              {activeSection === "email" ? (
                <SettingsSection
                  title="Email identity"
                  description="Sender details used by server-side email integrations. Credentials belong in secure server secrets."
                >
                  <FormInput label="From name" {...fieldProps("email_from_name")} />
                  <FormInput label="From address" type="email" {...fieldProps("email_from_address")} />
                  <FormInput label="Reply-to address" type="email" {...fieldProps("email_reply_to")} />
                </SettingsSection>
              ) : null}

              {activeSection === "backup" ? (
                <SettingsSection
                  title="Backup policy"
                  description="Record the desired backup schedule. Execution is configured in Supabase infrastructure."
                >
                  <ToggleField label="Scheduled backups" description="Enable the documented backup policy." disabled={!canManage} registration={register("backup_enabled")} />
                  <div />
                  <FormSelect
                    label="Frequency"
                    disabled={!canManage || !backupEnabled}
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                    ]}
                    error={errors.backup_frequency?.message}
                    {...register("backup_frequency")}
                  />
                  <FormInput
                    label="Retention (days)"
                    type="number"
                    disabled={!canManage || !backupEnabled}
                    error={errors.backup_retention_days?.message}
                    {...register("backup_retention_days")}
                  />
                </SettingsSection>
              ) : null}

              {activeSection === "appearance" ? (
                <SettingsSection title="Appearance" description="Set the default visual experience for this business.">
                  <FormSelect
                    label="Default theme"
                    options={[
                      { value: "system", label: "Use device setting" },
                      { value: "light", label: "Light" },
                      { value: "dark", label: "Dark" },
                    ]}
                    {...fieldProps("default_theme")}
                  />
                  <div />
                  <ToggleField label="Compact mode" description="Reserve less space in tables and forms." disabled={!canManage} registration={register("compact_mode")} />
                </SettingsSection>
              ) : null}

              {canManage ? (
                <div className="mt-5 flex justify-end">
                  <Button size="lg" type="submit" disabled={!isDirty || update.isPending}>
                    <Save />
                    {update.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              ) : null}
            </form>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

