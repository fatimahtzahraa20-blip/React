import { supabase } from "@/lib/supabase";

const PRODUCT_SELECT = `
  *,
  category:categories(id, name),
  brand:brands(id, name),
  unit:units(id, name, short_name)
`;

const normalizeProduct = (product) => ({
  ...product,
  name: product.name || product.product_name || "Unnamed product",
  product_name: product.product_name || product.name || "Unnamed product",
  sku: product.sku || product.product_code || "",
  product_code: product.product_code || product.sku || "",
  cost_price: Number(product.cost_price ?? product.purchase_price ?? 0),
  purchase_price: Number(product.purchase_price ?? product.cost_price ?? 0),
});

export async function getProducts() {
  const related = await supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (!related.error) return (related.data || []).map(normalizeProduct);

  const fallback = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (fallback.error) throw fallback.error;
  return (fallback.data || []).map(normalizeProduct);
}

export async function getProductById(id) {
  const related = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).single();
  if (!related.error) return normalizeProduct(related.data);

  const fallback = await supabase.from("products").select("*").eq("id", id).single();
  if (fallback.error) throw fallback.error;
  return normalizeProduct(fallback.data);
}

export async function uploadProductImage(file) {
  if (!file) return null;
  const extension = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function createProduct({ values, image }) {
  const imageUrl = await uploadProductImage(image);
  const { opening_stock: openingStock, ...product } = values;
  const { data, error } = await supabase.from("products").insert({ ...product, image_url: imageUrl }).select().single();
  if (error) throw error;

  let openingStockWarning = null;
  if (Number(openingStock) > 0) {
    const { error: stockError } = await supabase.rpc("set_opening_stock", {
      p_product_id: data.id,
      p_quantity: Number(openingStock),
    });
    if (stockError) openingStockWarning = stockError.message;
  }

  return { ...normalizeProduct(data), openingStockWarning };
}

export async function updateProduct(id, { values, image }) {
  const imageUrl = image ? await uploadProductImage(image) : values.image_url;
  const product = { ...values };
  delete product.opening_stock;
  delete product.image_url;
  const { data, error } = await supabase.from("products").update({ ...product, ...(imageUrl ? { image_url: imageUrl } : {}) }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deactivateProduct(id) {
  const { data, error } = await supabase.from("products").update({ status: false }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getProductHistory(productId) {
  const { data, error } = await supabase.from("stock_movements").select("*").eq("product_id", productId).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
