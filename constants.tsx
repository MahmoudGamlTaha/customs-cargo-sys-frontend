
import { Course, MemberProfile, User, UserRole, Wallet, Membership, Chamber, Event, Certificate, CertificateType, Payment, PaymentType, WalletTransaction, WalletTransactionType, Dispute, Invoice, SupportTicket } from './types';

// --- MOCK DATABASE ---
// This data replaces the live Firebase connection to run the app in a demo mode.

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const lastWeek = new Date(now);
lastWeek.setDate(now.getDate() - 7);

export const MOCK_CHAMBERS: Chamber[] = [
    { id: 'chamber_tripoli', name: 'منفذ طرابلس', location: 'Tripoli', contactEmail: 'info@tripoli-customs.ly', createdAt: now.toISOString() },
    { id: 'chamber_benghazi', name: 'منفذ بنغازي', location: 'Benghazi', contactEmail: 'info@benghazi-customs.ly', createdAt: now.toISOString() }
];

export const MOCK_USERS: (User & { password?: string })[] = [
    { 
        id: 'member_user_01', 
        fullName: 'أحمد محمد', 
        email: 'member@demo.com', 
        password: 'password',
        phone: '+218 91 123 4567',
        role: UserRole.Member,
        chamberId: 'chamber_tripoli',
        membershipId: 'mem_01',
        createdAt: lastWeek.toISOString(),
        status: 'Active',
        nameAr: 'أحمد محمد',
        nameEn: 'Ahmed Mohammed',
        companyNameAr: 'شركة النسيم للتجارة',
        companyNameEn: 'Al-Naseem Trading Co.'
    },
    { 
        id: 'staff_user_01', 
        fullName: 'فاطمة علي', 
        email: 'staff@demo.com', 
        password: 'password',
        phone: '+218 92 234 5678',
        role: UserRole.Staff,
        chamberId: 'chamber_tripoli',
        membershipId: '',
        createdAt: now.toISOString(),
        status: 'Active',
        nameAr: 'فاطمة علي',
        nameEn: 'Fatima Ali',
        companyNameAr: '',
        companyNameEn: ''
    },
    { 
        id: 'admin_user_01', 
        fullName: 'علي سالم', 
        email: 'admin@demo.com', 
        password: 'password',
        phone: '+218 94 345 6789',
        role: UserRole.Admin,
        chamberId: 'chamber_tripoli',
        membershipId: '',
        createdAt: now.toISOString(),
        status: 'Active',
        nameAr: 'علي سالم',
        nameEn: 'Ali Salem',
        companyNameAr: '',
        companyNameEn: ''
    },
    { 
        id: 'member_user_pending',
        fullName: 'خالد عبد الله', 
        email: 'pending@demo.com', 
        password: 'password',
        phone: '+218 91 987 6543',
        role: UserRole.Member,
        chamberId: 'chamber_benghazi',
        membershipId: 'mem_pending_01',
        createdAt: yesterday.toISOString(),
        status: 'Active',
        nameAr: 'خالد عبد الله',
        nameEn: 'Khaled Abdullah',
        companyNameAr: 'شركة المستقبل للخدمات',
        companyNameEn: 'Future Services Co.'
    }
];

export const MOCK_MEMBERSHIPS: Membership[] = [
    {
        id: 'mem_01',
        userId: 'member_user_01',
        status: 'approved',
        membershipNumber: 'LCCI-12345',
        expiryDate: new Date(now.setFullYear(now.getFullYear() + 1)).toISOString(),
        createdAt: new Date(now.setFullYear(now.getFullYear() - 1)).toISOString(),
    },
    {
        id: 'mem_pending_01',
        userId: 'member_user_pending',
        status: 'pending',
        membershipNumber: '',
        expiryDate: '',
        createdAt: yesterday.toISOString(),
    }
];


export const MOCK_WALLETS: Wallet[] = [
    { id: 'member_user_01', userId: 'member_user_01', balance: 1575.50, lastUpdated: yesterday.toISOString() },
    { id: 'staff_user_01', userId: 'staff_user_01', balance: 0, lastUpdated: now.toISOString() },
    { id: 'admin_user_01', userId: 'admin_user_01', balance: 0, lastUpdated: now.toISOString() },
    { id: 'member_user_pending', userId: 'member_user_pending', balance: 1000.00, lastUpdated: now.toISOString() },
    { id: 'arbitrator_user_01', userId: 'arbitrator_user_01', balance: 500.00, lastUpdated: now.toISOString() }
];

