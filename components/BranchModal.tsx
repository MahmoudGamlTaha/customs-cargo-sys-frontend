import React, { useState, useEffect } from "react";
import { Branch } from "../services/branchService";
import Modal from "./Modal";
import { useLanguage } from "../contexts/LanguageContext";

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Omit<Branch, "id"> | Branch) => void;
  branch: Omit<Branch, "id"> | Branch | null;
  isProcessing: boolean;
}

const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branch,
  isProcessing,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<Omit<Branch, "id">>({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (branch) {
      setFormData(branch as Branch);
    } else {
      setFormData({ name: "", code: "", address: "", phone: "", email: "" });
    }
  }, [branch, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Ddddddddd")
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        branch
          ? t("sidebar.branches.modal.editTitle")
          : t("sidebar.branches.modal.addTitle")}

      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("sidebar.branches.modal.name")}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("sidebar.branches.modal.code")}
          </label>
          <input
            type="text"
            name="code"
            id="code"
            value={formData.code || ""}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("sidebar.branches.modal.address")}
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("sidebar.branches.modal.phone")}
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("sidebar.branches.modal.email")}
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="disabled:opacity-50 mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            {t("sidebar.branches.modal.cancel")}
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="disabled:opacity-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isProcessing
              ? t("sidebar.branches.modal.saving")
              : t("sidebar.branches.modal.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchModal;
