import dayjs from "dayjs";

export default function SupplierLedgerTable({

    ledger,

}) {

    let runningBalance = 0;

    return (

        <div className="rounded-xl border bg-white overflow-hidden">

            <table className="w-full">

                <thead>

                    <tr className="bg-slate-100">

                        <th className="p-3 text-left">

                            Date

                        </th>

                        <th className="p-3 text-left">

                            Description

                        </th>

                        <th className="p-3 text-left">

                            Debit

                        </th>

                        <th className="p-3 text-left">

                            Credit

                        </th>

                        <th className="p-3 text-left">

                            Balance

                        </th>

                    </tr>

                </thead>

                <tbody>

                    {ledger.map((row) => {

                        runningBalance +=
                            Number(row.credit) -
                            Number(row.debit);

                        return (

                            <tr
                                key={row.id}
                                className="border-t"
                            >

                                <td className="p-3">

                                    {dayjs(
                                        row.transaction_date
                                    ).format("DD MMM YYYY")}

                                </td>

                                <td className="p-3">

                                    {row.description}

                                </td>

                                <td className="p-3">

                                    ${Number(row.debit).toFixed(2)}

                                </td>

                                <td className="p-3">

                                    ${Number(row.credit).toFixed(2)}

                                </td>

                                <td className="p-3 font-semibold">

                                    ${runningBalance.toFixed(2)}

                                </td>

                            </tr>

                        );

                    })}

                </tbody>

            </table>

        </div>

    );

}