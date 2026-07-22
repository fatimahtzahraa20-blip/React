import { useCallback, useEffect, useState } from "react";
import {
  convertSettingsToForm,
  defaultSettings,
  getSettings,
  resetSettings,
  saveSettings,
  type SettingsFormData,
  type SiteSettings,
} from "../services/settings.service";

interface UseSettingsResult {
  settings: SettingsFormData;
  savedSettings: SiteSettings | null;
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
  updateField: (
    field: keyof SettingsFormData,
    value: string
  ) => void;
  save: () => Promise<boolean>;
  reset: () => Promise<boolean>;
  reload: () => Promise<void>;
  clearMessages: () => void;
}

export default function useSettings(): UseSettingsResult {
  const [settings, setSettings] =
    useState<SettingsFormData>(defaultSettings);

  const [savedSettings, setSavedSettings] =
    useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getSettings();

      if (data) {
        setSavedSettings(data);
        setSettings(convertSettingsToForm(data));
      } else {
        setSavedSettings(null);
        setSettings(defaultSettings);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load settings.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function updateField(
    field: keyof SettingsFormData,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function save(): Promise<boolean> {
    if (!settings.site_name.trim()) {
      setError("Site name is required.");
      return false;
    }

    if (!settings.hero_title.trim()) {
      setError("Hero title is required.");
      return false;
    }

    if (!settings.contact_email.trim()) {
      setError("Contact email is required.");
      return false;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await saveSettings(settings);

      setSavedSettings(data);
      setSettings(convertSettingsToForm(data));
      setSuccess("Settings saved successfully.");

      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save settings.";

      setError(message);

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function reset(): Promise<boolean> {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const data = await resetSettings();

      setSavedSettings(data);
      setSettings(convertSettingsToForm(data));
      setSuccess("Settings reset successfully.");

      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reset settings.";

      setError(message);

      return false;
    } finally {
      setSaving(false);
    }
  }

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  return {
    settings,
    savedSettings,
    loading,
    saving,
    error,
    success,
    updateField,
    save,
    reset,
    reload: loadSettings,
    clearMessages,
  };
}