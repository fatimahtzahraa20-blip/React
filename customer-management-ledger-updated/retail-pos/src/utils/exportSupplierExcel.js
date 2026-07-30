import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export function exportSupplierExcel(ledger, supplier) {

    const rows = ledger.map(item => ({

        Date: item.transaction_date,

        Description: item.description,

        Debit: item.debit,

        Credit: item.credit

    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Ledger"
    );

    const excelBuffer = XLSX.write(

        workbook,

        {

            bookType: "xlsx",

            type: "array"

        }

    );

    const blob = new Blob(

        [excelBuffer],

        {

            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        }

    );

    saveAs(

        blob,

        `${supplier.name}-ledger.xlsx`

    );

}