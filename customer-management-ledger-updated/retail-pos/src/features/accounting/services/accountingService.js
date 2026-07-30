import { supabase } from "@/lib/supabase";

export async function getAccounts() {
  const { data, error } = await supabase.from("accounts").select("*").order("account_code");
  if (error) throw error;
  return data || [];
}

export async function createAccount(values) {
  const payload = {
    account_code: String(values.account_code || "").trim(),
    account_name: String(values.account_name || "").trim(),
    account_type: values.account_type,
    status: values.status !== false,
  };
  const { data, error } = await supabase.from("accounts").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAccount({ id, values }) {
  const payload = {
    account_code: String(values.account_code || "").trim(),
    account_name: String(values.account_name || "").trim(),
    account_type: values.account_type,
    status: values.status !== false,
  };
  const { data, error } = await supabase.from("accounts").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function setAccountStatus({ id, status }) {
  const { data, error } = await supabase.from("accounts").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getGeneralLedger() {
  const [ledgerResult, accountResult] = await Promise.all([
    supabase.from("ledger_entries").select("*").order("transaction_date", { ascending: false }).limit(2000),
    supabase.from("accounts").select("*"),
  ]);
  if (ledgerResult.error) throw ledgerResult.error;
  if (accountResult.error) throw accountResult.error;
  const accountById = new Map((accountResult.data || []).map((account) => [String(account.id), account]));
  return (ledgerResult.data || []).map((entry) => ({
    ...entry,
    account: accountById.get(String(entry.account_id)) || null,
  }));
}

export async function postJournal(values) {
  const { data, error } = await supabase.rpc("post_manual_journal", {
    p_transaction_date: values.transaction_date,
    p_description: values.description,
    p_reference: values.reference || null,
    p_items: values.items,
  });
  if (error) throw error;
  return data;
}

export async function setOpeningBalance(values) {
  const { error } = await supabase.rpc("set_account_opening_balance", {
    p_account_id: Number(values.account_id),
    p_amount: Number(values.amount),
    p_as_of: values.as_of,
  });
  if (error) throw error;
}
