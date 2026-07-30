import { supabase } from "@/lib/supabase";

export async function getStock() {
  const [stockResult, productResult, warehouseResult] = await Promise.all([
    supabase.from("stock").select("*").order("updated_at", { ascending: false }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("warehouses").select("*").eq("status", true).order("name"),
  ]);

  if (productResult.error) throw productResult.error;
  if (stockResult.error) throw stockResult.error;

  const products = (productResult.data || []).map((product) => ({
    ...product,
    product_name: product.product_name || product.name || "Unnamed product",
    name: product.name || product.product_name || "Unnamed product",
  }));
  const warehouses = warehouseResult.error ? [] : (warehouseResult.data || []);
  const productById = new Map(products.map((product) => [String(product.id), product]));
  const warehouseById = new Map(warehouses.map((warehouse) => [String(warehouse.id), warehouse]));
  const rows = (stockResult.data || []).map((row) => ({
    ...row,
    quantity: Number(row.quantity || 0),
    product: productById.get(String(row.product_id)) || null,
    warehouse: warehouseById.get(String(row.warehouse_id)) || null,
  }));

  const stockedProducts = new Set(rows.map((row) => String(row.product_id)));
  const mainWarehouse = warehouses.find((warehouse) => warehouse.code === "MAIN") || warehouses[0];

  if (mainWarehouse) {
    products.forEach((product) => {
      if (!stockedProducts.has(String(product.id))) {
        rows.push({
          id: "zero-" + product.id + "-" + mainWarehouse.id,
          product_id: product.id,
          warehouse_id: mainWarehouse.id,
          quantity: 0,
          updated_at: product.updated_at || product.created_at,
          product,
          warehouse: mainWarehouse,
          is_virtual: true,
        });
      }
    });
  }

  return rows.filter((row) => row.product);
}

export async function getWarehouses() {
  const { data, error } = await supabase.from("warehouses").select("*").eq("status", true).order("name");
  if (error) throw error;
  return data || [];
}

export async function getStockProducts() {
  const { data, error } = await supabase.from("products").select("*").eq("status", true).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((product) => ({
    ...product,
    product_name: product.product_name || product.name || "Unnamed product",
  }));
}

export async function getStockMovements() {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, product:products(id, product_name, barcode), warehouse:warehouses(id, name, code)")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data || [];
}

export async function adjustStock(values) {
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_product_id: Number(values.product_id),
    p_warehouse_id: Number(values.warehouse_id),
    p_quantity: Number(values.quantity),
    p_movement_type: values.movement_type,
    p_notes: values.notes || null,
  });
  if (error) throw error;
  return data;
}
