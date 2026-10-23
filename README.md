# Raasta — Community-Powered Civic Issue Reporting Platform

Raasta empowers citizens to report local infrastructure and public-service problems, track real-time resolution progress, and allows authorized civic moderators to manage and update issue lifecycles with a transparent audit trail.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL with RLS, Triggers, & Stored Procedures)
- **Architecture:** Zero-backend client architecture leveraging Supabase RLS and direct database contracts

---

## 📋 Data Contracts & Types (`src/types/index.ts`)

All team branches (`backend-core`, `frontend`, `backend-features`) must adhere to this contract:

```typescript
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
```

---

## 🗄️ Database Setup (Supabase)
Run the migration file located in `supabase/migrations/001_core_reports_and_history.sql` inside your Supabase SQL Editor.
It configures:
1. `reports`, `report_status_history`, and `report_confirmations` tables.
2. Auto-generated unique human-readable report references: `RAA-YYYY-XXXX` sequence trigger.
3. Automated chronological status audit trail trigger.
4. Row Level Security (RLS) guaranteeing that only authorized moderators can update report statuses.

---

## 🚀 Environment Configuration
Create a `.env` file in the root directory (never commit this):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🏃 Running the Application
```bash
npm install
npm run dev
```
