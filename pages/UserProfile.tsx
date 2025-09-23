import React, { useState, useEffect, useCallback } from "react";
import Card from "../components/Card";
import { MemberProfile, User } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import ChangePassword from "./ChangePassword";
import { Controller, useForm } from "react-hook-form";
import { FormInputField } from "@/components/FormInputField";
import { GetMyProfile, IuserProfile, UpdateUserProfile } from "@/services/userService";
import toast from "react-hot-toast";
import { getToken } from "@/utils/getToken";
import { getCurrentUser } from "@/utils/getCurrentUser";

interface UserProfileProps {
  profile: MemberProfile;
  onUpdateProfile: (userId: string, updates: IuserProfile) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState<boolean>(false);
  const { control, handleSubmit, reset } = useForm<IuserProfile>()
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = useCallback(async (data: IuserProfile) => {
    console.log(data);
    setLoading(true);
    const result = await UpdateUserProfile(data);
    if (result?.success) {
      setLoading(false);
      toast.success(t('userProfile.accountInfo.successMsg'));
    } else {
      setLoading(false);
      toast.error(result?.message || 'Failed to update profile');
    }
  }, [])


useEffect(() => {
  const fetchProfile = async () => {
    const auth = getToken();
    if (auth) {
      const userToken = getCurrentUser();
      try {
        const result = await GetMyProfile();
        if (result?.success && result?.data) {
          const data = result?.data?.data;
          reset({
            email: data?.email,
            phone: data?.phone,
            first_name: data?.first_name,
            last_name: data?.last_name,
            branch_name: userToken.branch?.name,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  };
  fetchProfile();
}, [reset]);


  return (
    <div>
      <ChangePassword open={open} onClose={() => setOpen(false)} isChangePassword/>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {t("userProfile.title")}
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card cardTitle={t("userProfile.accountInfo.title")}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Controller control={control} name="first_name"
                render={({ field }) => (
                  <FormInputField
                    {...field}
                    label={t("userProfile.accountInfo.firstName")}
                    id="first_name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller control={control} name="last_name"
                render={({ field }) => (
                  <FormInputField
                    {...field}
                    label={t("userProfile.accountInfo.lastName")}
                    id="last_name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller control={control} name="email"
                render={({ field }) => (
                  <FormInputField
                    {...field}
                    label={t("userProfile.accountInfo.email")}
                    id="email"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                rules={{
                  pattern: {
                    value: /^[0-9]*$/, // only digits, max 4
                    message: "Phone must be up to 4 digits and positive only",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormInputField
                    {...field}
                    type="number"
                    minLength={0}
                    label={t("userProfile.accountInfo.phone")}
                    id="phone"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                  />
                )}
              />

               <Controller
                control={control}
                name="branch_name"
                rules={{
                  pattern: {
                    value: /^[0-9]*$/, // only digits, max 4
                    message: "Phone must be up to 4 digits and positive only",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <FormInputField                  
                    {...field}
                    disabled
                    required={false}
                    minLength={0}
                    label={t("userProfile.accountInfo.branchName")}
                    id="branch_name"
                    value={field.value}
                    onChange={field.onChange}
                    error={error?.message}
                  />
                )}
              />

              {/* <Controller control={control} name=""
                render={({ field }) => (
                  <FormInputField
                    {...field}
                    label={t("userProfile.accountInfo.company")}
                    id="companyNameAr"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              /> */}

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary-hover w-36 disabled:opacity-70"
                  disabled={loading}
                >
                 {
                    loading ? t("userProfile.accountInfo.savingButton") : t("userProfile.accountInfo.saveButton")
                 }
                
                </button>
              </div>
            </form>
          </Card>
          <Card cardTitle={t("userProfile.security.title")}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">
                  {t("userProfile.security.changePassword")}
                </h4>
                <button
                  onClick={() => setOpen(true)}
                  className="border border-solid border-brand-primary text-sm text-brand-primary rounded px-3 py-1 hover:underline disabled:text-gray-500"
                >
                  {t("userProfile.security.changeButton")}
                </button>
              </div>
              <div>
                <h4 className="font-semibold">
                  {t("userProfile.security.twoFa")}
                </h4>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 ltr:mr-4 rtl:ml-4">
                    {t("userProfile.security.status")}:{" "}
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {t("userProfile.security.status_active")}
                    </span>
                  </p>
                  <button
                    // onClick={handleToggle2FA}
                    className="text-sm text-red-600 hover:underline disabled:text-gray-500"
                    // disabled={!!twoFAStatus}
                  >
                    {/* {getButtonText(
                      twoFAStatus,
                      "userProfile.security.disableButton",
                      "userProfile.security.loading",
                      "userProfile.security.done"
                    )} */}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card cardTitle={t("userProfile.history.title")}>
            <ul className="space-y-3">
              <li className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {t("userProfile.history.item1")}
              </li>
              <li className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {t("userProfile.history.item2")}
              </li>
              <li className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {t("userProfile.history.item3")}
              </li>
              <li className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                {t("userProfile.history.item4")}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
