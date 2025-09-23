import { useLanguage } from "@/contexts/LanguageContext";
import { WarningIcon } from "./icons";
import Modal from "./Modal";

interface Iprops {
  open: boolean;
  title?: string;
  subTitle?: string;
  confirmModalMode?: "error" | "warning";
  handleSubmit: () => void;
  onClose: () => void;
  isLoading?: boolean;
}
export default function ConfirmModal({
  open,
  onClose,
  handleSubmit,
  isLoading,
  subTitle,
  title,
}: Iprops) {
  const { t } = useLanguage();
  return (
    <Modal
      isOpen={open}
      title={t("changePassword.warning")}
      onClose={onClose}
      // isLoading={isLoading}
      showCloseButton
      size="2xl"
      children={
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <WarningIcon className="h-20 w-20 text-orange-500" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <h4 className="text-gray-600">{subTitle}</h4>
          </div>

          <div className="w-full flex justify-end items-center gap-4 mt-4">
            <button
              disabled={isLoading}
              onClick={handleSubmit}
              className="disabled:bg-gray-200 py-1 px-3 bg-red-600 text-white rounded hover:bg-red-500 whitespace-nowrap"
            >
              {isLoading ? "جاري الحذف..." : t("changePassword.yes")}
            </button>
            <button
              disabled={isLoading}
              onClick={onClose}
              className={
                "disabled:bg-gray-200 py-1 px-3 bg-green-600 text-white rounded hover:bg-green-500 whitespace-nowrap"
              }
            >
              {t("changePassword.no")}{" "}
            </button>
          </div>
        </div>
      }
    />
  );
}
