import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useLanguage, TranslationKey } from "../contexts/LanguageContext";
import { UserRole } from "../types";
import { ProfileIcon } from "./icons";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: any;
  currentUser: any;
  processingRequestId: string | null;
  onApproveRequest: (requestId: string, event: React.MouseEvent) => void;
  onRejectRequest: (requestId: string, event: React.MouseEvent) => void;
  activities: any[];
  loadingActivities: boolean;
  activitiesError: string | null;
  onFetchActivities: (requestId: string) => void;
  showPrintButton?: boolean;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedRequest,
  currentUser,
  processingRequestId,
  onApproveRequest,
  onRejectRequest,
  activities,
  loadingActivities,
  activitiesError,
  onFetchActivities,
  showPrintButton = true,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "activities">(
    "details"
  );
  const navigate = useNavigate();
  const { t: getTranslation } = useLanguage();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PAID":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedRequest.serviceTypeId === 1) {
      navigate(`/comisa-print/${selectedRequest.id}`);
    } else if (selectedRequest.serviceTypeId === 2) {
      navigate(`/free-trade-print/${selectedRequest.id}`);
    } else {
      console.log(
        getTranslation(
          "staffPages.debug.printCertificate",
          "Opening print certificate in new tab"
        )
      );
      window.open(`/print/certificate/${selectedRequest.id}`, "_blank");
    }
  };

  if (!selectedRequest) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex justify-between items-center">
          {getTranslation("staffPages.forms.requestDetails", "Request Details")}
          {selectedRequest?.status === "PAID" &&
            showPrintButton &&
            currentUser?.role !== UserRole.Admin &&
            currentUser?.role !== UserRole.Accountant && (
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg mx-[1rem]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  <span className="text-[16px]">
                    {getTranslation("certs.print", "Print")}
                  </span>
                </button>
              </div>
            )}
        </div>
      }
      size="5xl"
      contentClassName="p-1 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="space-y-6 overflow-y-auto">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-4 font-medium text-sm ${activeTab === "details"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            {getTranslation("staffPages.forms.details", "Details")}
          </button>
          <button
            onClick={() => {
              setActiveTab("activities");
              if (
                selectedRequest &&
                activities?.length === 0 &&
                !activitiesError
              ) {
                onFetchActivities(selectedRequest.id);
              }
            }}
            className={`py-2 px-4 font-medium text-sm ${activeTab === "activities"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
          >
            {getTranslation("staffPages.forms.activityLog", "Activity Log")}
          </button>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {getTranslation("staffPages.table.status", "Status")}:
            </span>
            <span
              className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusClass(
                selectedRequest.status
              )}`}
            >
              {getTranslation(
                `status.${selectedRequest.status}` as TranslationKey,
                selectedRequest?.status
              )}
            </span>
          </div>
          {(currentUser?.role === UserRole.Auditor ||
            currentUser?.role === UserRole.BranchAdmin) &&
            selectedRequest.status !== "APPROVED" &&
            selectedRequest.status !== "PAID" &&
            selectedRequest.status !== "REJECTED" && (
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    onApproveRequest(selectedRequest.id, e);
                    onClose();
                  }}
                  disabled={processingRequestId === selectedRequest.id}
                  className="mx-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 "
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {processingRequestId === selectedRequest.id
                    ? getTranslation("staffPages.common.processing", "...")
                    : getTranslation("staffPages.forms.approve", "Approve")}
                </button>
                <button
                  onClick={(e) => {
                    onRejectRequest(selectedRequest.id, e);
                    onClose();
                  }}
                  disabled={processingRequestId === selectedRequest.id}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 "
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {processingRequestId === selectedRequest.id
                    ? getTranslation("staffPages.common.processing", "...")
                    : getTranslation("staffPages.forms.reject", "Reject")}
                </button>
              </div>
            )}
        </div>

        {activeTab === "details" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Client Information */}
              {selectedRequest.details?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
                  <div className="flex items-center mb-4 gap-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-full ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {getTranslation(
                        "staffPages.forms.clientInfo",
                        "Client Information"
                      )}
                    </h3>
                  </div>
                  {/* <div className="grid grid-cols-1 gap-y-3 text-sm ps-[3.1rem]"> */}
                  <div className="grid grid-cols-1 gap-y-3 text-sm ps-[12%]">
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.clientName",
                        "Client Name"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest?.details[0].client_name ||
                        selectedRequest?.details[0].exporter_name ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.companyName",
                        "Company Name"
                      )}{" "}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].exporter_name ||
                        selectedRequest.title ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.companyNameEn",
                        "Company Name (English)"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].company_name_en ||
                        selectedRequest.details[0].exporter_name ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    {/* <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.commercialNumber",
                        "Commercial Number"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                      {selectedRequest.details[0].commerical_number ||
                    
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span> */}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {selectedRequest.details?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
                  <div className="flex items-center mb-4 gap-2">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {getTranslation(
                        "staffPages.forms.contactInfo",
                        "Contact Information"
                      )}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-y-3 text-sm ps-[12%]">
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation("staffPages.forms.address", "Address")}:
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0]?.country_producer || null}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.phoneNumber",
                        "Phone Number"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                      {selectedRequest.details[0].phone_number ||
                        selectedRequest.details[0].mobile_number ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    {/* <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.mobileNumber",
                        "Mobile Number"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                      {selectedRequest.details[0].mobile_number ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span> */}
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation("staffPages.forms.email", "Email")}:
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].email  ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.identityNumber",
                        "Identity Number"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                      {selectedRequest.details[0].identity_number ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Request Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
                <div className="flex items-center mb-4 gap-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {getTranslation(
                      "staffPages.forms.requestInfo",
                      "Request Information"
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-y-3 text-sm ps-[12%]">
                  <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                    {getTranslation(
                      "staffPages.forms.sourceName",
                      "Source Name"
                    )}
                    :
                  </strong>
                  <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                    {selectedRequest.title ||
                      getTranslation("staffPages.common.notAvailable", "-")}
                  </span>
                  <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                    {getTranslation(
                      "staffPages.forms.description",
                      "Description"
                    )}
                    :
                  </strong>
                  <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                    {selectedRequest.description ||
                      selectedRequest.details[0].description ||
                      getTranslation("staffPages.common.notAvailable", "-")}
                  </span>
                  <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                    {getTranslation(
                      "staffPages.forms.serialNumber",
                      "Serial Number"
                    )}
                    :
                  </strong>
                  <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                    {selectedRequest.serialNumber ||
                      getTranslation("staffPages.common.notAvailable", "-")}
                  </span>
                  <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                    {getTranslation(
                      "staffPages.forms.requestType",
                      "Request Type"
                    )}
                    :
                  </strong>
                  <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                    {selectedRequest.request_type_name ||
                      getTranslation("staffPages.common.notAvailable", "-")}
                  </span>
                </div>
              </div>

              {/* Shipment Information */}
              {selectedRequest.details?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
                  <div className="flex items-center mb-4 gap-2">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-full ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {getTranslation(
                        "staffPages.forms.shipmentInfo",
                        "Shipment Information"
                      )}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-y-3 text-sm ps-[12%]">
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.transferDetail",
                        "Transport Information"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].transfer_detail ||
                        (selectedRequest.details[0].extra
                          ? JSON.parse(selectedRequest.details[0].extra)
                            .transport_details
                          : null) ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation("staffPages.forms.signs", "Signs")}:
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].signs ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.numberOfParcels",
                        "Number of Parcels"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].number_of_parcel ||
                        selectedRequest.details[0].quantity ||
                        getTranslation("stafafPages.common.zero", "0")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation("staffPages.forms.weight", "Weight")}:
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].weight ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.netWeight",
                        "Net Weight"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].net_weight ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.standardOfOrigin",
                        "Standard of Origin"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].standard_of_origin ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.countryProducer",
                        "Country Producer"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].country_producer ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                  </div>
                </div>
              )}

              {/* Invoice Information */}
              {selectedRequest.details?.[0] && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
                  <div className="flex items-center mb-4 gap-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {getTranslation(
                        "staffPages.forms.invoiceInfo",
                        "Invoice Information"
                      )}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-y-3 text-sm ps-[12%]">
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.invoiceNumber",
                        "Invoice Number"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block font-mono break-all pl-1">
                      {selectedRequest.details[0].invoice_number ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.invoiceDate",
                        "Invoice Date"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].invoice_date ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.activityType",
                        "Activity Type"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].activity_type ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                    <strong className="text-gray-500 dark:text-gray-400 block mb-1">
                      {getTranslation(
                        "staffPages.forms.forOfficialUse",
                        "For Official Use"
                      )}
                      :
                    </strong>
                    <span className="text-gray-800 dark:text-gray-200 block break-words pl-1">
                      {selectedRequest.details[0].for_official_use ||
                        getTranslation("staffPages.common.notAvailable", "-")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {getTranslation("staffPages.forms.activityLog", "Activity Log")}
            </h3>

            {loadingActivities ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
              </div>
            ) : activitiesError ? (
              <div className="text-center py-4 text-red-500">
                <p>{activitiesError}</p>
                <button
                  onClick={() =>
                    selectedRequest && onFetchActivities(selectedRequest.id)
                  }
                  className="mt-2 text-brand-primary hover:underline"
                >
                  {getTranslation("staffPages.common.retry", "Retry")}
                </button>
              </div>
            ) : !Array.isArray(activities) || activities?.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                {getTranslation(
                  "staffPages.forms.noActivities",
                  "No activity records found for this request."
                )}
              </p>
            ) : (
              <div className="space-y-4">
                {Array.isArray(activities) &&
                  activities?.length > 0 &&
                  activities?.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-1 last:border-0"
                    >
                      <div className="flex justify-start gap-10 items-center mb-1">
                        <div className="flex flex-col items-center">
                          <div className="flex justify-center items-center gap-2">
                            <div className="bg-green-200 text-green-700 rounded-full p-2">
                              <ProfileIcon />
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-white">
                              {activity.user?.username ||
                                `${getTranslation(
                                  "staffPages.common.user",
                                  "User"
                                )} ${activity.user_id}`}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            {activity?.created_at}
                          </span>
                        </div>
                        <span className="font-medium text-gray-500 text-sm italic dark:text-white">
                          {activity.description?.replace(
                            activity.module || "",
                            getTranslation(
                              `staffPages.modules.${activity.module}` as TranslationKey,
                              activity.module || ""
                            )
                          )}
                        </span>
                        <span className="font-medium text-gray-500 text-sm italic dark:text-white">
                          {activity.details}
                        </span>
                        <span className="mr-auto font-semibold bg-blue-200 rounded-lg text-blue-950 px-2 py-1 text-[12px] min-w-[100px] text-center">
                          {getTranslation(
                            `staffPages.actions.${activity.action}` as TranslationKey,
                            activity.action
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RequestDetailsModal;