export const MOCK_CERTIFICATES: Certificate[] = [
    {
        id: 'cert_origin_01',
        userId: 'member_user_01',
        certificateType: CertificateType.Origin,
        status: 'approved',
        issueDate: yesterday.toISOString(),
        documentUrl: '/mock/doc.pdf',
        notes: JSON.stringify({
            consignee: "International Goods Inc.\n123 Global Way, Port City, Globalia",
            transportDetails: "By Sea - Vessel: MSC Laila",
            marksAndNumbers: "IG-123\n1/200",
            numberOfPackages: "200 Cartons",
            goodsDescription: "Libyan Olive Oil",
            grossWeight: "2500 KG",
            netWeight: "2200 KG",
            invoiceNumber: "INV-2024-001",
            invoiceDate: lastWeek.toISOString().split('T')[0],
        }),
        createdAt: lastWeek.toISOString()
    },
    {
        id: 'cert_auth_01',
        userId: 'member_user_01',
        certificateType: CertificateType.DocumentAuth,
        status: 'submitted',
        issueDate: null,
        documentUrl: '',
        notes: 'Please authenticate the attached contract.',
        createdAt: yesterday.toISOString()
    }
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'pay_01', userId: 'member_user_01', paymentType: PaymentType.CertificateFee, amount: 150, status: 'paid', paymentDate: lastWeek.toISOString(), method: 'wallet', transactionId: 'tx_cert_01' }
];

export const MOCK_EVENTS: Event[] = [
    { id: 'evt_01', title: 'libya_build', description: 'description', location: 'tripoli', startDate: new Date(now.setDate(now.getDate() + 10)).toISOString(), endDate: new Date(now.setDate(now.getDate() + 13)).toISOString(), fee: 100, participants: [] },
    { id: 'evt_02', title: 'youth_entrepreneurs', description: 'description', location: 'benghazi', startDate: new Date(now.setDate(now.getDate() + 20)).toISOString(), endDate: new Date(now.setDate(now.getDate() + 21)).toISOString(), fee: 0, participants: ['member_user_01'] },
    { id: 'evt_03', title: 'ecommerce_workshop', description: 'description', location: 'misrata', startDate: new Date(now.setDate(now.getDate() + 30)).toISOString(), endDate: new Date(now.setDate(now.getDate() + 30)).toISOString(), fee: 50, participants: [] }
];

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
    { id: 'tx_topup_01', userId: 'member_user_01', type: WalletTransactionType.Charge, amount: 2000, date: lastWeek.toISOString(), description: 'Top up via Bank Transfer', status: 'Completed' },
    { id: 'tx_cert_01', userId: 'member_user_01', type: WalletTransactionType.Payment, amount: 150, date: lastWeek.toISOString(), description: "Fee for Certificate of Origin service #cert_origin_01", status: 'Completed', referenceId: 'cert_origin_01' },
    { id: 'tx_transfer_01', userId: 'member_user_01', type: WalletTransactionType.TransferOut, amount: 274.50, date: yesterday.toISOString(), description: "Transfer to Fatima Ali. Notes: For services", status: 'Completed', relatedUserId: 'staff_user_01' }
];

export const MOCK_DISPUTES: Dispute[] = [
    { id: 'disp_01', submittedBy: 'member_user_01', againstUser: 'Some Other Company', arbitratorId: 'arbitrator_user_01', status: 'in_review', details: 'Dispute over a shipment of goods not meeting quality standards.', submittedAt: lastWeek.toISOString(), resolutionNotes: '' }
];

export const MOCK_INVOICES: Invoice[] = [
    { id: 'inv_01', description: 'Service Fee for Certificate of Origin', amount: 150.00, status: 'paid', requestId: 'cert_origin_01', requestType: 'document', paymentDate: lastWeek.toISOString() }
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'ticket_01', userId: 'member_user_01', title: 'مشكلة في تحميل ملفات التصديق', status: 'solved', createdAt: lastWeek.toISOString() },
  { id: 'ticket_02', userId: 'member_user_01', title: 'استفسار عن رسوم التجديد', status: 'in_review', createdAt: yesterday.toISOString() },
];


// --- LEGACY & UI Mock Data ---
// Kept for UI components that are not yet fully dynamic or for charting examples.
export const INITIAL_MEMBER_PROFILE: MemberProfile = {
  id: '',
  nameAr: '',
  nameEn: '',
  companyNameAr: '',
  companyNameEn: '',
  membershipStatus: 'Inactive',
  expiryDate: 'N/A',
  commercialRegistryNo: 'N/A',
  membershipGrade: 'N/A',
  title: ''
};

export const MOCK_COURSES: Course[] = [
    { id: 'CRS-001', title: 'pm_fundamentals', instructor: 'Dr. Ali Fadel', duration: '6 Weeks', progress: 75 },
    { id: 'CRS-002', title: 'advanced_digital_marketing', instructor: 'Ms. Huda Saleh', duration: '8 Weeks', progress: 100 },
    { id: 'CRS-003', title: 'negotiation_skills', instructor: 'Mr. Omar Khalil', duration: '4 Weeks', progress: 40 },
];

export const MOCK_BI_DATA = {
  memberGrowth: [
    { name: 'january', members: 400 },
    { name: 'february', members: 450 },
    { name: 'march', members: 520 },
    { name: 'april', members: 600 },
    { name: 'may', members: 680 },
    { name: 'june', members: 750 },
  ],
  requestsByType: [
    { name: 'membership', value: 120 },
    { name: 'certificates', value: 800 },
    { name: 'attestations', value: 450 },
    { name: 'consultations', value: 50 },
  ],
};
