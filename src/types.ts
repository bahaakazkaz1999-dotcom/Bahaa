export type UserRole = 'donor' | 'beneficiary' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type CaseStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export interface User {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  idFrontUrl?: string;
  idBackUrl?: string;
  verificationStatus: VerificationStatus;
  totalDonated?: number;
  ratingCount?: number;
  ratingSum?: number;
  createdAt: string;
  email: string;
}

export interface Case {
  id: string;
  beneficiaryId: string;
  beneficiaryName?: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: CaseStatus;
  createdAt: string;
  verifiedBy?: string;
}

export interface Donation {
  id: string;
  caseId: string;
  donorId: string;
  donorName: string;
  amount: number;
  createdAt: string;
}

export interface Rating {
  id: string;
  donorId: string;
  beneficiaryId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
