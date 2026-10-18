export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentIdNumber?: string;
  department?: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Academic'
  | 'Hostel'
  | 'Infrastructure'
  | 'Canteen'
  | 'Library'
  | 'Administration'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  studentId: string;
  studentName: string;
  studentEmail: string;
  createdAt: string;
  updatedAt?: string;
  adminRemarks?: string;
  resolvedAt?: string;
}

export interface ComplaintFilterOptions {
  searchQuery: string;
  status: ComplaintStatus | 'All';
  category: ComplaintCategory | 'All';
  sortBy: 'date-desc' | 'date-asc' | 'title';
}
