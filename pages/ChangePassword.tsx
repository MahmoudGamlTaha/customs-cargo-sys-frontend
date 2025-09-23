import Modal from "@/components/Modal";
import { memo, useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  AssignRoleToPermission,
  ChangeUserPassword,
  IchangePassReq,
} from "@/services/userService";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToken } from "@/utils/getToken";
import { FormInputField } from "@/components/FormInputField";

interface Iprops {
  open: boolean;
  onClose: () => void;
  isChangePassword?: boolean
}

export default function ChangePassword({ isChangePassword, onClose, open }: Iprops) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(false);
  const { control, watch, handleSubmit } = useForm<IchangePassReq>({
    defaultValues: isChangePassword ? {} : { current_password: "password" },
  });

  const onSubmit = useCallback(
    async (data: IchangePassReq) => {
      if (data.new_password !== data.new_passwrod_again) {
        toast.error(t("changePassword.deffPasswordErr"));
      } else {
        setLoading(true);
        const result = await ChangeUserPassword(getToken(), data);
        if (result.success) {
          setLoading(false);
          toast.success(t("changePassword.successMsg"));
          onClose();
        } else {
          setLoading(false);
          toast.error(result.message || t("changePassword.errorMsg"));
        }
      }
    },
    [ChangeUserPassword]
  );

  return (
    <Modal
      title={t("changePassword.modalTitle")}
      isOpen={open}
      onClose={onClose}
      children={
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-5">
            <Controller
              control={control}
              name="current_password"
              render={({ field }) => (
                <FormInputField
                  {...field}
                  label={t("changePassword.currentPass")}
                  required
                  name="current_password"
                  value={field.value}
                />
              )}
            />
            <Controller
              rules={{
                required: t("changePassword.required"),
                minLength: {
                  value: 6,
                  message: t("changePassword.maxLengthMsg"),
                },
              }}
              control={control}
              name="new_password"
              render={({ field, fieldState }) => (
                <FormInputField
                  {...field}
                  label={t("changePassword.newPass")}
                  required
                  name="new_password"
                  error={fieldState?.error?.message || ""}
                />
              )}
            />
            <Controller
              rules={{
                required: t("changePassword.required"),
                minLength: {
                  value: 6,
                  message: t("changePassword.maxLengthMsg"),
                },
              }}
              control={control}
              name="new_passwrod_again"
              render={({ field, fieldState }) => (
                <FormInputField
                  {...field}
                  label={t("changePassword.newPassAgain")}
                  required
                  name="new_passwrod_again"
                  error={
                    fieldState?.error?.message
                      ? fieldState.error.message!!
                      : watch("new_password") !== field.value
                      ? t("changePassword.deffPasswordErr")
                      : undefined
                  }
                />
              )}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="disabled:bg-gray-200 mt-4 ltr:ml-2 rtl:mr-2 px-4 py-2 bg-brand-primary text-white rounded-lg"
          >
            {loading ? t("changePassword.saving") : t("changePassword.submit")}
          </button>
        </form>
      }
    />
  );
}