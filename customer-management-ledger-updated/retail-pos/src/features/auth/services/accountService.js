import { supabase } from "@/lib/supabase";

export async function getAccounts() {

    const { data, error } = await supabase

        .from("accounts")

        .select("*")

        .order("account_code");

    if (error) throw error;

    return data;

}