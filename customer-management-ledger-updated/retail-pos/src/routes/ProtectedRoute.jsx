import { Navigate } from "react-router-dom";

import useAuthStore from "@/store/authStore";

export default function ProtectedRoute({

    children

}){

    const {

        user,

        loading

    } = useAuthStore();

    if(loading){

        return <h2>Loading...</h2>;

    }

    if(!user){

        return <Navigate to="/login"/>;

    }

    return children;

}
