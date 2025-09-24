import React, { useState, useMemo, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import NotFoundPage from "./pages/error/404page";
import {
  UserRole,
  Membership,
  Certificate,
  Payment,
  Event,
  Dispute,
  Chamber,
  Wallet,
  WalletTransaction,
  User,
  RequestStatus,
  CertificateType,
  PaymentType,
  Invoice,
  Course,
  WalletTransactionType,
  DocumentRequest,
  MembershipRequest,
  CertificateOfOriginData,
  MemberProfile,
  LegacyEvent,
  SupportTicket,
} from "./types";
import {
  INITIAL_MEMBER_PROFILE,
  MOCK_COURSES,
  MOCK_SUPPORT_TICKETS,
  MOCK_BI_DATA,
  MOCK_USERS,
  MOCK_MEMBERSHIPS,
  MOCK_CERTIFICATES,
  MOCK_PAYMENTS,
  MOCK_EVENTS,
  MOCK_DISPUTES,
  MOCK_CHAMBERS,
  MOCK_WALLETS,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_INVOICES,
} from "./constants";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  LanguageProvider,
  useLanguage,
  TranslationKey,
} from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import WelcomeScreen from "./pages/WelcomeScreen";
import LoginPage from "./pages/LoginPage";
import MemberDashboard from "./pages/MemberDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BranchAdminDashboard from "./pages/BranchAdminDashboard";
import BranchInquiriesPage from "./pages/branch/BranchInquiriesPage";
import ArbitratorDashboard from "./pages/ArbitratorDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import AccountantDocumentsPage from "./pages/accountant/AccountantDocumentsPage";
import AccountantDocumentReviewPage from "./pages/accountant/AccountantDocumentReviewPage";
import MembershipApplication from "./pages/MembershipApplication";
import DocumentServices from "./pages/DocumentServices";
import DisputeResolution from "./pages/DisputeResolution";
import EventsPage from "./pages/EventsPage";
import SupportPage from "./pages/SupportPage";
import ElearningPage from "./pages/ElearningPage";
import UserProfile from "./pages/UserProfile";
import BusinessIntelligencePage from "./pages/BusinessIntelligencePage";
import B2BNetworkingPage from "./pages/B2BNetworkingPage";
import MembershipCertificatePage from "./pages/MembershipCertificatePage";
import OriginCertificatePage from "./pages/OriginCertificatePage";
import CourseCertificatePage from "./pages/CourseCertificatePage";
import MembershipReviewPage from "./pages/MembershipReviewPage";
import DisputeDetailsPage from "./pages/DisputeDetailsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import ReceiptPage from "./pages/ReceiptPage";
import WalletPage from "./pages/WalletPage";
import TopUpPage from "./pages/TopUpPage";
import TransferPage from "./pages/TransferPage";
import StaffMembershipsPage from "./pages/staff/StaffMembershipsPage";
import StaffDocumentsPage from "./pages/staff/StaffDocumentsPage";
import CertificateInquiryPage from "./pages/staff/CertificateInquiryPage";
import StaffWalletPage from "./pages/staff/StaffWalletPage";
import StaffClientDocumentRequestPage from "./pages/staff/StaffClientDocumentRequestPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminChamberPage from "./pages/admin/AdminChamberPage";
import AdminFinancialsPage from "./pages/admin/AdminFinancialsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminBranchPage from "./pages/admin/AdminBranchPage";
import CertificateTypesPage from "./pages/admin/CertificateTypesPage";
import UserGuidePage from "./pages/UserGuidePage";
import ChamberEnrollmentCertificatePage from "./pages/ChamberEnrollmentCertificatePage";
import StaffDocumentReviewPage from "./pages/staff/StaffDocumentReviewPage";
import CertificatePrintPage from "./components/CertificatePrintPage";
import PrintLayout from "./pages/PrintLayout";
import ComisaPrint from "./pages/ComisaPrint";
import FreeTradePrint from "./pages/FreeTradePrint";
import PublicComisaCertificate from "./pages/public/PublicComisaCertificate";
import PublicFreeTradeCertificate from "./pages/public/PublicFreeTradeCertificate";
import PublicCertificateValidation from "./pages/public/certificates/validation/PublicCertificateValidation";

import {
  login as authLogin,
  register as authRegister,
} from "./services/authService";
import { createAdminUser } from "./services/userService";

