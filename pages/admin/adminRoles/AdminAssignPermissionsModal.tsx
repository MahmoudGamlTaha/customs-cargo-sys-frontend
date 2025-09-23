import Modal from "@/components/Modal";
import { AssignRoleToPermission, GetAllPermissions, GetRolePermissions, IAssignRoleToPermissionReq, IPermissions, Role } from "@/services/userService";
import { getUserPermissions } from "@/utils/getToken";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Iprops {
    open: boolean;
    onClose: () => void;
    selectedRow?: Role;
}


export default function AdminAssignPermissionsModal({ open, onClose, selectedRow }: Iprops) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const finalReqRef = useRef<IAssignRoleToPermissionReq>({ listOfPermissions: [], roleId: selectedRow?.id });
    const [permissions, setAllPermissions] = useState<IPermissions[]>([]);
    const [_, setForceRender] = useState<string>('');


    useEffect(() => {
        let ignore = false;
        const fetchRoles = async () => {
            const result = await GetAllPermissions();
            if (!ignore) {
                if (result.success) {
                    console.log(result?.data?.data, "Permiss")
                    setAllPermissions(result.data?.data);
                } else {
                    toast.custom((t) => (
                        <div
                            className={`${t.visible ? "animate-enter" : "animate-leave"
                                } bg-orange-500 text-white px-4 py-2 rounded-md shadow-md`}
                        >
                            ⚠️ {result.message || ''}
                        </div>
                    ))
                }
                // setLoading(false);
            }
        };
        fetchRoles();
        return () => {
            ignore = true; // cleanup guard
        };
    }, []);

    const handleCheck = useCallback((permissionId: number, checked: boolean) => {
        if (finalReqRef.current) {
            setForceRender(Date.now().toString());
            const tempFinalReq: IAssignRoleToPermissionReq = { ...finalReqRef.current };
            if (checked) {
                if (!tempFinalReq.listOfPermissions.includes(permissionId)) {
                    tempFinalReq.listOfPermissions.push(permissionId);
                }
            } else {
                tempFinalReq.listOfPermissions = tempFinalReq.listOfPermissions.filter(
                    (id) => id !== permissionId
                );
            }
            // update the ref
            finalReqRef.current = { ...tempFinalReq, roleId: selectedRow?.id };
        }
    }, [selectedRow]);

    const assignRoleToPermission = useCallback(async () => {
        setIsLoading(true);
        const result = await AssignRoleToPermission(finalReqRef.current);
        if (result?.success) {
            setIsLoading(false);
            toast.success('تم تعيين الصلاحيات بنجاح');
            onClose();
           finalReqRef.current = { listOfPermissions: [], roleId: selectedRow?.id };
        } else {
            setIsLoading(false);
            toast.error(result.message || '');
        }

    }, [])


    useEffect(() => {
        const fetchRoles = async () => {
            const result = await GetRolePermissions(selectedRow?.id);
            if (selectedRow) {
                if (result.success) {
                    const rolePermissions: IPermissions[] = result.data?.data;
                    permissions?.map((per) => {
                        if (rolePermissions.some((res) => (res.code === per.code))) {
                            finalReqRef.current.listOfPermissions.push(per?.id);
                        }
                    })
                    setForceRender(Date.now().toString());

                } else {
                    toast.custom((t) => (
                        <div
                            className={`${t.visible ? "animate-enter" : "animate-leave"
                                } bg-orange-500 text-white px-4 py-2 rounded-md shadow-md`}
                        >
                            ⚠️ {result.message || ''}
                        </div>
                    ))
                }
                // setLoading(false);
            }
        };
        fetchRoles();
    }, [selectedRow, GetRolePermissions]);
    return (
        <Modal isLoading={isLoading} size="5xl" isOpen={open} onClose={() => {
            onClose();            
            finalReqRef.current = { listOfPermissions: [], roleId: selectedRow?.id };
        }}
            title={`ربط مجموعة صلاحيات لوظيفة (${selectedRow?.name_ar})`}
            children={(
                <div>
                    {/* <h3>الصلاحيات</h3> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {permissions?.map((per) => (
                            <div key={per.code} className="flex items-start justify-start mb-6">
                                <input
                                    type="checkbox"
                                    id={`${per.id}`}
                                    checked={finalReqRef.current.listOfPermissions.includes(per.id)}
                                    onChange={(e) => handleCheck(per.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                />
                                <label htmlFor={`${per.id}`} className="ltr:ml-2 rtl:mr-2 block text-sm text-gray-900 dark:text-gray-300">
                                    {per.name_ar}
                                </label>
                            </div>
                        ))
                        }
                    </div>
                    <button disabled={isLoading}
                        className="py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
                        onClick={assignRoleToPermission}
                    >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                </div>
            )}
        />
    )
}