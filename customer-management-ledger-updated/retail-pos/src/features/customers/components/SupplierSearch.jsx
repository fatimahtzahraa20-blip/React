import { SearchInput } from "@/components/shared";

export default function SupplierSearch({ value, onChange }) {
  return <SearchInput value={value} onChange={onChange} placeholder="Search suppliers..." />;
}
