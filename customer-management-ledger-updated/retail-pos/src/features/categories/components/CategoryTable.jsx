import dayjs from "dayjs";

import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import CategoryActions from "./CategoryActions";

const columns = [
  { key: "name", header: "Category", render: (category) => <span className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</span> },
  { key: "description", header: "Description", cellClassName: "max-w-md px-4 py-3 text-slate-500", render: (category) => <span className="line-clamp-2">{category.description || "—"}</span> },
  { key: "status", header: "Status", render: (category) => <StatusBadge status={category.status} /> },
  { key: "created_at", header: "Created", render: (category) => category.created_at ? dayjs(category.created_at).format("DD MMM YYYY") : "—" },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (category) => <CategoryActions category={category} /> },
];

export default function CategoryTable({ categories, isLoading, pagination }) {
  return (
    <DataTable
      columns={columns}
      data={categories}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={<EmptyState title="No categories found" description="Try changing your filters or create your first category." />}
    />
  );
}
