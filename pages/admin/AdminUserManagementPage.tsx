import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Card from "../../components/Card";
import {
  User,
  UserRole,
  Wallet,
  Membership,
  Chamber,
  Branch,
} from "../../types";
import CustomSelect from "../../components/CustomSelect";
import { useLanguage, TranslationKey } from "../../contexts/LanguageContext";
import { getBranches } from "../../services/branchService";
import {
  GetAllRoles,
  listAdminUsers,
  mapApiUserToUser,
  ResetUserPassword,
  Role,
  UpdateUser,
} from "../../services/userService";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";
import AddEditUsersModal from "./AddEditUsersModal";
import { set } from "react-hook-form";
import Pagination from "@/components/Pagination";
import { IPagination } from "../staff/StaffDocumentsPage";
import {
  StandardTable,
  TableColumn,
  TableAction,
} from "../../components/StandardTable";
import { getToken } from "@/utils/getToken";

interface AdminUserManagementPageProps {
  users: User[];
  wallets: Wallet[];
  memberships: Membership[];
  chambers: Chamber[];
  onCreateUser: (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    branchId: number; // API expects numeric branch_id
    chamberId: string; // local UI uses chamber string id
  }) => Promise<boolean>;
}

const getRoleClass = (role: UserRole) => {
  switch (role) {
    case UserRole.Admin:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case UserRole.Staff:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case UserRole.Member:
      return "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light";
    case UserRole.Accountant:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case UserRole.BranchAdmin:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const getStatusClass = (status: "Active" | "Suspended") => {
  return status === "Active"
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
};

const getMembershipStatusClass = (status: Membership["status"] | "N/A") => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "on_hold":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const AdminUserManagementPage: React.FC<AdminUserManagementPageProps> = ({
  users,
  wallets,
  memberships,
  chambers,
  onCreateUser,
}) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [showCreateForm, setShowCreateForm] = useState(false);
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [username, setUsername] = useState("");
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [phone, setPhone] = useState("");
  // const [branchId, setBranchId] = useState("");
  // const [role, setRole] = useState<UserRole>(UserRole.Member);
  // const [submitting, setSubmitting] = useState(false);
  // const [formError, setFormError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [apiUsers, setApiUsers] = useState<User[] | null>(null); // null until API loaded
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [roles, setRoles] = useState<Role[]>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<User>();
  const modeRef = useRef<"create" | "edit">("create");
  const branchOptions = useMemo(
    () =>
      branches?.map((b: any) => ({
        value: String(b.id),
        label: String(
          b.name ?? b.title ?? b.branch_name ?? b.branchName ?? b.code ?? b.id
        ),
      })),
    [branches]
  );
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [openConfirmActivate, setOpenConfirmActivate] =
    useState<boolean>(false);
  const userIdRef = useRef<number | null>(null);
  const [resetPassLoading, setResetPassLoading] = useState<boolean>(false);
  const [paging, setPaging] = useState<IPagination>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState<number>(0);

  const getRoleName = useCallback(
    (roleCode: string): string => {
      console.log(roleCode, "Role ID");

      // Handle port_manager specifically since it's processed by DataProcessor
      if (roleCode === "port_manager") {
        return language === "ar" ? "مدير المنفذ" : "Port Manager";
      }

      const role = roles?.find((r) => r.code === roleCode);
      return role ? (language === "ar" ? role.name_ar : role.name_en) : "N/A";
    },
    [language, roles]
  );

  const handleResetPassword = useCallback(async () => {
    if (userIdRef.current) {
      setResetPassLoading(true);
      const result = await ResetUserPassword(userIdRef.current);
      if (result.success) {
        setResetPassLoading(false);
        toast.success("تم اعادة ضبط كلمة المرور بنجاح");
        userIdRef.current = null;
        setOpenConfirmModal(false);
      } else {
        setResetPassLoading(false);
        toast.error(result.message || "خطأ في اعادة ضبط كلمة المرور");
      }
    }
  }, [ResetUserPassword]);

  const handleActivationNull = useCallback(
    async (activate: boolean) => {
      if (activate) {
        const result = await UpdateUser({
          id: userIdRef.current,
          is_active: true,
        } as User);
        if (result.success) {
          toast.success("تم تفعيل المستخدم بنجاح");
          setOpenConfirmActivate(false);
          userIdRef.current = null;
          fetchUsers();
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await UpdateUser({
          id: userIdRef.current,
          is_active: false,
        } as User);
        if (result.success) {
          toast.success("تم ايقاف المستخدم بنجاح");
          setOpenConfirmActivate(false);
          userIdRef.current = null;
          fetchUsers();
        } else {
          toast.error(result.message);
        }
      }
    },
    [UpdateUser]
  );

  // Helper to unwrap common API response shapes into an array
  const extractUserArray = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    const d = payload?.data ?? payload;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.users)) return d.users;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(d?.items)) return d.items;
    if (Array.isArray(d?.list)) return d.list;
    return [];
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await getBranches();
        if (!ignore && res?.success) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.data ?? res.data;
          if (Array.isArray(list.branches)) {
            setBranches(list.branches);
          } else {
            console.warn("Unexpected branches payload shape:", res.data);
          }
        }
      } catch (e) {
        console.error("Failed to load branches:", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Load users from API on mount
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await listAdminUsers(
        getToken(),
        paging.pageNumber,
        paging.pageSize
      );
      if (res?.success) {
        const rawList = extractUserArray(res.data);
        setTotalRows(res.data?.data?.pagination?.total, "USERSSSS");
        const mapped = Array.isArray(rawList)
          ? rawList?.map((u) => mapApiUserToUser(u))
          : [];
        setApiUsers(mapped);
      } else {
        console.error("Failed to load users:", res?.message);
        setApiUsers([]);
      }
    } catch (e) {
      console.error("Users load error:", e);
      setApiUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [paging.pageNumber, paging.pageSize]);

  useEffect(() => {
    if (paging.pageSize || paging.pageNumber) {
      fetchUsers();
    }
  }, [paging.pageSize, paging.pageNumber, fetchUsers]);

  useEffect(() => {
    let ignore = false;
    const fetchRoles = async () => {
      //   setLoading(true);
      const result = await GetAllRoles();

      if (!ignore) {
        if (result.success) {
          console.log(result?.data?.data, "SSSSSSS");
          setRoles(result.data?.data);
        } else {
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } bg-orange-500 text-white px-4 py-2 rounded-md shadow-md`}
            >
              ⚠️ {result.message || ""}
            </div>
          ));
        }
        // setLoading(false);
      }
    };
    fetchRoles();
    return () => {
      ignore = true; // cleanup guard
    };
  }, []);

  // const reloadUsers = async () => {
  //   try {
  //     setLoadingUsers(true);
  //     const res = await listAdminUsers();
  //     const rawList = extractUserArray(res.data);
  //     const mapped = Array.isArray(rawList)
  //       ? rawList?.map((u) => mapApiUserToUser(u))
  //       : [];
  //     setApiUsers(mapped);
  //   } catch (e) {
  //     console.error("Users reload error:", e);
  //   } finally {
  //     setLoadingUsers(false);
  //   }
  // };

  const filteredUsers = useMemo(() => {
    const source = apiUsers ?? [];
    return source.filter((user) => {
      const name = language === "ar" ? user.nameAr : user.nameEn;
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [apiUsers, searchTerm, roleFilter, statusFilter, language]);

  const roleOptions = [
    { value: "all", label: t("adminPages.users.filters.allRoles") },
    { value: UserRole.Member, label: t("roles.member") },
    { value: UserRole.Staff, label: t("roles.staff") },
    { value: UserRole.Admin, label: t("roles.admin") },
    { value: UserRole.Auditor, label: t("roles.auditor") },
    { value: UserRole.Accountant, label: t("roles.accountant") },
    { value: UserRole.BranchAdmin, label: t("roles.branchAdmin") },
    { value: UserRole.PortManager, label: t("roles.portManager") },
  ];

  const statusOptions = [
    { value: "all", label: t("adminPages.users.filters.allStatuses") },
    { value: "Active", label: t("adminPages.users.statuses.active") },
    { value: "Suspended", label: t("adminPages.users.statuses.suspended") },
  ];

  const roleSelectOptions = [
    { value: UserRole.Member, label: t("roles.member") },
    { value: UserRole.Staff, label: t("roles.staff") },
    { value: UserRole.Admin, label: t("roles.admin") },
    { value: UserRole.Auditor, label: t("roles.auditor") },
    { value: UserRole.Accountant, label: t("roles.accountant") },
    { value: UserRole.BranchAdmin, label: t("roles.branchAdmin") },
  ];

  const getUserWalletBalance = (userId: string) => {
    const wallet = wallets.find((w) => w.userId === userId);
    return wallet ? wallet.balance : null;
  };

  const getUserMembershipStatus = (
    userId: string
  ): Membership["status"] | "N/A" => {
    const membership = memberships.find((m) => m.userId === userId);
    return membership ? membership.status : "N/A";
  };

  const getBranchNameById = (branchId: number): string => {
    const branch = branches.find((b: any) => b.id == branchId);
    if (branch) {
      return String(branch.name);
    }
    return "Unknown";
  };

  // const handleSubmitCreate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setFormError(null);
  //   if (
  //     !firstName.trim() ||
  //     !lastName.trim() ||
  //     !username.trim() ||
  //     !email.trim() ||
  //     !password.trim() ||
  //     !branchId
  //   ) {
  //     setFormError("Please fill in all required fields.");
  //     return;
  //   }
  //   // Find the selected branch from the API list and derive numeric id
  //   const selectedBranch =
  //     branches.find((b: any) => String(b?.id) === String(branchId)) || null;
  //   const branchNumericId = selectedBranch
  //     ? Number(selectedBranch.id)
  //     : Number(branchId);
  //   if (!selectedBranch || !Number.isFinite(branchNumericId)) {
  //     setFormError("Invalid branch selected.");
  //     return;
  //   }
  //   // Map to a local chamberId for UI/state by matching on name; fallback to a synthetic id
  //   const branchName = String(selectedBranch.name);
  //   const matchedChamber =
  //     chambers.find(
  //       (c) => c.name.trim().toLowerCase() === branchName.trim().toLowerCase()
  //     ) || null;
  //   const chamberIdToUse = matchedChamber
  //     ? matchedChamber.id
  //     : `branch_${branchNumericId}`;
  //   try {
  //     setSubmitting(true);
  //     const ok = await onCreateUser({
  //       username,
  //       email,
  //       password,
  //       firstName,
  //       lastName,
  //       phone: phone || undefined,
  //       role,
  //       branchId: branchNumericId,
  //       chamberId: chamberIdToUse,
  //     });
  //     if (ok) {
  //       setShowCreateForm(false);
  //       setFirstName("");
  //       setLastName("");
  //       setUsername("");
  //       setEmail("");
  //       setPassword("");
  //       setPhone("");
  //       setBranchId("");
  //       setRole(UserRole.Member);
  //       // Refresh list from API after successful creation
  //       await reloadUsers();
  //     } else {
  //       setFormError("Failed to create user.");
  //     }
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  // Define table columns configuration
  const columns: TableColumn<User>[] = [
    {
      key: "name",
      header: "Name",
      translationKey: "adminPages.users.table.name",
      render: (user) => (
        <div className="max-w-[250px] truncate overflow-hidden text-ellipsis py-3 px-4 font-semibold whitespace-nowrap">
          {language === "ar" ? user.nameAr : user.nameEn}
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      translationKey: "adminPages.users.table.email",
      render: (user) => (
        <div className="max-w-[250px] truncate overflow-hidden text-ellipsis py-3 px-4 whitespace-nowrap">
          {user.email}
        </div>
      ),
    },
    // {
    //   key: 'company',
    //   header: 'Company',
    //   translationKey: 'adminPages.users.table.company',
    //   render: (user) => (
    //     <div className="max-w-[250px] truncate overflow-hidden text-ellipsis py-3 px-4 whitespace-nowrap">
    //       {user.companyNameAr
    //         ? language === "ar"
    //           ? user.companyNameAr
    //           : user.companyNameEn
    //         : "N/A"}
    //     </div>
    //   ),
    // },
    {
      key: "branch",
      header: "Branch",
      translationKey: "adminPages.users.table.branch",
      render: (user) => (
        <div className="py-3 px-4 whitespace-nowrap">
          {user.branchId ? getBranchNameById(user.branchId) : "N/A"}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      translationKey: "adminPages.users.table.role",
      render: (user) => (
        <div className="py-3 px-4">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getRoleClass(
              user.role
            )}`}
          >
            {getRoleName(user.role)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      translationKey: "adminPages.users.table.status",
      render: (user) => (
        <div className="py-3 px-4">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
              user.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {user.is_active
              ? t("adminPages.users.statuses.active")
              : t("adminPages.users.statuses.suspended")}
          </span>
        </div>
      ),
    },
    // {
    //   key: "membershipStatus",
    //   header: "Membership",
    //   translationKey: "adminPages.users.table.membershipStatus",
    //   render: (user) => {
    //     const membershipStatus = getUserMembershipStatus(user.id);
    //     return (
    //       <div className="py-3 px-4">
    //         <span
    //           className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getMembershipStatusClass(
    //             membershipStatus
    //           )}`}
    //         >
    //           {t(
    //             `membership.status.${
    //               membershipStatus === "N/A" ? "na" : membershipStatus
    //             }` as TranslationKey
    //           )}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   key: "balance",
    //   header: "Balance",
    //   translationKey: "adminPages.users.table.balance",
    //   render: (user) => {
    //     const balance = getUserWalletBalance(user.id);
    //     return (
    //       <div className="py-3 px-4 font-mono whitespace-nowrap">
    //         {balance !== null ? `${balance.toFixed(2)}` : "N/A"}
    //       </div>
    //     );
    //   },
    // },
  ];

  // Define table actions configuration
  const actions: TableAction<User>[] = [
    {
      key: "edit",
      label: "Edit",
      translationKey: "adminPages.users.actions.edit",
      onClick: (user) => {
        setOpenModal(true);
        modeRef.current = "edit";
        userIdRef.current = Number(user?.id);
      },
      className:
        "text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap",
    },
    {
      key: "activate",
      label: "Activate/Suspend",
      translationKey: (user) =>
        user?.is_active
          ? "adminPages.users.actions.suspend"
          : "adminPages.users.actions.activate",
      onClick: (user) => {
        setOpenConfirmActivate(true);
        userIdRef.current = Number(user?.id);
        setSelectedRow(user);
      },
      className: (user) =>
        `text-xs py-1 px-2 text-white rounded whitespace-nowrap ${
          user?.is_active
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`,
      condition: () => true, // Always show
    },
    {
      key: "resetPassword",
      label: "Reset Password",
      translationKey: "adminPages.users.actions.resetPassword",
      onClick: (user) => {
        setOpenConfirmModal(true);
        userIdRef.current = Number(user?.id);
      },
      className:
        "text-xs py-1 px-2 bg-purple-500 text-white rounded hover:bg-purple-600 whitespace-nowrap",
    },
  ];

  return (
    <div>
      <AddEditUsersModal
        open={openModal}
        selectedId={userIdRef.current}
        mode={modeRef.current}
        onClose={() => {
          setOpenModal(false);
          userIdRef.current = null;
          modeRef.current = "create";
          fetchUsers();
        }}
        roles={roles}
        branchOptions={branches || []}
      />
      <ConfirmModal
        open={openConfirmModal}
        handleSubmit={handleResetPassword}
        onClose={() => {
          setOpenConfirmModal(false);
          userIdRef.current = null;
        }}
        title={t("adminPages.users.table.confirmTitle")}
        isLoading={resetPassLoading}
      />

      <ConfirmModal
        open={openConfirmActivate}
        handleSubmit={() =>
          handleActivationNull(selectedRow?.is_active ? false : true)
        }
        onClose={() => {
          setOpenConfirmActivate(false);
          userIdRef.current = null;
          setSelectedRow(undefined);
        }}
        title={
          selectedRow?.is_active
            ? t("adminPages.users.actions.diActiveMsg")
            : t("adminPages.users.actions.activeMsg")
        }
        isLoading={resetPassLoading}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          {t("adminPages.users.title")}
        </h2>
        <div className="flex gap-2">
          <button
            className="py-2 px-3 bg-brand-primary text-white rounded hover:bg-brand-primary-hover whitespace-nowrap"
            onClick={() => {
              setOpenModal(true);
              modeRef.current = "create";
            }}
            // onClick={() => setShowCreateForm(true)}
          >
            {t("adminPages.users.createUserbtn")}
          </button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t("adminPages.users.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:col-span-2 p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500"
          />
          <CustomSelect
            options={
              roles && roles?.length > 0
                ? [
                    {
                      code: "all",
                      name_ar: t("adminPages.users.filters.allRoles"),
                    },
                    ...roles,
                  ]
                : roleOptions
            }
            displayKey={"name_ar"}
            valueKey={"code"}
            value={roleFilter}
            onChange={setRoleFilter}
          />
          <CustomSelect
            options={statusOptions}
            displayKey={"label"}
            valueKey={"value"}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        <StandardTable
          data={filteredUsers}
          columns={columns}
          actions={actions}
          loading={loadingUsers}
          emptyTextTranslationKey="adminPages.users.noUsers"
          emptyText="No users found"
          loadingTextTranslationKey="adminPages.users.loading"
          loadingText="Loading users..."
          className="overflow-x-auto"
          tableClassName="w-full min-w-[768px]"
          headerClassName="border-b dark:bg-gray-600 dark:border-gray-700 py-3 px-4 whitespace-nowrap"
          rowClassName="max-w-[250px] truncate overflow-hidden text-ellipsis border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          showActionsColumn={true}
          actionsColumnHeader="Actions"
          actionsColumnClassName="py-3 px-4"
          actionsContainerClassName="flex gap-2"
          actionButtonClassName="text-xs py-1 px-2 text-white rounded whitespace-nowrap"
          loadingSpinnerClassName="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
          emptyStateClassName="text-center py-8"
          errorStateClassName="text-center py-8 text-red-500"
          tableWrapperClassName="overflow-x-auto"
        />
        <Pagination
          onPageChange={(p, s) => setPaging({ pageNumber: p, pageSize: s })}
          totalItems={totalRows}
        />
      </Card>

      {/* {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Create User
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    placeholder="+1-415-555-0199"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <CustomSelect
                    displayKey={"label"}
                    valueKey={"value"}
                    options={branchOptions}
                    value={branchId}
                    onChange={setBranchId}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <CustomSelect
                    displayKey={"name_ar"}
                    valueKey={"code"}
                    options={roles}
                    value={role as unknown as string}
                    onChange={(v) => setRole(v as UserRole)}
                  />
                </div>
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="py-2 px-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-3 bg-brand-primary text-white rounded hover:bg-brand-primary-hover disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AdminUserManagementPage;
