import { useState, type FormEvent } from "react";

interface CategoryFormProps {
  initialValue?: string;
  loading?: boolean;
  onSubmit: (name: string) => Promise<void> | void;
}

export default function CategoryForm({
  initialValue = "",
  loading = false,
  onSubmit,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValue);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    await onSubmit(name);

    if (!initialValue) {
      setName("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row"
    >
      <input
        type="text"
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white outline-none focus:border-amber-400"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-500 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}