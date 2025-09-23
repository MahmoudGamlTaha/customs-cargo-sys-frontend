export interface CertificateDetails {
  certificateNumber: string;
  certificateType: string;
  issueDate: string;
  expiryDate: string;
}

export interface Inquiry {
  id: number;
  employeeId: string;
  employeeName: string;
  branch: string;
  question: string;
  status: 'found' | 'not_found';
  certificateDetails?: CertificateDetails;
  createdAt: string;
}

export const dummyInquiries: Inquiry[] = [
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام حالة شحنة الحاويات CNT-2024-001',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'CNT-2024-001',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-15',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'فاطمة حسن',
    branch: 'منفذ بنغازي',
    question: 'استعلام وثائق التصدير شحنة النفط OIL-2024-002',
    status: 'not_found',
    createdAt: '2024-01-20T11:15:00Z'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    employeeName: 'محمد عبدالله',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام رسوم الجمارك شحنة الأدوية MED-2024-003',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'MED-2024-003',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-18',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-20T14:20:00Z'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    employeeName: 'سارة أحمد',
    branch: 'منفذ مصراتة',
    question: 'استعلام حالة إفراج شحنة الغذاء FOOD-2024-004',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'FOOD-2024-004',
      certificateType: 'شهادة منشأ - منفذ مصراتة',
      issueDate: '2024-01-19',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-20T16:45:00Z'
  },
  {
    id: 5,
    employeeId: 'EMP005',
    employeeName: 'علي محمود',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام شهادة الصحة النباتية التمور DATE-2024-005',
    status: 'not_found',
    createdAt: '2024-01-20T17:30:00Z'
  },
  {
    id: 6,
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام موعد وصول شحنة المعدات IND-2024-006',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'IND-2024-006',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-22',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-22T09:15:00Z'
  },
  {
    id: 7,
    employeeId: 'EMP006',
    employeeName: 'خالد سالم',
    branch: 'منفذ بنغازي',
    question: 'استعلام رسوم التخليص الجمركي السيارات CAR-2024-007',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'CAR-2024-007',
      certificateType: 'شهادة منشأ - منفذ بنغازي',
      issueDate: '2024-01-23',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-23T11:30:00Z'
  },
  {
    id: 8,
    employeeId: 'EMP007',
    employeeName: 'نور الدين',
    branch: 'منفذ مصراتة',
    question: 'استعلام وثائق الاستيراد الأجهزة ELEC-2024-008',
    status: 'not_found',
    createdAt: '2024-01-23T14:45:00Z'
  },
  {
    id: 9,
    employeeId: 'EMP003',
    employeeName: 'محمد عبدالله',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام حالة التفتيش الجمركي الأقمشة TEXT-2024-009',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'TEXT-2024-009',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-24',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-24T16:20:00Z'
  },
  {
    id: 10,
    employeeId: 'EMP008',
    employeeName: 'مريم علي',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام موعد إفراج شحنة الكيماويات CHEM-2024-010',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'CHEM-2024-010',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-25',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-25T10:10:00Z'
  },
  {
    id: 11,
    employeeId: 'EMP009',
    employeeName: 'عبدالرحمن محمد',
    branch: 'منفذ بنغازي',
    question: 'استعلام شهادة المنشأ المنتجات الزراعية AGR-2024-011',
    status: 'not_found',
    createdAt: '2024-01-25T13:25:00Z'
  },
  {
    id: 12,
    employeeId: 'EMP010',
    employeeName: 'فاطمة الزهراء',
    branch: 'منفذ مصراتة',
    question: 'استعلام رسوم التخزين البضائع العامة GEN-2024-012',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'GEN-2024-012',
      certificateType: 'شهادة منشأ - منفذ مصراتة',
      issueDate: '2024-01-26',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-26T15:40:00Z'
  },
  {
    id: 13,
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام حالة التخليص الجمركي الأدوات HOME-2024-013',
    status: 'not_found',
    createdAt: '2024-01-26T17:55:00Z'
  },
  {
    id: 14,
    employeeId: 'EMP011',
    employeeName: 'يوسف أحمد',
    branch: 'منفذ طرابلس البحري',
    question: 'استعلام وثائق التصدير المنتجات البترولية PET-2024-014',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'PET-2024-014',
      certificateType: 'شهادة منشأ - منفذ طرابلس البحري',
      issueDate: '2024-01-27',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-27T08:30:00Z'
  },
  {
    id: 15,
    employeeId: 'EMP012',
    employeeName: 'آمنة سالم',
    branch: 'منفذ بنغازي',
    question: 'استعلام موعد وصول شحنة المواد الطبية MED-2024-015',
    status: 'found',
    certificateDetails: {
      certificateNumber: 'MED-2024-015',
      certificateType: 'شهادة منشأ - منفذ بنغازي',
      issueDate: '2024-01-27',
      expiryDate: '2024-12-31'
    },
    createdAt: '2024-01-27T12:15:00Z'
  }
];

// Export the count
export const totalInquiriesCount = dummyInquiries.length;
export const branchInquiriesCount = dummyInquiries.filter(inquiry => inquiry.branch === 'منفذ طرابلس البحري').length;
