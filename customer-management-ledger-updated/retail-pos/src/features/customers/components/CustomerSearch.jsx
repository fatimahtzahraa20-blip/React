import { SearchInput } from "@/components/shared";

export default function CustomerSearch({ value, onChange }) {
  return <SearchInput value={value} onChange={onChange} placeholder="Search customers..." />;
}
