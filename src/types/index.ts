export type ReportCategory =
  | 'Pothole / Road Damage'
  | 'Water Supply & Leakage'
  | 'Garbage / Waste Disposal'
  | 'Streetlight / Electricity'
  | 'Sewage & Drainage'
  | 'Public Safety & Obstruction'
  | 'Other';

export type ReportStatus =
  | 'Reported'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Duplicate';

export interface Report {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: ReportCategory;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
  status: ReportStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus;
  changed_by?: string | null;
  message?: string | null;
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
  category: ReportCategory;
  location_text: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: ReportCategory | 'ALL';
  status?: ReportStatus | 'ALL';
}
