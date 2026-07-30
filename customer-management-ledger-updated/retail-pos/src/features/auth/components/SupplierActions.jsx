import { Eye, Pencil, BookOpen, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SupplierActions({ supplier }) {
  return (
    <div className="flex gap-2">

      <button className="rounded p-2 hover:bg-gray-100">
        <Eye size={18} />
      </button>

      <Link to={`/suppliers/${supplier.id}/edit`}>
        <button className="rounded p-2 hover:bg-gray-100">
          <Pencil size={18} />
        </button>
      </Link>

      <Link to={`/suppliers/${supplier.id}/ledger`}>
        <button className="rounded p-2 hover:bg-gray-100">
          <BookOpen size={18} />
        </button>
      </Link>

      <button className="rounded p-2 hover:bg-red-100 text-red-600">
        <Trash2 size={18} />
      </button>

    </div>
  );
}