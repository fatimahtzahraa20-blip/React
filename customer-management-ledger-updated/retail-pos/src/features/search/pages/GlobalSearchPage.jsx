import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  DataTable,
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdvancedFilterPanel from "../components/AdvancedFilterPanel";
import useSearchResults from "../hooks/useSearchResults";
import {
  useDeleteSavedSearch,
  useSavedSearches,
  useSaveSearch,
} from "../hooks/useSavedSearches";
import useSearchStore from "../store/searchStore";
import { multiSort } from "../utils/multiSort";

export default function GlobalSearchPage() {
  const [saveOpen, setSaveOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const query = useSearchStore((state) => state.query);
  const types = useSearchStore((state) => state.types);
  const status = useSearchStore((state) => state.status);
  const from = useSearchStore((state) => state.from);
  const to = useSearchStore((state) => state.to);
  const sorts = useSearchStore((state) => state.sorts);
  const setQuery = useSearchStore((state) => state.setQuery);
  const toggleType = useSearchStore((state) => state.toggleType);
  const setStatus = useSearchStore((state) => state.setStatus);
  const setDateRange = useSearchStore((state) => state.setDateRange);
  const setSorts = useSearchStore((state) => state.setSorts);
  const applyFilter = useSearchStore((state) => state.applyFilter);
  const reset = useSearchStore((state) => state.reset);
  const filters = { query, types, status, from, to, sorts };
  const { data = [], isLoading, isError, error } = useSearchResults(filters);
  const { data: savedFilters = [] } = useSavedSearches();
  const save = useSaveSearch({
    onSuccess: () => {
      toast.success("Search filter saved");
      setSaveOpen(false);
      setFilterName("");
      setIsDefault(false);
    },
    onError: (saveError) => toast.error(saveError.message),
  });
  const remove = useDeleteSavedSearch({
    onSuccess: () => toast.success("Saved filter deleted"),
    onError: (deleteError) => toast.error(deleteError.message),
  });

  const results = useMemo(() => {
    const statusFiltered = status === "all" ? data : data.filter((row) => row.status === status);
    return multiSort(statusFiltered, sorts);
  }, [data, sorts, status]);

  const columns = [
    {
      key: "title",
      header: "Result",
      render: (row) => (
        <div>
          <Link to={row.action_url} className="font-semibold text-blue-600 hover:underline">
            {row.title}
          </Link>
          <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">{row.subtitle || "—"}</p>
        </div>
      ),
    },
    {
      key: "entity_type",
      header: "Type",
      render: (row) => <span className="capitalize">{row.entity_type}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={["active", "completed"].includes(row.status) ? "success" : row.status === "inactive" ? "neutral" : "warning"}
          label={row.status}
        />
      ),
    },
    {
      key: "amount",
      header: "Amount / balance",
      render: (row) => Number(row.amount || 0).toFixed(2),
    },
    {
      key: "occurred_at",
      header: "Date",
      render: (row) => dayjs(row.occurred_at).format("DD MMM YYYY"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Global Search"
          description="Search customers, suppliers, products, and sales from one place."
          actions={
            <Button variant="outline" size="lg" onClick={() => setSaveOpen(true)}>
              <Bookmark />
              Save current filters
            </Button>
          }
        />

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, phone, SKU, barcode, or invoice..."
          className="sm:max-w-none"
          autoFocus
        />

        {savedFilters.length ? (
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <div key={filter.id} className="inline-flex items-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => applyFilter(filter.filter_config)}
                  className="px-3 py-1.5 text-sm font-medium"
                >
                  {filter.name}{filter.is_default ? " • Default" : ""}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${filter.name}`}
                  onClick={() => remove.mutate(filter.id)}
                  className="mr-1 rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AdvancedFilterPanel
            types={types}
            status={status}
            from={from}
            to={to}
            sorts={sorts}
            onToggleType={toggleType}
            onStatusChange={setStatus}
            onDateChange={setDateRange}
            onSortChange={setSorts}
            onReset={reset}
          />
          <div className="min-w-0">
            {isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Search failed: {error.message}
              </div>
            ) : query.trim().length < 2 ? (
              <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <EmptyState icon={Search} title="Search your business" description="Enter at least two characters to find matching records." />
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={results}
                isLoading={isLoading}
                emptyState={<EmptyState icon={Search} title="No matching records" description="Try a different term or clear some filters." />}
              />
            )}
          </div>
        </div>
      </div>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title="Save current filters">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Filter name</span>
            <input
              value={filterName}
              onChange={(event) => setFilterName(event.target.value)}
              maxLength={80}
              placeholder="e.g. Active products this month"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(event) => setIsDefault(event.target.checked)}
              className="size-4 accent-blue-600"
            />
            Make this my default global search filter
          </label>
          <Button
            size="lg"
            className="w-full"
            disabled={!filterName.trim() || save.isPending}
            onClick={() =>
              save.mutate({
                name: filterName,
                config: filters,
                isDefault,
              })
            }
          >
            {save.isPending ? "Saving..." : "Save filter"}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
