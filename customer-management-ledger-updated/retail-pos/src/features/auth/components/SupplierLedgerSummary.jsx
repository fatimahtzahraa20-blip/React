export default function SupplierLedgerSummary({

    supplier,

    ledger,

}) {

    const debit = ledger.reduce(

        (sum, row) => sum + Number(row.debit),

        0

    );

    const credit = ledger.reduce(

        (sum, row) => sum + Number(row.credit),

        0

    );

    const balance = credit - debit;

    return (

        <div className="grid grid-cols-4 gap-5">

            <div className="rounded-xl border bg-white p-5">

                <h4 className="text-sm text-gray-500">

                    Supplier

                </h4>

                <h2 className="font-semibold">

                    {supplier.name}

                </h2>

            </div>

            <div className="rounded-xl border bg-white p-5">

                <h4 className="text-sm text-gray-500">

                    Purchases

                </h4>

                <h2>

                    ${credit.toFixed(2)}

                </h2>

            </div>

            <div className="rounded-xl border bg-white p-5">

                <h4 className="text-sm text-gray-500">

                    Payments

                </h4>

                <h2>

                    ${debit.toFixed(2)}

                </h2>

            </div>

            <div className="rounded-xl border bg-white p-5">

                <h4 className="text-sm text-gray-500">

                    Outstanding

                </h4>

                <h2 className="font-bold">

                    ${balance.toFixed(2)}

                </h2>

            </div>

        </div>

    );

}