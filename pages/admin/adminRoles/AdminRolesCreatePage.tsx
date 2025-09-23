import React from "react";
import Modal from "@/components/Modal";
import { createNewRole, Role } from "@/services/userService";
import { memo, useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
interface Iprops {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  selectedRow?: Role;
  // submittedData: (data: Role) => void;
}

interface FormInputFieldProps {
  name: string;
  label: string;
  value: string | null;
  type?: string;
  required?: boolean;
  error?: string;
  minLength?: number;
  min?: number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const FormInputField = memo(
  ({
    min,
    minLength,
    error,
    name,
    label,
    value,
    type = "text",
    required = true,
    onChange,
  }: FormInputFieldProps) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          min={min}
          minLength={minLength}
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`mt-1 w-full p-2 border rounded-md focus:ring-brand-primary focus:border-brand-primary
      dark:bg-gray-600 dark:border-gray-500
      ${
        error ? "border-red-500 !focus:ring-red-500 focus:border-red-500" : ""
      }`}
          required={required}
        />

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

export default function AdminRolesCreatePage({
  selectedRow,
  mode,
  onClose,
  open,
}: Iprops) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(false);
  const { control, reset, handleSubmit } = useForm<Role>({
    defaultValues: {} as Role,
  });

  const onSubmit = useCallback(async (data: Role) => {
    // submittedData(data);
    setLoading(true);
    const result = await createNewRole(data);
    if (result.success) {
      setLoading(false);
      toast.success("تم الحغظ");
      onClose();
      reset({
        code: undefined,
        name_ar: undefined,
        name_en: undefined,
      });
    } else {
      setLoading(false);
      toast.error(result.message || "");
    }
  }, []);
  return (
    <Modal
      isLoading={loading}
      isOpen={open}
      title={`${
        mode === "add"
          ? t("sidebar.manageRolesPage.createModalTitle")
          : "تعديل وظيفة"
      }`}
      showCloseButton
      size="2xl"
      children={
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Controller
              defaultValue={selectedRow?.name_ar}
              control={control}
              name="name_ar"
              rules={{ required: "الحقل مطلوب" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInputField
                  name="name_ar"
                  label={t("sidebar.manageRolesPage.tableHeaderNameAr")}
                  onChange={onChange}
                  value={value}
                  error={error?.message} // now will have text
                />
              )}
            />
            <Controller
              defaultValue={selectedRow?.name_en}
              control={control}
              name="name_en"
              rules={{ required: "الحقل مطلوب" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInputField
                  name="name_en"
                  label={t("sidebar.manageRolesPage.tableHeaderNameEn")}
                  onChange={onChange}
                  value={value}
                  error={error?.message}
                />
              )}
            />
            <Controller
              defaultValue={selectedRow?.code}
              control={control}
              name="code"
              rules={{ required: "الحقل مطلوب" }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FormInputField
                  name="code"
                  label={t("sidebar.manageRolesPage.tableHeaderCode")}
                  onChange={onChange}
                  value={value}
                  error={error?.message}
                />
              )}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="span mt-2 py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
          >
            {loading ?  t("sidebar.manageRolesPage.saveing") : t("sidebar.manageRolesPage.save")}
          </button>
        </form>
      }
      onClose={() => {
        onClose();
        reset({
          code: undefined,
          name_ar: undefined,
          name_en: undefined,
        });
      }}
    />
  );
}
