import { supabase } from "@/lib/supabase";

export async function postTransaction({

    debitAccount,

    creditAccount,

    amount,

    description,

    referenceType,

    referenceId

}){

    const { error } = await supabase.rpc(

        "post_transaction",

        {

            debit_account:debitAccount,

            credit_account:creditAccount,

            amount,

            description,

            reference_type:referenceType,

            reference_id:referenceId

        }

    );

    if(error) throw error;

}
await postTransaction({

    debitAccount:3,

    creditAccount:5,

    amount:500,

    description:"Invoice INV-0001",

    referenceType:"SALE",

    referenceId:15

});
await postTransaction({

    debitAccount:6,

    creditAccount:4,

    amount:300,

    description:"Purchase",

    referenceType:"PURCHASE",

    referenceId:21

});
await postTransaction({

debitAccount:4,

creditAccount:1,

amount:250

});
await postTransaction({

debitAccount:7,

creditAccount:1,

amount:100

});
await postTransaction({

debitAccount:8,

creditAccount:1,

amount:500

});