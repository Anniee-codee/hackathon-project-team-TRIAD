// ==============================================================================
// RAASTA — SHARED DATA CONTRACT & TYPES
// Civic Issue Reporting Platform
// ==============================================================================

export type IssueCategory =
  | 'Roads & potholes'
  | 'Drainage & sewage'
  | 'Garbage'
  | 'Streetlights'
  | 'Water supply'
  | 'Other infrastructure'
  | 'Roads & Potholes'
  | 'Water & Sewage'
  | 'Electricity'
  | 'Garbage & Sanitation'
  | 'Public Safety'
  | 'Other';

export const ISSUE_CATEGORIES: IssueCategory[] = [
  'Roads & potholes',
  'Drainage & sewage',
  'Garbage',
  'Streetlights',
  'Water supply',
  'Other infrastructure',
];

export type ReportStatus =
  | 'Reported'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Duplicate';

export const REPORT_STATUSES: ReportStatus[] = [
  'Reported',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
  'Duplicate'
];

export interface Report {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: IssueCategory;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  status: ReportStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed / secondary fields (Pulse)
  confirmations_count?: number;
  has_confirmed?: boolean;
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus;
  changed_by: string | null;
  message: string | null;
  created_at: string;
}

export interface ReportConfirmation {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateReportInput {
  title: string;
  description: string;
  category: IssueCategory;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ReportFilterParams {
  searchQuery?: string;
  category?: IssueCategory | 'ALL';
  status?: ReportStatus | 'ALL';
  sortBy?: 'newest' | 'oldest' | 'confirmations';
}

export interface StatusUpdateInput {
  reportId: string;
  newStatus: ReportStatus;
  message?: string;
  moderatorId?: string;
}

export interface ModeratorUser {
  id: string;
  email: string;
  name: string;
  role: 'moderator' | 'admin';
}
