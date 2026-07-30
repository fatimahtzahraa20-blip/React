import { FilterBar, FormInput, FormSelect } from "@/components/shared";

const TYPE_OPTIONS = [
  { value: "debit", label: "Debit only" },
  { value: "credit", label: "Credit only" },
];

export default function LedgerFilters({ filters, onChange, onReset }) {
  const active = Boolean(filters.from || filters.to || filters.type);

  return (
    <FilterBar onReset={onReset} active={active}>
      <FormInput
        label="From"
        type="date"
        value={filters.from}
        onChange={(event) => onChange({ ...filters, from: event.target.value })}
        className="w-44"
      />
      <FormInput
        label="To"
        type="date"
        value={filters.to}
        onChange={(event) => onChange({ ...filters, to: event.target.value })}
        className="w-44"
      />
      <FormSelect
        label="Type"
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={(event) => onChange({ ...filters, type: event.target.value })}
        className="w-44"
      />
    </FilterBar>
  );
}
