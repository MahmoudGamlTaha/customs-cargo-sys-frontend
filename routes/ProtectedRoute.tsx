import { IPermissions } from "@/services/userService";
import { getToken, getUserPermissions } from "@/utils/getToken";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface IprotectedRoutesProps {
    children: React.ReactNode;
    auth?: boolean;
    permission?: string[];
}

export default function ProtectedRoute() {
    const [user, setUser] = useState<IPermissions[]>([])
    useEffect(() => {
        getUserPermissions().then((res) => setUser(res));

    }, [])
    const token = getToken();
    const location = useLocation();
}