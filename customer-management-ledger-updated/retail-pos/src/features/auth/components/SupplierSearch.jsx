import useSupplierStore from "../store/supplierStore";

export default function SupplierSearch() {
  const search = useSupplierStore((state) => state.search);
  const setSearch = useSupplierStore((state) => state.setSearch);

  return (
    <input
      type="text"
      placeholder="Search supplier..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-lg border px-4 py-2"
    />
  );
}