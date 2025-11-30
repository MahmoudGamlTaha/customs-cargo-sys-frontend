
// This enum defines the roles a user can have within the system.
export enum UserRole {
  Member = 'member',
  Staff = 'staff',
  Admin = 'admin',
  Accountant = 'accountant',
  Auditor = 'auditor',
  BranchAdmin = 'branch_admin',
  PortManager = 'port_manager'
}

// Branch collection
export interface Branch {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
}

// User collection
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: number; // Reference to chambers collection
  branch?: Branch; // Full branch information
  membershipId: string; // Reference to memberships collection
  createdAt: string; // ISO 8601 timestamp
  status: 'Active' | 'Suspended';
  // for UI compatibility
  nameAr: string;
  accessToken: string;
  nameEn: string;
  companyNameAr: string;
  companyNameEn: string;
  is_password_reset_required: boolean,
  first_name?: string;
  last_name?: string;
  company_id?: number;
  username?: string;
  password?: string;
  branch_id?: number;
  role_id?: number;
  email_verified?: boolean;
  is_active?: boolean;
}

// Membership collection
export interface Membership {
  id: string;
  userId: string; // Reference to users collection
  status: 'pending' | 'approved' | 'rejected' | 'on_hold';
  membershipNumber: string; // Assigned on approval
  expiryDate: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
}

export type CertificateType = 'origin' | 'document_auth' | 'other' | 'chamber_enrollment';
export const CertificateType = {
  Origin: 'origin' as CertificateType,
  DocumentAuth: 'document_auth' as CertificateType,
  Other: 'other' as CertificateType,
  ChamberEnrollment: 'chamber_enrollment' as CertificateType,
};


// Certificate collection
export interface Certificate {
  id: string;
  userId: string; // Reference to users collection
  certificateType: CertificateType;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'on_hold';
  issueDate: string | null; // ISO 8601 timestamp, null until approved
  documentUrl: string; // URL to the generated PDF/document
  notes: string;
  createdAt: string; // ISO 8601 timestamp
}

export type PaymentType = 'membership_fee' | 'certificate_fee' | 'event_fee';
export const PaymentType = {
  MembershipFee: 'membership_fee' as PaymentType,
  CertificateFee: 'certificate_fee' as PaymentType,
  EventFee: 'event_fee' as PaymentType
};

// Payment collection
export interface Payment {
  id: string;
  userId: string; // Reference to users collection
  paymentType: PaymentType;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentDate: string; // ISO 8601 timestamp
  method: string; // e.g., 'wallet', 'credit_card'
  transactionId: string;
}

// Event collection
export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO 8601 timestamp
  endDate: string; // ISO 8601 timestamp
  fee: number;
  participants: string[]; // Array of user IDs
}

// Dispute collection
export interface Dispute {
  id: string;
  submittedBy: string; // Reference to users collection
  againstUser: string; // Reference to users collection
  arbitratorId?: string; // Reference to an arbitrator user
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  details: string;
  submittedAt: string; // ISO 8601 timestamp
  resolutionNotes: string;
}

// Chamber collection
export interface Chamber {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  createdAt: string; // ISO 8601 timestamp
}

// Wallet collection
export interface Wallet {
  id: string;
  userId: string; // Reference to users collection
  balance: number;
  lastUpdated: string; // ISO 8601 timestamp
}

export type WalletTransactionType = 'charge' | 'payment' | 'transfer_out' | 'transfer_in';

export const WalletTransactionType = {
  Charge: 'charge' as WalletTransactionType,
  Payment: 'payment' as WalletTransactionType,
  TransferOut: 'transfer_out' as WalletTransactionType,
  TransferIn: 'transfer_in' as WalletTransactionType,
}

// Wallet Transaction collection
export interface WalletTransaction {
  id: string;
  userId: string; // Reference to users collection
  type: WalletTransactionType;
  amount: number; // Always positive
  relatedUserId?: string; // Reference to users collection (for transfers)
  referenceId?: string; // Optional link to a service (paymentId, etc.)
  description: string;
  date: string; // ISO 8601 timestamp
  status: 'Completed' | 'Pending' | 'Failed';
}

// Support Ticket Collection
export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  status: 'open' | 'in_review' | 'solved';
  createdAt: string;
}


// --- LEGACY TYPES FOR UI COMPATIBILITY ---

export enum InvoiceStatus {
  Paid = 'Paid',
  Pending = 'Pending',
  RequiresConfirmation = 'RequiresConfirmation',
}

export enum RequestStatus {
  ISSUED = "ISSUED",
  APPROVED = "APPROVED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  ON_HOLD = "ON_HOLD",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export interface MemberProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  companyNameAr: string;
  companyNameEn: string;
  membershipStatus: 'Active' | 'Inactive' | 'Pending' | 'rejected';
  expiryDate: string;
  commercialRegistryNo?: string;
  membershipGrade?: string;
  title?: string;
  chamberName?: string;
}

export interface CertificateOfOriginData {
  consignee: string;
  transportDetails: string;
  marksAndNumbers: string;
  numberOfPackages: string;
  goodsDescription: string;
  grossWeight: string;
  netWeight: string;
  invoiceNumber: string;
  invoiceDate: string;
}

export interface RequestDetail {
  transfer_detail: string;
  signs: string;
  number_of_parcel: number;
  description: string;
  weight: number;
  net_weight: number;
  client_id: number;
  user_id: number;
  invoice_number: string;
  invoice_date: string;
  company_name: string;
  company_name_en?: string;
  commercial_number?: string;
  activity_type: string;
  address: string;
  phone_number: string;
  email: string;
  identity_number: string;
  mobile_number: string;
  item_cost: number;
  quantity: number;
  standard_of_origin: string;
  for_official_use: string;
  country_producer: string;
  serial_number: string;
  client_name: string;
  transport_details?: string;
}

export interface DocumentRequest {
  id: string;
  serialNumber: string;
  serviceType: string;
  serviceTypeId: string;
  request_type_name: string;
  date: string;
  createdAt: string;
  status: RequestStatus;
  fee: number;
  certificateData?: CertificateOfOriginData;
  userId: string;
  title: string;
  description: string;
  details: RequestDetail[];
  ratio: number;
  branch_id: number;
  rejection_reason?: string;
}

// Represents a membership application as viewed by staff
export interface MembershipRequest {
  id: string; // membership id
  userId: string;
  date: string; // membership createdAt
  status: RequestStatus;
  companyNameAr: string;
  companyNameEn: string;
  applicantNameAr: string;
  applicantNameEn: string;
}

export interface LegacyEvent extends Event {
  isRegistered: boolean;
}

export interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: 'paid' | InvoiceStatus;
  requestId: string;
  requestType: PaymentType | 'membership' | 'document' | 'event' | 'top-up';
  paymentDate?: string;
}

// Kept for elearning page compatibility
export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  progress: number;
}

export interface SingleRequestResponse {
  success: boolean;
  data?: DocumentRequest;
  message?: string;
  status?: number;
}

// User Activity interface for activity logs
export interface UserActivity {
  id: number;
  user_id: number;
  module: string;
  entity_id: number;
  action: string;
  details: string;
  created_at: string;
  updated_at: string;
  description: string;
  // User information if included in the response
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}
