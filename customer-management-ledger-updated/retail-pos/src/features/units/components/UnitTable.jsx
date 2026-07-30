import dayjs from "dayjs";

import { DataTable, EmptyState, StatusBadge } from "@/components/shared";
import UnitActions from "./UnitActions";

const columns = [
  { key: "name", header: "Unit", render: (unit) => <span className="font-semibold text-slate-900 dark:text-slate-100">{unit.name}</span> },
  { key: "short_name", header: "Short Name", render: (unit) => <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold uppercase dark:bg-slate-800">{unit.short_name}</span> },
  { key: "status", header: "Status", render: (unit) => <StatusBadge status={unit.status} /> },
  { key: "created_at", header: "Created", render: (unit) => unit.created_at ? dayjs(unit.created_at).format("DD MMM YYYY") : "—" },
  { key: "actions", header: "Actions", headerClassName: "px-4 py-3 text-center font-semibold", cellClassName: "px-4 py-3", render: (unit) => <UnitActions unit={unit} /> },
];

export default function UnitTable({ units, isLoading, pagination }) {
  return (
    <DataTable
      columns={columns}
      data={units}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={<EmptyState title="No units found" description="Try changing your filters or create your first unit." />}
    />
  );
}
