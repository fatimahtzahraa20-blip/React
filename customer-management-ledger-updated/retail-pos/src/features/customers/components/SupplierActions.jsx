import {

    Eye,

    Pencil,

    BookOpen,

} from "lucide-react";

import { Link } from "react-router-dom";

import DeleteSupplierDialog from "./DeleteSupplierDialog";

export default function SupplierActions({

    supplier

}){

    return(

        <div className="flex gap-2">

            <button
                className="rounded p-2 hover:bg-gray-100"
            >

                <Eye size={18}/>

            </button>

            <Link

                to={`/suppliers/${supplier.id}/edit`}

            >

                <button
                    className="rounded p-2 hover:bg-gray-100"
                >

                    <Pencil size={18}/>

                </button>

            </Link>

            <Link

                to={`/suppliers/${supplier.id}/ledger`}

            >

                <button
                    className="rounded p-2 hover:bg-gray-100"
                >

                    <BookOpen size={18}/>

                </button>

            </Link>

            <DeleteSupplierDialog

                supplier={supplier}

            />

        </div>

    );

}