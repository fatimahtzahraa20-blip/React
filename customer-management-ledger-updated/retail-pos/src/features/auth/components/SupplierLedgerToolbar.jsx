import {

Printer,

FileSpreadsheet,

FileText

} from "lucide-react";

import {

exportSupplierExcel

} from "../utils/exportSupplierExcel";

import {

exportSupplierPDF

} from "../utils/exportSupplierPDF";

export default function SupplierLedgerToolbar({

supplier,

ledger

}){

return(

<div className="flex gap-3">

<button

className="px-4 py-2 rounded-lg border"

onClick={()=>window.print()}

>

<Printer size={18}/>

</button>

<button

className="px-4 py-2 rounded-lg border"

onClick={()=>

exportSupplierExcel(

ledger,

supplier

)

}

>

<FileSpreadsheet size={18}/>

</button>

<button

className="px-4 py-2 rounded-lg border"

onClick={()=>

exportSupplierPDF(

supplier,

ledger

)

}

>

<FileText size={18}/>

</button>

</div>

);

}