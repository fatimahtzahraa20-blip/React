import dayjs from "dayjs";

import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import BrandActions from "./BrandActions";

const columns = [
  { key: "name", header: "Brand", render: (brand) => <span className="font-semibold text-slate-900 dark:text-slate-100">{brand.name}</span> },
  { key: "description", header: "Description", cellClassName: "max-w-md px-4 py-3 text-slate-500", render: (brand) => <span className="line-clamp-2">{brand.description || "—"}</span> },
  { key: "status", header: "Status", render: (brand) => <StatusBadge status={brand.status} /> },
  { key: "created_at", header: "Created", render: (brand) => brand.created_at ? dayjs(brand.created_at).format("DD MMM YYYY") : "—" },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (brand) => <BrandActions brand={brand} /> },
];

export default function BrandTable({ brands, isLoading, pagination }) {
  return (
    <DataTable
      columns={columns}
      data={brands}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={<EmptyState title="No brands found" description="Try changing your filters or create your first brand." />}
    />
  );
}
