import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Trash2 } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { deleteCustomer } from "../services/customerService";

export default function DeleteCustomerDialog({ customer }) {

    const queryClient = useQueryClient();

    const mutation = useMutation({

        mutationFn: () => deleteCustomer(customer.id),

        onSuccess() {

            toast.success("Customer deleted successfully");

            queryClient.invalidateQueries({

                queryKey: ["customers"]

            });

        },

        onError(error) {

            toast.error(error.message);

        }

    });

    return (

        <AlertDialog>

            <AlertDialogTrigger asChild>

                <button
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                >

                    <Trash2 size={18} />

                </button>

            </AlertDialogTrigger>

            <AlertDialogContent>

                <AlertDialogHeader>

                    <AlertDialogTitle>

                        Delete Customer?

                    </AlertDialogTitle>

                    <AlertDialogDescription>

                        This action cannot be undone.

                    </AlertDialogDescription>

                </AlertDialogHeader>

                <AlertDialogFooter>

                    <AlertDialogCancel>

                        Cancel

                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => mutation.mutate()}
                    >

                        Delete

                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>

        </AlertDialog>

    );

}