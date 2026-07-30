import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Barcode, ImagePlus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import { FormInput, FormSelect } from "@/components/shared";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useUnits } from "@/features/units/hooks/useUnits";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import { productSchema } from "../schemas/productSchema";
import { generateBarcode, generateSku } from "../utils/productCodes";

export default function ProductForm({ product = null }) {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: units = [] } = useUnits();
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", barcode: "", category_id: "", brand_id: "", unit_id: "",
      cost_price: 0, sale_price: 0, wholesale_price: 0, minimum_stock: 0, opening_stock: 0, status: true,
    },
  });

  const name = useWatch({ control, name: "name" });
  useEffect(() => {
    if (product) reset({
      name: product.name || "", sku: product.sku || "", barcode: product.barcode || "",
      category_id: String(product.category_id || ""), brand_id: String(product.brand_id || ""),
      unit_id: String(product.unit_id || ""), cost_price: product.cost_price ?? 0,
      sale_price: product.sale_price ?? 0, wholesale_price: product.wholesale_price ?? 0,
      minimum_stock: product.minimum_stock ?? 0, opening_stock: 0, status: product.status ?? true,
      image_url: product.image_url || "",
    });
  }, [product, reset]);

  const options = {
    onSuccess: (savedProduct) => {
      toast.success(product ? "Product updated successfully" : "Product created successfully");
      if (savedProduct?.openingStockWarning) {
        toast.error("Product saved, but opening stock was not posted. Apply the stock migration, then adjust stock.");
      }
      navigate("/products");
    },
    onError: (error) => toast.error(error.message),
  };
  const createMutation = useCreateProduct(options);
  const updateMutation = useUpdateProduct(options);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const onSubmit = (values) => {
    const payload = { values: { ...values, brand_id: values.brand_id || null, image_url: product?.image_url }, image };
    if (product) updateMutation.mutate({ id: product.id, payload });
    else createMutation.mutate(payload);
  };
  const activeOptions = (items, label) => items.filter((item) => item.status).map((item) => ({ value: String(item.id), label: label(item) }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <FormInput label="Product name" required error={errors.name?.message} {...register("name")} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">SKU <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <FormInput className="flex-1" error={errors.sku?.message} {...register("sku")} />
            <button type="button" onClick={() => setValue("sku", generateSku(name), { shouldValidate: true })} className="h-10 rounded-lg border px-3" aria-label="Generate SKU"><RefreshCw className="size-4" /></button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Barcode</label>
          <div className="flex gap-2">
            <FormInput className="flex-1" error={errors.barcode?.message} {...register("barcode")} />
            <button type="button" onClick={() => setValue("barcode", generateBarcode(), { shouldValidate: true })} className="h-10 rounded-lg border px-3" aria-label="Generate barcode"><Barcode className="size-4" /></button>
          </div>
        </div>
        <FormSelect label="Category" required options={activeOptions(categories, (item) => item.name)} error={errors.category_id?.message} {...register("category_id")} />
        <FormSelect label="Brand" options={activeOptions(brands, (item) => item.name)} error={errors.brand_id?.message} {...register("brand_id")} />
        <FormSelect label="Unit" required options={activeOptions(units, (item) => `${item.name} (${item.short_name})`)} error={errors.unit_id?.message} {...register("unit_id")} />
        <FormInput label="Cost price" type="number" step="0.01" required error={errors.cost_price?.message} {...register("cost_price")} />
        <FormInput label="Sale price" type="number" step="0.01" required error={errors.sale_price?.message} {...register("sale_price")} />
        <FormInput label="Wholesale price" type="number" step="0.01" error={errors.wholesale_price?.message} {...register("wholesale_price")} />
        <FormInput label="Minimum stock" type="number" step="0.01" error={errors.minimum_stock?.message} {...register("minimum_stock")} />
        <FormInput label="Opening stock" type="number" step="0.01" disabled={Boolean(product)} error={errors.opening_stock?.message} {...register("opening_stock")} />
      </div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
        <ImagePlus className="size-5 text-slate-500" />
        <span className="text-sm">{image ? image.name : product?.image_url ? "Replace product image" : "Upload product image"}</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] || null)} />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="size-4 rounded" {...register("status")} /> Active product</label>
      <div className="flex justify-end gap-3 border-t pt-5 dark:border-slate-800">
        <button type="button" onClick={() => navigate("/products")} className="h-10 rounded-lg border px-4 text-sm font-semibold">Cancel</button>
        <button type="submit" disabled={isPending} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{isPending ? "Saving..." : product ? "Update Product" : "Save Product"}</button>
      </div>
    </form>
  );
}