import toast, { resolveValue, Toaster } from "react-hot-toast";
import { CheckCircleIcon, CloseIcon, MessageIcon } from "./components/icons";
import AdminRolesListPage from "./pages/admin/adminRoles/AdminRolesListPage";
import ChangePassword from "./pages/ChangePassword";

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, loading, setToken, setUser, token } = useAuth();
  const currentUser = user; // for compatibility with existing code
  const setCurrentUser = setUser;

  // Mock Data State
  const [openChangePassModal, setOpenChangePassModal] = useState<boolean>();
  const [users, setUsers] =
    useState<(User & { password?: string })[]>(MOCK_USERS);
  const [memberships, setMemberships] =
    useState<Membership[]>(MOCK_MEMBERSHIPS);
  const [certificates, setCertificates] =
    useState<Certificate[]>(MOCK_CERTIFICATES);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [chambers, setChambers] = useState<Chamber[]>(MOCK_CHAMBERS);
  const [wallets, setWallets] = useState<Wallet[]>(MOCK_WALLETS);
  const [walletTransactions, setWalletTransactions] = useState<
    WalletTransaction[]
  >(MOCK_WALLET_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [supportTickets, setSupportTickets] =
    useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);

  // Authentication functions
  const login = async (email: string, password: string) => {
    try {
      const response = await authLogin(email, password);
      // Convert login response to expected format
      const loginResult = {
        success: true, // If we got here without an exception, assume success
        data: response || {},
        token: response?.token || null,
      };

      // If we have no token and no user, consider it a failure
      if (!loginResult.token && !response.user) {
        loginResult.success = false;
      }

      if (!loginResult.success) {
        return false;
      }

      const user = loginResult.data as any;

      // Set the authentication token in context
      if (response.token) {
        console.log("Setting token from login response");
        setToken(response.token);
      } else {
        // For demo/development, set a mock token if the API didn't return one
        const mockToken = "mock-jwt-token-" + Date.now();
        console.log("Setting mock token:", mockToken);
        setToken(mockToken);
      }

      // For mock purposes, if we got back a user from the API but we don't have
      // a corresponding mock user, create one
      let localUser = users.find((u) => u.email === email);
      if (!localUser && user) {
        localUser = {
          id: users?.length + 1,
          email: user.email,
          name: user.name || email.split("@")[0],
          role: user.role || UserRole.Member,
          status: "active",
          createdAt: new Date().toISOString(),
        };
        setUsers([...users, localUser]);
      }

      if (localUser) {
        setCurrentUser(localUser);

        // Redirect based on role
        //if (localUser.role === UserRole.Member) {
        //  navigate('/member-dashboard');
        //} else
        if (localUser.role === UserRole.Staff) {
          navigate("/staff-dashboard");
        } else if (localUser.role === UserRole.BranchAdmin) {
          navigate("/dashboard");
        } else if (localUser.role === UserRole.Admin) {
          navigate("/admin-dashboard");
        } else if (localUser.role === UserRole.Auditor) {
          // Use string instead of enum
          //navigate('/auditor-dashboard');
          navigate("/staff-dashboard");
        } else if (localUser.role === UserRole.Accountant) {
          navigate("/accountant-dashboard");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Computed Value
  const currentUserWallet = wallets.find((w) => w.userId === currentUser?.id);
  const currentUserMembership = useMemo(() => {
    if (!currentUser) return null;
    return memberships.find((m) => m.userId === currentUser.id) || null;
  }, [currentUser, memberships]);

  // --- Auth Functions (via API) ---

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { user, token } = await authLogin(email, password);
      if (token) {
        localStorage.setItem("auth_token", token);
      }
      setCurrentUser(user);
      // Sync with local state for pages relying on mock collections
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        return exists
          ? prev?.map((u) => (u.id === user.id ? { ...user } : u))
          : [...prev, { ...user }];
      });
      // Ensure a wallet placeholder exists
      setWallets((prev) => {
        const exists = prev.some((w) => w.userId === user.id);
        return exists
          ? prev
          : [
              ...prev,
              {
                id: user.id,
                userId: user.id,
                balance: 0,
                lastUpdated: new Date().toISOString(),
              },
            ];
      });
      if (user.is_password_reset_required) {
        setOpenChangePassModal(true);
        toast.custom((to) => (
          <div
            className={`${
              to.visible ? "animate-enter" : "animate-leave"
            } bg-orange-500 text-white px-4 py-2 rounded-md shadow-md`}
          >
            {t("login.requiredChangePasswordErr")}
          </div>
        ));
      } else {
        navigate("/dashboard");
      }
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const handleSignup = async (
    fullName: string,
    email: string,
    phone: string,
    chamberId: number,
    password: string
  ): Promise<boolean> => {
    const res = await authRegister(fullName, email, phone, chamberId, password);
    if (res.success) {
      toast.success(
        "Signup successful! You can now log in with your new account."
      );
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const handleProcessWalletPayment = async (
    userId: string,
    amount: number,
    paymentType: PaymentType,
    description: string
  ): Promise<{ success: boolean; paymentId?: string }> => {
    const userWallet = wallets.find((w) => w.userId === userId);
    if (!userWallet || userWallet.balance < amount) {
      toast.custom((to) => (
        <div
          className={`${
            to.visible ? "animate-enter" : "animate-leave"
          } bg-orange-500 text-white px-4 py-2 rounded-md shadow-md`}
        >
          ⚠️{t("wallet.insufficientFunds")}
        </div>
      ));
      return { success: false };
    }

    const paymentId = `payment-${Date.now()}`;

    // Update wallet
    setWallets((prev) =>
      prev?.map((w) =>
        w.userId === userId
          ? {
              ...w,
              balance: w.balance - amount,
              lastUpdated: new Date().toISOString(),
            }
          : w
      )
    );

    // Create payment record
    const newPayment: Payment = {
      id: paymentId,
      userId,
      paymentType,
      amount,
      status: "paid",
      paymentDate: new Date().toISOString(),
      method: "wallet",
      transactionId: `tx-${paymentId}`,
    };
    setPayments((prev) => [...prev, newPayment]);

    // Create wallet transaction record
    const newTransaction: WalletTransaction = {
      id: `tx-out-${paymentId}`,
      userId,
      type: WalletTransactionType.Payment,
      amount,
      date: new Date().toISOString(),
      description,
      status: "Completed",
      referenceId: paymentId,
    };
    setWalletTransactions((prev) => [...prev, newTransaction]);

    // Create invoice for receipt page
    const newInvoice: Invoice = {
      id: paymentId,
      description,
      amount,
      status: "paid",
      requestId: paymentId,
      requestType: paymentType,
      paymentDate: new Date().toISOString(),
    };
    setInvoices((prev) => [...prev, newInvoice]);

    return { success: true, paymentId };
  };

  const handleApplyForMembership = async (): Promise<boolean> => {
    if (!currentUser) return false;
    const fee = 250;
    const description = t("invoice.newMembershipFee", {
      requestId: `M-${Date.now()}`,
    });

    const { success, paymentId } = await handleProcessWalletPayment(
      currentUser.id,
      fee,
      "membership_fee",
      description
    );
    if (!success || !paymentId) return false;

    const existingMembershipIndex = memberships.findIndex(
      (m) => m.userId === currentUser.id
    );

    if (existingMembershipIndex > -1) {
      // Handles re-application for rejected memberships
      setMemberships((prev) =>
        prev?.map((m) =>
          m.userId === currentUser.id
            ? { ...m, status: "pending", createdAt: new Date().toISOString() }
            : m
        )
      );
    } else {
      // New application
      const newMembershipId = `mem-${currentUser.id}`;
      const newMembership: Membership = {
        id: newMembershipId,
        userId: currentUser.id,
        status: "pending",
        membershipNumber: "",
        expiryDate: "",
        createdAt: new Date().toISOString(),
      };
      setMemberships((prev) => [...prev, newMembership]);

      // Link membershipId to user
      const updatedUser = { ...currentUser, membershipId: newMembershipId };
      setCurrentUser(updatedUser);
      setUsers((prev) =>
        prev?.map((u) => (u.id === currentUser.id ? updatedUser : u))
      );
    }

    toast.success(t("wallet.paymentSuccess"));
    navigate("/dashboard");
    return true;
  };

  const handleRequestCertificate = async (
    serviceTypeKey: CertificateType,
    translatedServiceType: string,
    fee: number,
    notes: string,
    clientId?: string
  ): Promise<boolean> => {
    const userId = clientId || currentUser?.id || "";
    if (!userId) return false;
    const newRequestId = `CERT-${Date.now()}`;
    const description = t("invoice.serviceFee", {
      serviceType: translatedServiceType,
      requestId: newRequestId,
    });

    const { success } = await handleProcessWalletPayment(
      userId,
      fee,
      "certificate_fee",
      description
    );
    if (!success) return false;

    const newCertificate: Certificate = {
      id: newRequestId,
      userId: userId,
      certificateType: serviceTypeKey,
      status: "submitted",
      issueDate: null,
      documentUrl: "",
      notes,
      createdAt: new Date().toISOString(),
    };
    setCertificates((prev) => [...prev, newCertificate]);

    toast.success(t("wallet.paymentSuccess"));
    navigate("/document-services");
    return true;
  };

  const handleRegisterForEvent = async (event: Event): Promise<boolean> => {
    if (!currentUser) return false;
    if (event.participants.includes(currentUser.id)) {
      toast.error("You are already registered for this event.");
      return false;
    }

    if (event.fee > 0) {
      const description = t("invoice.eventRegistration", {
        eventTitle: t(`data.events.${event.title}` as TranslationKey),
      });
      const { success } = await handleProcessWalletPayment(
        currentUser.id,
        event.fee,
        "event_fee",
        description
      );
      if (!success) {
        return false; // Alert is handled inside payment function
      }
    }

    setEvents((prev) =>
      prev?.map((e) =>
        e.id === event.id
          ? { ...e, participants: [...e.participants, currentUser.id] }
          : e
      )
    );
    toast.success("Successfully registered for event!");
    navigate("/events");
    return true;
  };

  const handleRequestTopUp = async (
    amount: number,
    method: string
  ): Promise<void> => {
    if (!currentUser) return;
    const newTransaction: WalletTransaction = {
      id: `tx-topup-${Date.now()}`,
      userId: currentUser.id,
      type: WalletTransactionType.Charge,
      amount,
      date: new Date().toISOString(),
      description: t("wallet.topUpDescription", { method }),
      status: "Pending",
    };
    setWalletTransactions((prev) => [...prev, newTransaction]);
    toast.success(t("wallet.topUpPending"));
    navigate("/wallet");
  };

  const handleConfirmTopUp = async (transactionId: string): Promise<void> => {
    const tx = walletTransactions.find((t) => t.id === transactionId);
    if (!tx || tx.status !== "Pending") return;

    // Update wallet balance
    setWallets((prev) =>
      prev?.map((w) =>
        w.userId === tx.userId
          ? {
              ...w,
              balance: w.balance + tx.amount,
              lastUpdated: new Date().toISOString(),
            }
          : w
      )
    );
    // Update transaction status
    setWalletTransactions((prev) =>
      prev?.map((t) =>
        t.id === transactionId ? { ...t, status: "Completed" } : t
      )
    );
  };

  const handleTransfer = async (
    toUserId: string,
    amount: number,
    notes: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const fromWallet = wallets.find((w) => w.userId === currentUser.id);
    const toWallet = wallets.find((w) => w.userId === toUserId);
    const toUser = users.find((u) => u.id === toUserId);

    if (!fromWallet || !toWallet || !toUser) {
      toast.error(t("wallet.transfer.userNotFound"));
      return false;
    }
    if (fromWallet.balance < amount) {
      toast.error(t("wallet.insufficientFunds"));
      return false;
    }

    const now = new Date().toISOString();

    // Update balances
    setWallets((prev) =>
      prev?.map((w) => {
        if (w.userId === currentUser.id)
          return { ...w, balance: w.balance - amount, lastUpdated: now };
        if (w.userId === toUserId)
          return { ...w, balance: w.balance + amount, lastUpdated: now };
        return w;
      })
    );

    // Create transaction logs
    const fromUserName = currentUser.fullName;
    const toUserName = toUser.fullName;

    const outTransaction: WalletTransaction = {
      id: `tx-out-${Date.now()}`,
      userId: currentUser.id,
      type: WalletTransactionType.TransferOut,
      amount,
      date: now,
      description: t("wallet.transfer.outDescription", {
        name: toUserName,
        notes,
      }),
      status: "Completed",
      relatedUserId: toUserId,
    };
    const inTransaction: WalletTransaction = {
      id: `tx-in-${Date.now()}`,
      userId: toUserId,
      type: WalletTransactionType.TransferIn,
      amount,
      date: now,
      description: t("wallet.transfer.inDescription", {
        name: fromUserName,
        notes,
      }),
      status: "Completed",
      relatedUserId: currentUser.id,
    };
    setWalletTransactions((prev) => [...prev, outTransaction, inTransaction]);

    toast.success(t("wallet.transfer.success"));
    return true;
  };

  const handleReviewMembership = async (
    membershipId: string,
    decision: "approved" | "rejected" | "on_hold"
  ) => {
    setMemberships((prev) =>
      prev?.map((mem) => {
        if (mem.id !== membershipId) return mem;
        const updates: Partial<Membership> = { status: decision };
        if (decision === "approved") {
          updates.membershipNumber = `LCCI-${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          const expiry = new Date();
          expiry.setFullYear(expiry.getFullYear() + 1);
          updates.expiryDate = expiry.toISOString();
        }
        return { ...mem, ...updates };
      })
    );
    navigate("/staff/memberships");
  };

  const handleReviewCertificate = async (
    certificateId: string,
    decision: "approved" | "rejected" | "on_hold"
  ) => {
    setCertificates((prev) =>
      prev?.map((cert) => {
        if (cert.id !== certificateId) return cert;
        const updates: Partial<Certificate> = { status: decision };
        if (decision === "approved") {
          updates.issueDate = new Date().toISOString();
          updates.documentUrl = `/path/to/generated-doc-${certificateId}.pdf`; // Mock path
        }
        return { ...cert, ...updates };
      })
    );
  };

  const handleContinueCourse = (courseId: string) => {
    setCourses((prev) =>
      prev?.map((c) => {
        if (c.id === courseId && c.progress < 100) {
          return { ...c, progress: Math.min(100, c.progress + 25) };
        }
        return c;
      })
    );
  };

  const handleRegisterDispute = async (
    againstUser: string,
    details: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    const newDispute: Dispute = {
      id: `disp-${Date.now()}`,
      submittedBy: currentUser.id,
      againstUser,
      details,
      status: "open",
      submittedAt: new Date().toISOString(),
      resolutionNotes: "",
    };
    setDisputes((prev) => [...prev, newDispute]);
    toast.success("Dispute registered successfully.");
    return true;
  };

  const handleSubmitTicket = async (title: string): Promise<boolean> => {
    if (!currentUser) return false;
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      userId: currentUser.id,
      title,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [...prev, newTicket]);
    toast.success("Support ticket submitted successfully.");
    return true;
  };

  const handleAdminCreateUser = async (data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    branchId: number;
  }): Promise<boolean> => {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      branchId,
    } = data;
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      const result = await createAdminUser({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        branchId: branchId,
      } as any);

      if (!result.success) {
        console.error("Create user API failed:", result.message, result.data);
        return false;
      }

      const api = result.data as any;
      const id = String(
        api?.id ?? api?.user?.id ?? api?.data?.id ?? `user-${Date.now()}`
      );
      const nowIso = new Date().toISOString();
      const newUser: User = {
        id,
        fullName,
        email,
        phone: phone || "",
        role,
        branchId,
        membershipId: "",
        createdAt: nowIso,
        status: "Active",
        nameAr: fullName,
        nameEn: fullName,
        companyNameAr: "",
        companyNameEn: "",
        accessToken: "", // Adding required accessToken field
        is_password_reset_required: false, // Adding required field
      };

      setUsers((prev) => [...prev, newUser]);
      setWallets((prev) => [
        ...prev,
        { id, userId: id, balance: 0, lastUpdated: nowIso },
      ]);
      return true;
    } catch (e) {
      console.error("Failed to create user via API:", e);
      return false;
    }
  };

  const handleUpdateUserProfile = async (
    userId: string,
    updates: Partial<User>
  ): Promise<void> => {
    const updatedUser = users.find((u) => u.id === userId);
    if (updatedUser) {
      const newUserState = { ...updatedUser, ...updates };
      setUsers((prevUsers) =>
        prevUsers?.map((u) => (u.id === userId ? newUserState : u))
      );
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(newUserState as User);
      }
    }
  };

  const memberProfile: MemberProfile = useMemo(() => {
    if (!currentUser) return INITIAL_MEMBER_PROFILE;
    const membership = memberships.find((m) => m.userId === currentUser.id);
    const chamber = chambers.find((c) => c.id === String(currentUser.branchId));
    const getMembershipStatus = (
      status: Membership["status"] | undefined
    ): MemberProfile["membershipStatus"] => {
      if (!status) return "Inactive";
      switch (status) {
        case "approved":
          return "Active";
        case "pending":
          return "Pending";
        case "on_hold":
          return "Pending";
        case "rejected":
          return "rejected";
        default:
          return "Inactive";
      }
    };
    return {
      id: currentUser.id,
      nameAr: currentUser.nameAr,
      nameEn: currentUser.nameEn,
      companyNameAr: currentUser.companyNameAr,
      companyNameEn: currentUser.companyNameEn,
      membershipStatus: getMembershipStatus(membership?.status),
      expiryDate: membership?.expiryDate || "N/A",
      commercialRegistryNo: membership?.membershipNumber || "N/A",
      membershipGrade: "excellent",
      title: "chairman",
      chamberName: chamber ? chamber.name : "N/A",
    };
  }, [currentUser, memberships, chambers]);

  // --- Data Transformation for Legacy Components ---
  const legacyDocumentRequests: DocumentRequest[] = useMemo(
    () =>
      certificates?.map((c) => {
        let certData: CertificateOfOriginData | undefined = undefined;
        if (c.certificateType === "origin" && c.notes) {
          try {
            certData = JSON.parse(c.notes);
          } catch (e) {
            console.error("Failed to parse certificate notes:", e);
          }
        }
        return {
          id: c.id,
          userId: c.userId,
          serviceType: c.certificateType,
          date: new Date(c.createdAt).toISOString().split("T")[0],
          status:
            c.status === "submitted"
              ? RequestStatus.ISSUED
              : c.status === "approved"
              ? RequestStatus.COMPLETED
              : c.status === "rejected"
              ? RequestStatus.REJECTED
              : RequestStatus.ON_HOLD,
          fee: 150, // Mock fee
          certificateData: certData,
        };
      }),
    [certificates]
  );

  const legacyEvents: LegacyEvent[] = useMemo(
    () =>
      events?.map((e) => ({
        ...e,
        isRegistered: currentUser
          ? e.participants.includes(currentUser.id)
          : false,
      })),
    [events, currentUser]
  );

  const membershipRequests: MembershipRequest[] = useMemo(
    () =>
      memberships
        ?.map((mem): MembershipRequest | null => {
          const user = users.find((u) => u.id === mem.userId);
          if (!user) return null;
          let status: RequestStatus;
          switch (mem.status) {
            case "approved":
              status = RequestStatus.COMPLETED;
              break;
            case "rejected":
              status = RequestStatus.REJECTED;
              break;
            case "pending":
              status = RequestStatus.ISSUED;
              break;
            case "on_hold":
              status = RequestStatus.ON_HOLD;
              break;
            default:
              status = RequestStatus.ON_HOLD;
          }
          return {
            id: mem.id,
            userId: user.id,
            date: new Date(mem.createdAt).toISOString().split("T")[0],
            status: status,
            companyNameAr: user.companyNameAr,
            companyNameEn: user.companyNameEn,
            applicantNameAr: user.nameAr,
            applicantNameEn: user.nameEn,
          };
        })
        .filter((req): req is MembershipRequest => req !== null),
    [memberships, users]
  );

  const dashboardElement = useMemo(() => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case UserRole.Member:
        return (
          <MemberDashboard
            memberProfile={memberProfile}
            documentRequests={legacyDocumentRequests.filter(
              (r) => r.userId === currentUser.id
            )}
            invoices={invoices}
            events={legacyEvents}
          />
        );
      case UserRole.Staff:
        return (
          <StaffDashboard
            membershipRequestsCount={
              memberships.filter((r) => r.status === "pending")?.length
            }
            documentRequestsCount={
              certificates.filter((c) => c.status === "submitted")?.length
            }
            paymentsToConfirmCount={
              walletTransactions.filter(
                (tx) => tx.type === "charge" && tx.status === "Pending"
              )?.length
            }
          />
        );
      case UserRole.Admin:
        return (
          <AdminDashboard
            memberCount={users?.length}
            requestsCount={certificates?.length}
            wallets={wallets}
          />
        );
      case UserRole.BranchAdmin:
        return (
          <BranchAdminDashboard
            memberCount={users?.length}
            requestsCount={certificates?.length}
            wallets={wallets}
          />
        );
      case UserRole.Accountant:
        return (
          <AccountantDashboard
            documentRequestsCount={
              certificates.filter(
                (c) =>
                  c.status === "submitted" || c.status === "pending_payment"
              )?.length
            }
            approvedRequestsCount={
              certificates.filter((c) => c.status === "approved")?.length
            }
            rejectedRequestsCount={
              certificates.filter((c) => c.status === "rejected")?.length
            }
          />
        );
      case UserRole.Auditor:
        return (
          <StaffDashboard
            membershipRequestsCount={
              memberships.filter((r) => r.status === "pending")?.length
            }
            documentRequestsCount={
              certificates.filter((c) => c.status === "submitted")?.length
            }
            paymentsToConfirmCount={
              walletTransactions.filter(
                (tx) => tx.type === "charge" && tx.status === "Pending"
              )?.length
            }
          />
        );
      default:
        return null;
    }
  }, [
    currentUser,
    legacyDocumentRequests,
    memberships,
    events,
    walletTransactions,
    wallets,
    invoices,
    memberProfile,
    disputes,
    users,
  ]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl font-bold">Loading Platform...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          position: "bottom-center",
          // default style
          className: "text-white rounded-md",
          error: {
            className: "bg-red-600 text-white text-sm",
          },
          success: {
            className: "bg-green-600 text-white text-sm",
          },
          // add warning
          custom: {
            className: "bg-orange-600 text-white text-sm",
          },
        }}
      >
        {(t) => (
          <div
            className={`flex items-center justify-center gap-3 rounded-md px-3 py-2
        ${t.type === "error" ? "bg-red-600 text-white text-sm" : ""}
        ${t.type === "success" ? "bg-green-600 text-white text-sm" : ""}
        ${t.type === "custom" ? "bg-orange-600 text-white text-sm" : ""}`}
            style={{
              opacity: t.visible ? 1 : 0,
            }}
          >
            {resolveValue(t.message, t)}
            {t.type === "error" ? (
              <CloseIcon />
            ) : t.type === "custom" ? (
              <MessageIcon /> // pick any warning icon
            ) : (
              <CheckCircleIcon className="w-8 h-8 text-white-500" />
            )}
          </div>
        )}
      </Toaster>
      <ChangePassword
        open={openChangePassModal}
        onClose={() => setOpenChangePassModal(false)}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* <Route path="/welcome" element={<WelcomeScreen />} /> */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* Public Certificate Routes - No authentication required */}
        <Route
          path="/public/certificate/"
          element={<PublicCertificateValidation />}
        />
        <Route
          path="/public/certificate/comisa/:id"
          element={<PublicComisaCertificate />}
        />
        <Route
          path="/public/certificate/free-trade/:id"
          element={<PublicFreeTradeCertificate />}
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              onSignup={handleSignup}
              chambers={chambers}
            />
          }
        />
        <Route
          path="/*"
          element={
            currentUser ? (
              <Layout
                userRole={currentUser.role}
                onLogout={handleLogout}
                memberProfile={memberProfile}
                membership={currentUserMembership}
              >
                {/* Watermark */}
                <div className="fixed inset-0 pointer-events-none z-0 opacity-[.045]">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <img 
                      src="/gray_customs_long_600x134.png" 
                      alt="Customs Watermark" 
                      className="max-w-96 max-h-48 object-contain"
                    />
                  </div>
                </div>
                <Routes>
                  <Route path="/dashboard" element={dashboardElement} />

                  {/* Member Routes */}
                  <Route
                    path="/apply-membership"
                    element={
                      <MembershipApplication
                        onApply={handleApplyForMembership}
                        balance={currentUserWallet?.balance || 0}
                        membership={currentUserMembership}
                      />
                    }
                  />
                  <Route
                    path="/document-services"
                    element={
                      <DocumentServices
                        documentRequests={legacyDocumentRequests.filter(
                          (r) => r.userId === currentUser?.id
                        )}
                        onRequestCertificate={handleRequestCertificate}
                        balance={currentUserWallet?.balance || 0}
                      />
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <WalletPage
                        wallet={currentUserWallet}
                        transactions={walletTransactions.filter(
                          (tx) => tx.userId === currentUser?.id
                        )}
                      />
                    }
                  />
                  <Route
                    path="/top-up"
                    element={<TopUpPage onTopUp={handleRequestTopUp} />}
                  />
                  <Route
                    path="/transfer"
                    element={
                      <TransferPage
                        onTransfer={handleTransfer}
                        users={users.filter((u) => u.id !== currentUser?.id)}
                        balance={currentUserWallet?.balance || 0}
                      />
                    }
                  />
                  <Route
                    path="/receipt/:id"
                    element={
                      <ReceiptPage
                        invoices={invoices}
                        profile={memberProfile}
                      />
                    }
                  />
                  <Route
                    path="/disputes"
                    element={
                      <DisputeResolution
                        disputes={disputes.filter(
                          (d) => d.submittedBy === currentUser?.id
                        )}
                        onRegisterDispute={handleRegisterDispute}
                      />
                    }
                  />
                  <Route
                    path="/disputes/:id"
                    element={<DisputeDetailsPage disputes={disputes} />}
                  />
                  <Route
                    path="/events"
                    element={<EventsPage events={legacyEvents} />}
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <EventDetailsPage
                        events={legacyEvents}
                        onRegister={handleRegisterForEvent}
                        balance={currentUserWallet?.balance || 0}
                      />
                    }
                  />
                  <Route
                    path="/support"
                    element={
                      <SupportPage
                        supportTickets={supportTickets.filter(
                          (t) => t.userId === currentUser?.id
                        )}
                        onSubmitTicket={handleSubmitTicket}
                      />
                    }
                  />
                  <Route path="/user-guide" element={<UserGuidePage />} />
                  <Route
                    path="/elearning"
                    element={
                      <ElearningPage
                        courses={courses}
                        onContinueCourse={handleContinueCourse}
                      />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <UserProfile
                        currentUser={currentUser}
                        profile={memberProfile}
                        onUpdateProfile={handleUpdateUserProfile}
                      />
                    }
                  />
                  <Route
                    path="/b2b-networking"
                    element={<B2BNetworkingPage />}
                  />
                  <Route
                    path="/b2b-networking/:id"
                    element={<CompanyProfilePage />}
                  />
                  <Route
                    path="/membership-certificate"
                    element={
                      <MembershipCertificatePage profile={memberProfile} />
                    }
                  />
                  <Route
                    path="/origin-certificate/:id"
                    element={
                      <OriginCertificatePage
                        documentRequests={legacyDocumentRequests}
                        profile={memberProfile}
                      />
                    }
                  />
                  <Route
                    path="/chamber-enrollment-certificate/:id"
                    element={
                      <ChamberEnrollmentCertificatePage
                        documentRequests={legacyDocumentRequests}
                        profile={memberProfile}
                      />
                    }
                  />
                  <Route
                    path="/course-certificate/:id"
                    element={
                      <CourseCertificatePage
                        courses={courses}
                        profile={memberProfile}
                      />
                    }
                  />

                  {/* Staff & Admin Routes - Accessible by Staff, Accountant, and Auditor roles */}
                  {(currentUser.role === UserRole.Staff ||
                    currentUser.role === UserRole.Accountant ||
                    currentUser.role === UserRole.Auditor ||
                    currentUser.role === UserRole.Admin ||
                    currentUser.role === UserRole.BranchAdmin) && (
                    <>
                      {/* Staff memberships - Restricted from Accountant, Auditor, and Staff */}
                      {currentUser.role === UserRole.BranchAdmin ||
                      currentUser.role === UserRole.Admin ? (
                        <Route
                          path="/staff/memberships"
                          element={
                            <StaffMembershipsPage
                              requests={membershipRequests}
                            />
                          }
                        />
                      ) : null}
                      <Route
                        path="/staff/documents"
                        element={<CertificateInquiryPage />}
                      />
                      <Route
                        path="/staff/documents/:clientId/request"
                        element={<StaffClientDocumentRequestPage />}
                      />

                      <Route
                        path="/print/certificate/:id"
                        element={<PrintLayout />}
                      />
                      <Route
                        path="/comisa-print/:id"
                        element={<ComisaPrint />}
                      />
                      <Route
                        path="/free-trade-print/:id"
                        element={<FreeTradePrint />}
                      />

                      <Route
                        path="/staff/client-documents"
                        element={
                          <StaffClientDocumentRequestPage
                            documentRequests={legacyDocumentRequests}
                            onRequestCertificate={handleRequestCertificate}
                            users={users.filter(
                              (u) => u.role === UserRole.Member
                            )}
                          />
                        }
                      />
                      
                      {/* Branch Inquiries - Only for BranchAdmin */}
                      {currentUser.role === UserRole.BranchAdmin && (
                        <Route
                          path="/branch/inquiries"
                          element={<BranchInquiriesPage />}
                        />
                      )}
                      
                      {/* Admin Inquiries - For Admin, Branch Manager, and Port Manager */}
                      {(currentUser.role === UserRole.Admin || 
                        currentUser.role === UserRole.BranchAdmin || 
                        currentUser.role === UserRole.PortManager) && (
                        <Route
                          path="/admin/inquiries"
                          element={<BranchInquiriesPage />}
                        />
                      )}
                      
                      {/* Staff wallet - Restricted from Accountant, Auditor, and Staff */}
                      {currentUser.role === UserRole.BranchAdmin ||
                      currentUser.role === UserRole.Admin ? (
                        <Route
                          path="/staff/wallet"
                          element={
                            <StaffWalletPage
                              transactions={walletTransactions.filter(
                                (tx) => tx.type === WalletTransactionType.Charge
                              )}
                              onConfirmTopUp={handleConfirmTopUp}
                              users={users}
                            />
                          }
                        />
                      ) : null}
                      <Route
                        path="/review/membership/:id"
                        element={
                          <MembershipReviewPage
                            requests={membershipRequests}
                            onReview={handleReviewMembership}
                          />
                        }
                      />
                      <Route
                        path="/staff/review/document/:id"
                        element={
                          <StaffDocumentReviewPage
                            requests={legacyDocumentRequests}
                            onReview={handleReviewCertificate}
                          />
                        }
                      />
                    </>
                  )}

                  {/* Admin Exclusive Routes - Only accessible by Admin role */}
                  {currentUser.role === UserRole.Admin && (
                    <Route
                      path="/admin/users"
                      element={
                        <AdminUserManagementPage
                          users={users}
                          wallets={wallets}
                          memberships={memberships}
                          chambers={chambers}
                          onCreateUser={handleAdminCreateUser}
                        />
                      }
                    />
                  )}

                  <Route path="/admin/roles" element={<AdminRolesListPage />} />
                  <Route
                    path="/admin/chambers"
                    element={<AdminChamberPage />}
                  />

                  {/* Admin Exclusive Routes - Only accessible by Admin role */}
                  {currentUser.role === UserRole.Admin && (
                    <Route
                      path="/admin/branches"
                      element={<AdminBranchPage />}
                    />
                  )}
                  {currentUser.role === UserRole.Admin && (
                    <Route
                      path="/admin/certificate-types"
                      element={<CertificateTypesPage />}
                    />
                  )}
                  <Route
                    path="/admin/finances"
                    element={<AdminFinancialsPage payments={payments} />}
                  />
                  <Route
                    path="/admin/settings"
                    element={<AdminSettingsPage />}
                  />
                  <Route
                    path="/bi-reports"
                    element={<BusinessIntelligencePage />}
                  />

                  {/* Accountant Routes */}
                  <Route
                    path="/accountant/documents"
                    element={
                      <AccountantDocumentsPage
                        requests={legacyDocumentRequests}
                      />
                    }
                  />
                  <Route
                    path="/accountant/review/document/:id"
                    element={
                      <AccountantDocumentReviewPage
                        requests={legacyDocumentRequests}
                        onReview={handleReviewCertificate}
                      />
                    }
                  />

                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
