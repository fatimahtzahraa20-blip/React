import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportSupplierPDF(

    supplier,

    ledger

){

    const pdf = new jsPDF();

    pdf.setFontSize(18);

    pdf.text(

        "Supplier Ledger",

        14,

        18

    );

    pdf.setFontSize(11);

    pdf.text(

        supplier.name,

        14,

        28

    );

    autoTable(pdf,{

        head:[

            [

                "Date",

                "Description",

                "Debit",

                "Credit"

            ]

        ],

        body:ledger.map(item=>([

            item.transaction_date,

            item.description,

            item.debit,

            item.credit

        ]))

    });

    pdf.save(

        `${supplier.name}-ledger.pdf`

    );

}