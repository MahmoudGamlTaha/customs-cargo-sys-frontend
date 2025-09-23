import BackButton from "@/components/BackButton";
import Card from "@/components/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { DeleteRole, GetAllRoles, Role } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminRolesCreatePage from "./AdminRolesCreatePage";
import AdminAssignPermissionsModal from "./AdminAssignPermissionsModal";
import ConfirmModal from "@/components/ConfirmModal";
import { StandardTable, TableColumn, TableAction } from "@/components/StandardTable";

interface Imodalprops {
    addEditModal?: boolean;
    deleteModal?: boolean;
    assignModal?: boolean;
}
export default function AdminRolesListPage() {
    const { t } = useLanguage();
    const [roles, setRoles] = useState<Role[]>();
    const [openModal, setOpenModal] = useState<Imodalprops>({});
    const [selectedRow, setSelectedRow] = useState<Role>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fetchRoles = useCallback(async () => {
        const result = await GetAllRoles();

        if (result.success) {
            console.log(result?.data?.data, "SSSSSSS")
            setRoles(result.data?.data);
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

    }, [])

    const handleDeleteRole = useCallback(async () => {
        setIsLoading(true)
        const result = await DeleteRole(selectedRow?.id)
        if (result?.success) {
            setIsLoading(false);
            toast.success(t('sidebar.manageRolesPage.deletingMsg') || '')
            setOpenModal({ deleteModal: false });
            fetchRoles();
        } else {
            setIsLoading(false);
            toast.error(result?.message || '')
        }
    }, [selectedRow, fetchRoles])

    useEffect(() => {
        let ignore = false;
        fetchRoles();
        return () => {
            ignore = true; // cleanup guard
        };
    }, []);

    // Define table columns configuration
    const columns: TableColumn<Role>[] = [
      {
        key: 'id',
        header: '#',
        render: (item, index) => (
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {index + 1}
          </div>
        ),
      },
      {
        key: 'name_ar',
        header: 'Name AR',
        translationKey: 'sidebar.manageRolesPage.tableHeaderNameAr',
        render: (item) => (
          <div className="py-3 px-4 font-semibold whitespace-nowrap text-center">
            {item.name_ar}
          </div>
        ),
      },
      {
        key: 'name_en',
        header: 'Name EN',
        translationKey: 'sidebar.manageRolesPage.tableHeaderNameEn',
        render: (item) => (
          <div className="py-3 px-4 whitespace-nowrap text-center">
            {item?.name_en}
          </div>
        ),
      },
      {
        key: 'code',
        header: 'Code',
        translationKey: 'sidebar.manageRolesPage.tableHeaderCode',
        render: (item) => (
           <div className="text-sm font-mono text-gray-700 dark:text-gray-300 text-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {item?.code}
          </div>
        ),
      },
      {
        key: 'created_at',
        header: 'Created At',
        translationKey: 'sidebar.manageRolesPage.tableHeaderCreateAt',
        render: (item) => (
          <div className="py-3 px-4 whitespace-nowrap text-center">
            {new Date(item.created_at).toLocaleDateString("en-EG")}
          </div>
        ),
      },
      {
        key: 'updated_at',
        header: 'Updated At',
        translationKey: 'sidebar.manageRolesPage.tableHeaderUpdateAt',
        render: (item) => (
          <div className="py-3 px-4 whitespace-nowrap text-center">
            {new Date(item.updated_at).toLocaleDateString()}
          </div>
        ),
      },
    ];

    // Define table actions configuration
    const actions: TableAction<Role>[] = [
      {
        key: 'edit',
        label: 'Edit',
        translationKey: 'sidebar.manageRolesPage.edit',
        onClick: (role) => {
          setSelectedRow(role);
          setOpenModal({ addEditModal: true });
        },
         className: 'text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap',
      },
      {
        key: 'delete',
        label: 'Delete',
        translationKey: 'sidebar.manageRolesPage.delete',
        onClick: (role) => {
          setOpenModal({ deleteModal: true });
          setSelectedRow(role);
        },
        className: 'text-xs py-1 px-2 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap',
      },
      {
        key: 'assign',
        label: 'Assign',
        translationKey: 'sidebar.manageRolesPage.assign',
        onClick: (role) => {
          setOpenModal({ assignModal: true });
          setSelectedRow(role);
        },
         className: 'text-xs py-1 px-2 bg-green-500 text-white rounded hover:bg-green-600 whitespace-nowrap',
      },
    ];

    return (
      <>
        <ConfirmModal
          onClose={() => {
            setOpenModal({ deleteModal: false });
            setSelectedRow(undefined);
          }}
          open={openModal.deleteModal}
          title=  {t("sidebar.manageRolesPage.confirmMsg")}
          subTitle={`${selectedRow?.name_ar} - ${selectedRow?.code}`}
          handleSubmit={handleDeleteRole}
          isLoading={isLoading}
        />
        <AdminAssignPermissionsModal
          onClose={() => {
            setOpenModal({ assignModal: false });
            setSelectedRow(undefined);
          }}
          open={openModal.assignModal}
          selectedRow={selectedRow}
        />
        <AdminRolesCreatePage
          selectedRow={selectedRow}
          open={openModal.addEditModal}
          mode="add"
          onClose={() => {
            setOpenModal({ addEditModal: false });
            setSelectedRow(undefined);
            fetchRoles();
          }}
          // submittedData={(data) => console.log(data, "Submitted Data")}
        />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {t("sidebar.manageRoles")}
          </h2>
          <div className="flex gap-2">
             <button
               className="py-2 px-3 bg-brand-primary text-white rounded hover:bg-brand-primary-hover whitespace-nowrap"
               onClick={() => setOpenModal({ addEditModal: true })}
             >
                {t("sidebar.manageRolesPage.create")}
            </button>
          </div>
        </div>
        <Card>
          <StandardTable
            data={roles || []}
            columns={columns}
            actions={actions}
            emptyTextTranslationKey="sidebar.manageRolesPage.noRoles"
            emptyText="No roles found"
            className="p-4"
            tableClassName="w-full"
            headerClassName="text-md text-center text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 py-3 px-4"
            rowClassName="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            showActionsColumn={true}
            actionsColumnHeader="Actions"
            actionsColumnClassName="py-3 px-4"
            actionsContainerClassName="flex gap-2"
            actionButtonClassName="text-xs py-1 px-2 text-white rounded whitespace-nowrap"
            loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
            emptyStateClassName="text-center py-8"
            errorStateClassName="text-center py-8 text-red-500"
            tableWrapperClassName=""
          />
        </Card>
      </>
    );
}