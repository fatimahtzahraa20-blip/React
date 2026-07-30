import SupplierStatusBadge from "./SupplierStatusBadge";
import SupplierActions from "./SupplierActions";

export default function SupplierTable({ suppliers = [] }) {
  if (!suppliers.length) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        No suppliers found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-3 text-left">Code</th>

            <th className="p-3 text-left">Supplier</th>

            <th className="p-3 text-left">Phone</th>

            <th className="p-3 text-left">Balance</th>

            <th className="p-3 text-left">Status</th>

            <th className="p-3 text-center">Actions</th>

          </tr>

        </thead>

        <tbody>

          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              className="border-t hover:bg-slate-50"
            >
              <td className="p-3">
                {supplier.supplier_code}
              </td>

              <td className="p-3 font-medium">
                {supplier.name}
              </td>

              <td className="p-3">
                {supplier.phone}
              </td>

              <td className="p-3">
                ${Number(supplier.current_balance || 0).toFixed(2)}
              </td>

              <td className="p-3">
                <SupplierStatusBadge
                  status={supplier.status}
                />
              </td>

              <td className="p-3 flex justify-center">
                <SupplierActions supplier={supplier} />
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}