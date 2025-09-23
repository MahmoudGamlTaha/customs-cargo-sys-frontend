import CustomSelect from "@/components/CustomSelect";
import { FormInputField } from "@/components/FormInputField";
import Modal from "@/components/Modal";
import { useLanguage } from "@/contexts/LanguageContext";
import { createAdminUser, GetUserById, Role, UpdateUser } from "@/services/userService";
import { Branch, User, UserRole } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface Iprops {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    selectedId?: number;
    roles?: Role[];
    branchOptions?: Branch[];
    // submittedData: (data: Role) => void;
}
export default function AddEditUsersModal({ mode, roles, branchOptions, selectedId, onClose, open }: Iprops) {
    const [loading, setLoading] = useState<boolean>(false);
    const { t } = useLanguage();
    const { control, handleSubmit, reset } = useForm<User>();

    const onSubmit = useCallback(async (data: User) => {
        if (mode === "create") {
            setLoading(true);
            const tempData: User = {
                ...data,
                email_verified: true,
                is_active: true,
                role_id: roles.find((res) => res.code === data.role)?.id,
            };
            console.log(tempData, "tempData")
            const result = await createAdminUser(tempData);
            if (result.success) {
                setLoading(false);
                toast.success(t('adminPages.users.modal.successMsg'));
                reset({} as User);
                onClose();
            } else {
                setLoading(false);
                toast.error(result.message);
            }
        } else {
            setLoading(true);
            const tempData: User = {
                ...data,
                email_verified: true,
                is_active: true,
                role_id: roles.find((res) => res.code === data.role)?.id,
            };
            console.log(tempData, "tempData")
            const result = await UpdateUser(tempData);
            if (result.success) {
                setLoading(false);
                toast.success(t('adminPages.users.modal.successMsg'));
                reset({} as User);
                onClose();
            } else {
                setLoading(false);
                toast.error(result.message);
            }
        }
    }, [roles, mode, onClose, reset, t]);

    useEffect(() => {
        const fetchUser = async () => {
            if (mode === "edit" && selectedId) {
                const result = await GetUserById(selectedId);
                if (result.success) {
                    const data = result.data?.data as User;
                    console.log(data, "User Data")
                    reset({
                        first_name: data?.first_name,
                        last_name: data?.last_name,
                        branch_id: data?.branch_id,
                        username: data?.username,
                        phone: data?.phone,
                        email: data?.email,
                        role: data?.role,
                        id: data?.id,
                    });
                }
            } else {
                reset({
                    first_name: "",
                    last_name: "",
                    branch_id: null,
                    username: "",
                    phone: "",
                    email: "",
                    role: null,
                    id: null,
                });
            }
        };

        fetchUser();
    }, [selectedId, mode, reset]);

    return <Modal isOpen={open}
        title={mode === 'create' ? t('adminPages.users.modal.titleCreate') : t('adminPages.users.modal.titleEdit')}
        showCloseButton
        onClose={() => {
            onClose();
            setLoading(false)
        }}
        children={
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller control={control} name='first_name'
                        render={({ field }) => (
                            <FormInputField
                                {...field}
                                label={t("adminPages.users.modal.firstName")}
                                id="first_name"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller control={control} name='last_name'
                        render={({ field }) => (
                            <FormInputField
                                {...field}
                                label={t("adminPages.users.modal.lastName")}
                                id="last_name"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller control={control} name='username'
                        render={({ field }) => (
                            <FormInputField
                                {...field}
                                label={t("adminPages.users.modal.userName")}
                                id="username"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller control={control} name='phone'
                        render={({ field }) => (
                            <FormInputField
                                {...field}
                                required={false}
                                label={t("adminPages.users.modal.phone")}
                                id="phone"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller control={control} name='email'
                        render={({ field }) => (
                            <FormInputField
                                {...field}
                                label={t("adminPages.users.modal.email")}
                                id="email"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {mode === 'create' && (<Controller control={control} name='password'
                        render={({ field }) => (
                            <FormInputField
                                required
                                {...field}
                                type='password'
                                label={t("adminPages.users.modal.password")}
                                id="password"
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />)}

                    <Controller control={control} name='branch_id'
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                    {t("adminPages.users.modal.branch")}
                                </label>
                                <CustomSelect
                                    displayKey={"name"}
                                    valueKey={"id"}
                                    options={branchOptions || []}
                                    value={Number(field.value)}
                                    onChange={(v) => field.onChange(Number(v))}
                                />
                            </div>
                        )}
                    />

                    <Controller control={control} name='role'
                        render={({ field }) => (
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                                   {t("adminPages.users.modal.role")}
                                </label>
                                <CustomSelect
                                    displayKey={"name_ar"}
                                    valueKey={"code"}
                                    options={roles || []}
                                    value={field.value?.toString()}
                                    onChange={(v) => field.onChange(v)}
                                />
                            </div>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        disabled={loading}
                        type="button"
                        onClick={() => {
                            onClose();
                            setLoading(false)
                        }}
                        className="py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {t("adminPages.users.modal.cancelButton")}

                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="py-2 px-3 bg-brand-primary text-white rounded hover:bg-brand-primary-hover disabled:opacity-50"
                    >
                        {t("adminPages.users.modal.saveButton")}
                        {/* {loadin ? "Creating..." : "Create"} */}
                    </button>
                </div>
            </form>
        }

    />;
}