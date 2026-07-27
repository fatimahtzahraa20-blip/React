import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string | null;
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Category[];
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}

export async function createCategory(
  category: CreateCategoryData
) {
  const payload = {
    name: category.name.trim(),
    slug:
      category.slug?.trim() ||
      createSlug(category.name),
    description:
      category.description?.trim() || null,
  };

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}

export async function updateCategory(
  id: string,
  category: UpdateCategoryData
) {
  const payload = {
    ...category,
    slug:
      category.slug ||
      (category.name
        ? createSlug(category.name)
        : undefined),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getCategoryCount() {
  const { count, error } = await supabase
    .from("categories")
    .select("*", {
      head: true,
      count: "exact",
    });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}