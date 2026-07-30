import { supabase } from "@/lib/supabase";

export async function getPosProducts(warehouseId) {
  if (!warehouseId) return [];

  const [productResult, stockResult] = await Promise.all([
    supabase.from("products").select("*").eq("status", true).order("created_at", { ascending: false }),
    supabase.from("stock").select("product_id, quantity").eq("warehouse_id", warehouseId),
  ]);

  if (productResult.error) throw productResult.error;
  if (stockResult.error) throw stockResult.error;

  const stockByProduct = new Map(
    (stockResult.data || []).map((row) => [String(row.product_id), Number(row.quantity || 0)])
  );

  return (productResult.data || []).map((product) => ({
    ...product,
    product_name: product.product_name || product.name || "Unnamed product",
    name: product.name || product.product_name || "Unnamed product",
    sku: product.sku || product.product_code || "",
    product_code: product.product_code || product.sku || "",
    sale_price: Number(product.sale_price || 0),
    available_stock: stockByProduct.get(String(product.id)) || 0,
  }));
}

export async function getPosCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data || [])
    .filter((customer) => customer.status !== false)
    .map((customer) => ({
      ...customer,
      name: customer.name || customer.full_name || customer.customer_name || customer.phone || "Customer",
      current_balance: Number(customer.current_balance || 0),
      credit_limit: Number(customer.credit_limit || 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function postSale(payload) {
  const { data, error } = await supabase.rpc("post_sale", {
    p_customer_id: payload.customer_id ? Number(payload.customer_id) : null,
    p_warehouse_id: Number(payload.warehouse_id),
    p_items: payload.items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      sale_price: Number(item.sale_price),
    })),
    p_discount: Number(payload.discount),
    p_tax: Number(payload.tax),
    p_paid_amount: Number(payload.paid_amount),
    p_payment_method: payload.payment_method,
  });
  if (error) throw error;
  return data;
}

export async function holdSale(payload) {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("held_sales").insert({
    hold_number: `HOLD-${Date.now()}`,
    customer_id: payload.customer_id || null,
    warehouse_id: payload.warehouse_id,
    cart: payload.items.map((item) => ({
      product_id: Number(item.product_id),
      name: item.name,
      barcode: item.barcode,
      sale_price: Number(item.sale_price),
      quantity: Number(item.quantity),
      available_stock: Number(item.available_stock),
    })),
    discount: Number(payload.discount),
    tax: Number(payload.tax),
    held_by: userData.user?.id,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getHeldSales() {
  const heldResult = await supabase.from("held_sales").select("*").order("created_at", { ascending: false });
  if (heldResult.error) throw heldResult.error;

  const customerIds = [...new Set((heldResult.data || [])
    .map((sale) => sale.customer_id)
    .filter(Boolean))];

  let customers = [];
  if (customerIds.length) {
    const customerResult = await supabase.from("customers").select("*").in("id", customerIds);
    if (!customerResult.error) customers = customerResult.data || [];
  }

  const customerById = new Map(customers.map((customer) => [
    String(customer.id),
    { ...customer, name: customer.name || customer.customer_name || customer.phone || "Customer" },
  ]));

  return (heldResult.data || []).map((sale) => ({
    ...sale,
    customer: customerById.get(String(sale.customer_id)) || null,
  }));
}

export async function deleteHeldSale(id) {
  const { error } = await supabase.from("held_sales").delete().eq("id", id);
  if (error) throw error;
}

export async function getInvoice(id) {
  const invoiceResult = await supabase.from("invoices").select("*").eq("id", id).single();
  if (invoiceResult.error) throw invoiceResult.error;

  const invoice = invoiceResult.data;
  const itemResult = await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("id");
  if (itemResult.error) throw itemResult.error;

  let customer = null;
  if (invoice.customer_id) {
    const customerResult = await supabase.from("customers").select("*").eq("id", invoice.customer_id).maybeSingle();
    if (!customerResult.error && customerResult.data) {
      customer = {
        ...customerResult.data,
        name: customerResult.data.name || customerResult.data.customer_name || customerResult.data.phone || "Customer",
      };
    }
  }

  const productIds = [...new Set((itemResult.data || []).map((item) => item.product_id).filter(Boolean))];
  let products = [];
  if (productIds.length) {
    const productResult = await supabase.from("products").select("*").in("id", productIds);
    if (!productResult.error) products = productResult.data || [];
  }
  const productById = new Map(products.map((product) => [
    String(product.id),
    { ...product, product_name: product.product_name || product.name || "Product" },
  ]));

  return {
    ...invoice,
    customer,
    items: (itemResult.data || []).map((item) => ({
      ...item,
      product: productById.get(String(item.product_id)) || { product_name: "Product #" + item.product_id },
    })),
  };
}

