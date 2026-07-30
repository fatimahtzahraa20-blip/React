import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Banknote, CreditCard, Loader2, Minus, Pause, Plus, RotateCcw, Search, ShoppingCart, Trash2, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { EmptyState, PageHeader } from "@/components/shared";
import { useWarehouses } from "@/features/stock/hooks/useStock";
import DashboardLayout from "@/layouts/DashboardLayout";
import useCartStore from "@/store/cartStore";
import { useDeleteHeldSale, useHeldSales, useHoldSale, usePosCustomers, usePosProducts, usePostSale } from "../hooks/usePos";

const money = (value) => Number(value || 0).toFixed(2);
const paymentOptions = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "credit", label: "Credit", icon: WalletCards },
];

export default function PosPage() {
  const navigate = useNavigate();
  const cart = useCartStore();
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [activeHeldId, setActiveHeldId] = useState(null);

  const { data: warehouses = [] } = useWarehouses();
  const { data: customers = [], isError: customersError, error: customerLoadError } = usePosCustomers();
  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch } = usePosProducts(cart.warehouseId);
  const { data: held = [], isError: heldError, error: heldLoadError } = useHeldSales();
  const deleteHeld = useDeleteHeldSale();

  const hasItems = cart.items.length > 0;
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.sale_price) * Number(item.quantity), 0);
  const total = hasItems ? Math.max(0, subtotal - Number(cart.discount) + Number(cart.tax)) : 0;

  useEffect(() => {
    if (!hasItems && (cart.discount || cart.tax || paidAmount)) {
      cart.setDiscount(0);
      cart.setTax(0);
      setPaidAmount("");
    }
  }, [hasItems, cart.discount, cart.tax, paidAmount]);
  const tendered = paidAmount === "" ? (paymentMethod === "credit" ? 0 : total) : Number(paidAmount);
  const effectivePaid = Math.min(Math.max(Number.isFinite(tendered) ? tendered : 0, 0), total);
  const due = Math.max(0, total - effectivePaid);
  const change = paymentMethod === "cash" ? Math.max(0, tendered - total) : 0;
  const selectedCustomer = customers.find((customer) => String(customer.id) === String(cart.customerId));
  const availableCredit = selectedCustomer && Number(selectedCustomer.credit_limit) > 0
    ? Math.max(0, Number(selectedCustomer.credit_limit) - Number(selectedCustomer.current_balance || 0))
    : null;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => !keyword || [
      product.product_name,
      product.name,
      product.sku,
      product.product_code,
      product.barcode,
    ].some((value) => String(value || "").toLowerCase().includes(keyword)));
  }, [products, search]);

  const salePayload = {
    customer_id: cart.customerId,
    warehouse_id: cart.warehouseId,
    items: cart.items,
    discount: Number(cart.discount),
    tax: Number(cart.tax),
  };

  const postMutation = usePostSale({
    onSuccess: (invoiceId) => {
      if (activeHeldId) deleteHeld.mutate(activeHeldId);
      cart.clear();
      setActiveHeldId(null);
      setPaidAmount("");
      toast.success("Sale completed and stock updated");
      navigate("/pos/receipt/" + invoiceId);
    },
    onError: (error) => toast.error(error.message || "Sale could not be completed"),
  });

  const holdMutation = useHoldSale({
    onSuccess: () => {
      if (activeHeldId) deleteHeld.mutate(activeHeldId);
      cart.clear();
      setActiveHeldId(null);
      setPaidAmount("");
      toast.success("Sale held safely");
    },
    onError: (error) => toast.error(error.message || "Sale could not be held"),
  });

  const changeWarehouse = (warehouseId) => {
    if (String(warehouseId) === String(cart.warehouseId)) return;
    if (cart.items.length && !window.confirm("Changing warehouse will clear the current cart. Continue?")) return;
    cart.clear();
    cart.setWarehouseId(warehouseId);
    setActiveHeldId(null);
    setPaidAmount("");
  };

  const scanBarcode = () => {
    const code = search.trim().toLowerCase();
    if (!code) return;
    const product = products.find((item) => [item.barcode, item.sku, item.product_code]
      .some((value) => String(value || "").toLowerCase() === code));
    if (!product) return toast.error("Barcode or SKU was not found");
    if (Number(product.available_stock) <= 0) return toast.error("This product is out of stock in the selected warehouse");
    cart.addItem(product);
    setSearch("");
  };

  const restoreHeld = (sale) => {
    if (cart.items.length && !window.confirm("Replace the current cart with this held sale?")) return;
    cart.restore(sale);
    setActiveHeldId(sale.id);
    setPaidAmount("");
    toast.success("Held sale restored");
  };

  const discardHeld = (sale) => {
    if (!window.confirm("Discard " + sale.hold_number + "? This cannot be undone.")) return;
    deleteHeld.mutate(sale.id, {
      onSuccess: () => {
        if (activeHeldId === sale.id) {
          cart.clear();
          setActiveHeldId(null);
        }
        toast.success("Held sale discarded");
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const completeSale = () => {
    if (!cart.warehouseId || !cart.items.length) return toast.error("Select a warehouse and add products");
    if (!Number.isFinite(tendered) || tendered < 0) return toast.error("Enter a valid payment amount");
    if (Number(cart.discount) > subtotal + Number(cart.tax)) return toast.error("Discount cannot exceed the sale amount");
    if (total <= 0) return toast.error("Sale total must be greater than zero");
    if (paymentMethod === "card" && tendered > total) return toast.error("Card payment cannot exceed the total");
    if ((due > 0 || paymentMethod === "credit") && !cart.customerId) return toast.error("Select a customer for a credit or partial sale");
    if (availableCredit !== null && due > availableCredit) return toast.error("Customer has only " + money(availableCredit) + " credit available");
    postMutation.mutate({ ...salePayload, paid_amount: effectivePaid, payment_method: paymentMethod });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <PageHeader title="Point of Sale" description="Scan products, collect payment, and post stock and ledger entries in one transaction." />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="min-w-0 space-y-4">
            <div className="grid gap-3 rounded-lg border bg-white p-3 shadow-sm sm:grid-cols-[220px_minmax(0,1fr)] dark:bg-slate-900">
              <select value={cart.warehouseId} onChange={(event) => changeWarehouse(event.target.value)} className="h-11 min-w-0 rounded-md border bg-transparent px-3">
                <option value="">Select warehouse</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
              <div className="relative min-w-0">
                <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") scanBarcode(); }} placeholder="Scan barcode or search product" className="h-11 w-full rounded-md border bg-transparent pl-10 pr-3" />
              </div>
            </div>

            {!cart.warehouseId ? (
              <EmptyState title="Select a warehouse" description="Available products and live stock will appear here." />
            ) : productsLoading ? (
              <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-6 animate-spin text-blue-600" /></div>
            ) : productsError ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:bg-red-950/20">
                <AlertTriangle className="size-6 text-red-600" />
                <p className="font-medium">Products could not be loaded.</p>
                <button type="button" onClick={() => refetch()} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
              </div>
            ) : filtered.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((product) => (
                  <button type="button" key={product.id} disabled={Number(product.available_stock) <= 0} onClick={() => cart.addItem(product)} className="min-h-32 rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 dark:bg-slate-900">
                    <p className="line-clamp-2 font-semibold">{product.product_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{product.sku || product.barcode || "No code"} | Stock {product.available_stock}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="font-bold text-blue-600">{money(product.sale_price)}</p>
                      {Number(product.available_stock) <= 0 && <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/30">Out of stock</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : <EmptyState title="No products found" description="Try another search or check stock for this warehouse." />}

            {(held.length > 0 || heldError) && (
              <div className="rounded-lg border bg-white p-4 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Held Sales</h3><span className="text-xs text-slate-500">{held.length} waiting</span></div>
                {heldError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20">
                    <p className="font-semibold">Held sales could not be loaded.</p>
                    <p className="mt-1 break-words text-xs">{heldLoadError?.message}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {held.map((sale) => (
                      <div key={sale.id} className={"flex items-center gap-2 rounded-md border p-2 " + (activeHeldId === sale.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "")}>
                        <button type="button" onClick={() => restoreHeld(sale)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-semibold">{sale.hold_number}</span>
                          <span className="text-xs text-slate-500">{sale.customer?.name || "Walking customer"} | {sale.cart?.length || 0} lines</span>
                        </button>
                        <button type="button" title="Restore held sale" onClick={() => restoreHeld(sale)} className="rounded-md border p-2"><RotateCcw className="size-4" /></button>
                        <button type="button" title="Discard held sale" onClick={() => discardHeld(sale)} className="rounded-md border p-2 text-red-600"><Trash2 className="size-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="h-fit overflow-hidden rounded-lg border bg-white shadow-sm xl:sticky xl:top-24 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingCart className="size-5" /> Current Sale</h2>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">{cart.items.length} lines</span>
            </div>
            <div className="max-h-72 min-h-28 space-y-2 overflow-y-auto p-4">
              {!cart.items.length && <p className="py-8 text-center text-sm text-slate-500">Scan or select a product to begin.</p>}
              {cart.items.map((item) => (
                <div key={item.product_id} className="rounded-md border p-3">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1"><p className="truncate font-medium">{item.name}</p><p className="text-xs text-slate-500">{money(item.sale_price)} each | Max {item.available_stock}</p></div>
                    <button type="button" title="Remove item" onClick={() => cart.removeItem(item.product_id)} className="self-start rounded p-1 text-red-600"><Trash2 className="size-4" /></button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" title="Decrease quantity" onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)} className="rounded border p-1.5"><Minus className="size-3" /></button>
                    <input aria-label="Quantity" type="number" min="1" max={item.available_stock} value={item.quantity} onChange={(event) => cart.updateQuantity(item.product_id, event.target.value)} className="h-8 w-14 rounded border bg-transparent text-center text-sm" />
                    <button type="button" title="Increase quantity" onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)} className="rounded border p-1.5"><Plus className="size-3" /></button>
                    <span className="ml-auto font-semibold">{money(item.quantity * item.sale_price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t p-5">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Customer</span>
                <select value={cart.customerId} onChange={(event) => cart.setCustomerId(event.target.value)} disabled={customersError} className="h-10 w-full rounded-md border bg-transparent px-3">
                  <option value="">Walking customer (cash sale)</option>
                  <optgroup label="Ledger customers">
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name || customer.phone} | Balance {money(customer.current_balance)}</option>)}
                  </optgroup>
                </select>
                {selectedCustomer && availableCredit !== null && <span className="mt-1 block text-xs text-slate-500">Available credit: {money(availableCredit)}</span>}
                {customersError && (
                  <span className="mt-1 block break-words text-xs text-red-600">
                    Customers could not be loaded: {customerLoadError?.message}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Discount</span><input type="number" min="0" disabled={!hasItems} value={cart.discount} onChange={(event) => cart.setDiscount(event.target.value)} className="h-10 w-full rounded-md border bg-transparent px-3" /></label>
                <label><span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Tax</span><input type="number" min="0" disabled={!hasItems} value={cart.tax} onChange={(event) => cart.setTax(event.target.value)} className="h-10 w-full rounded-md border bg-transparent px-3" /></label>
              </div>

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">Payment method</span>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button" onClick={() => { setPaymentMethod(value); setPaidAmount(""); }} className={"flex h-10 items-center justify-center gap-1.5 rounded-md border text-sm font-semibold transition " + (paymentMethod === value ? "border-blue-600 bg-blue-600 text-white" : "hover:border-blue-400")}>
                      <Icon className="size-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{paymentMethod === "cash" ? "Cash tendered" : paymentMethod === "card" ? "Card amount" : "Deposit received"}</span>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input type="number" min="0" step="0.01" disabled={!hasItems} value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} placeholder={paymentMethod === "credit" ? "0.00" : money(total)} className="h-10 min-w-0 rounded-md border bg-transparent px-3" />
                  <button type="button" onClick={() => setPaidAmount(money(total))} className="rounded-md border px-3 text-xs font-semibold">Exact</button>
                </div>
              </label>

              <div className="space-y-1.5 border-y py-3 text-sm">
                <p className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></p>
                <p className="flex justify-between"><span>Discount</span><span>-{money(cart.discount)}</span></p>
                <p className="flex justify-between"><span>Tax</span><span>{money(cart.tax)}</span></p>
                <p className="flex justify-between pt-1 text-xl font-bold"><span>Total</span><span>{money(total)}</span></p>
                {due > 0 && <p className="flex justify-between font-semibold text-red-600"><span>Balance due</span><span>{money(due)}</span></p>}
                {change > 0 && <p className="flex justify-between font-semibold text-emerald-600"><span>Change</span><span>{money(change)}</span></p>}
              </div>

              <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                <button type="button" disabled={!cart.items.length || holdMutation.isPending} onClick={() => holdMutation.mutate(salePayload)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border font-semibold disabled:opacity-50"><Pause className="size-4" /> Hold</button>
                <button type="button" disabled={postMutation.isPending || !cart.items.length} onClick={completeSale} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 font-semibold text-white disabled:opacity-50">
                  {postMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {postMutation.isPending ? "Posting sale..." : hasItems ? "Complete Sale | " + money(total) : "Complete Sale"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
