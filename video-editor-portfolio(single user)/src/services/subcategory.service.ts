import { supabase } from "../lib/supabase";

export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;

  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface CreateSubCategoryData {
  category_id: string;
  name: string;
  slug?: string;
  description?: string | null;
}

export interface UpdateSubCategoryData {
  category_id?: string;
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

const selectQuery = `
id,
category_id,
name,
slug,
description,
created_at,
updated_at,
categories (
id,
name,
slug
)
`;

export async function getSubCategories() {
  const { data, error } = await supabase
    .from("sub_categories")
    .select(selectQuery)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as SubCategory[];
}

export async function getSubCategoriesByCategory(
  categoryId: string
) {
  const { data, error } = await supabase
    .from("sub_categories")
    .select(selectQuery)
    .eq("category_id", categoryId)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as SubCategory[];
}

export async function getSubCategoryById(id: string) {
  const { data, error } = await supabase
    .from("sub_categories")
    .select(selectQuery)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as SubCategory;
}

export async function createSubCategory(
  subCategory: CreateSubCategoryData
) {
  const payload = {
    category_id: subCategory.category_id,
    name: subCategory.name.trim(),
    slug:
      subCategory.slug?.trim() ||
      createSlug(subCategory.name),
    description:
      subCategory.description?.trim() || null,
  };

  const { data, error } = await supabase
    .from("sub_categories")
    .insert(payload)
    .select(selectQuery)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as SubCategory;
}

export async function updateSubCategory(
  id: string,
  subCategory: UpdateSubCategoryData
) {
  const payload = {
    ...subCategory,
    slug:
      subCategory.slug ||
      (subCategory.name
        ? createSlug(subCategory.name)
        : undefined),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sub_categories")
    .update(payload)
    .eq("id", id)
    .select(selectQuery)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as SubCategory;
}

export async function deleteSubCategory(
  id: string
) {
  const { error } = await supabase
    .from("sub_categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getSubCategoryCount() {
  const { count, error } = await supabase
    .from("sub_categories")
    .select("*", {
      head: true,
      count: "exact",
    });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}