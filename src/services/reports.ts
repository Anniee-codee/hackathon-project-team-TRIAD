// ==============================================================================
// RAASTA — CORE BACKEND SERVICE
// Database interaction, unique reference generation, and status workflows
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Report,
  ReportStatusHistory,
  ReportConfirmation,
  CreateReportInput,
  ReportFilterParams,
  StatusUpdateInput,
  ReportStatus,
} from '../types/raasta';

// Local storage fallback keys
const STORAGE_KEY_REPORTS = 'raasta_reports_v1';
const STORAGE_KEY_HISTORY = 'raasta_history_v1';
const STORAGE_KEY_CONFIRMATIONS = 'raasta_confirmations_v1';

// Helper to identify PostgREST schema cache / missing table errors (PGRST204)
function isSchemaCacheError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : err.message || '';
  const code = err.code || '';
  return (
    code === 'PGRST204' ||
    msg.toLowerCase().includes('schema cache') ||
    msg.toLowerCase().includes('could not find the table')
  );
}

// Seed sample civic issues if storage is completely empty
const SEED_REPORTS: Report[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    reference: 'RST-20261023-A1F9',
    title: 'Severe crater pothole near Clifton Bridge',
    description: 'Deep road depression causing vehicle damage and traffic bottleneck during evening rush hour.',
    category: 'Roads & Potholes',
    location_text: 'Clifton Bridge underpass, West carriageway',
    latitude: 24.8211,
    longitude: 67.0322,
    status: 'In Progress',
    created_by: 'citizen-seed-1',
    created_at: '2026-10-23T08:15:00.000Z',
    updated_at: '2026-10-23T09:45:00.000Z',
    confirmations_count: 14,
    has_confirmed: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    reference: 'RST-20261023-B8C2',
    title: 'Burst clean water supply line overflowing into market',
    description: 'Potable water pipeline rupture wasting thousands of gallons and flooding local storefronts.',
    category: 'Water & Sewage',
    location_text: 'Sector 5 Main Bazaar, near Gate 2',
    latitude: 24.8607,
    longitude: 67.0011,
    status: 'Under Review',
    created_by: 'citizen-seed-2',
    created_at: '2026-10-23T09:30:00.000Z',
    updated_at: '2026-10-23T10:00:00.000Z',
    confirmations_count: 27,
    has_confirmed: false,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    reference: 'RST-20261023-D441',
    title: 'Faulty streetlight array on University Road',
    description: 'Consecutive poles dark for 500 meters, creating security and accident hazards for pedestrians.',
    category: 'Streetlights',
    location_text: 'University Road opposite NED Gate 1',
    latitude: 24.9312,
    longitude: 67.1124,
    status: 'Reported',
    created_by: 'citizen-seed-3',
    created_at: '2026-10-23T11:00:00.000Z',
    updated_at: '2026-10-23T11:00:00.000Z',
    confirmations_count: 8,
    has_confirmed: false,
  }
];

const SEED_HISTORY: ReportStatusHistory[] = [
  {
    id: 'hist-1',
    report_id: '10000000-0000-0000-0000-000000000001',
    old_status: null,
    new_status: 'Reported',
    changed_by: 'citizen-seed-1',
    message: 'Report submitted by citizen',
    created_at: '2026-10-23T08:15:00.000Z',
  },
  {
    id: 'hist-2',
    report_id: '10000000-0000-0000-0000-000000000001',
    old_status: 'Reported',
    new_status: 'Under Review',
    changed_by: 'mod-1',
    message: 'Inspected by field officer. Priority assigned.',
    created_at: '2026-10-23T09:00:00.000Z',
  },
  {
    id: 'hist-3',
    report_id: '10000000-0000-0000-0000-000000000001',
    old_status: 'Under Review',
    new_status: 'In Progress',
    changed_by: 'mod-1',
    message: 'Road maintenance contractor dispatched with asphalt team.',
    created_at: '2026-10-23T09:45:00.000Z',
  },
  {
    id: 'hist-4',
    report_id: '10000000-0000-0000-0000-000000000002',
    old_status: null,
    new_status: 'Reported',
    changed_by: 'citizen-seed-2',
    message: 'Report submitted by citizen',
    created_at: '2026-10-23T09:30:00.000Z',
  },
  {
    id: 'hist-5',
    report_id: '10000000-0000-0000-0000-000000000002',
    old_status: 'Reported',
    new_status: 'Under Review',
    changed_by: 'mod-2',
    message: 'Water board notified for main valve shutoff.',
    created_at: '2026-10-23T10:00:00.000Z',
  },
  {
    id: 'hist-6',
    report_id: '10000000-0000-0000-0000-000000000003',
    old_status: null,
    new_status: 'Reported',
    changed_by: 'citizen-seed-3',
    message: 'Report submitted by citizen',
    created_at: '2026-10-23T11:00:00.000Z',
  }
];

// Helper: generate unique reference in format RST-YYYYMMDD-XXXX
export function generateReference(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `RST-${dateStr}-${rand}`;
}

// Check live connection & schema cache state
export async function getBackendConnectionStatus(): Promise<{
  mode: 'supabase' | 'offline_fallback';
  connected: boolean;
  tableVerified: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      mode: 'offline_fallback',
      connected: false,
      tableVerified: false,
      message: 'Running in local offline-first mode (VITE_SUPABASE_URL not configured).',
    };
  }

  try {
    const { error } = await supabase.from('reports').select('id', { count: 'exact', head: true });
    if (error) {
      if (isSchemaCacheError(error)) {
        return {
          mode: 'offline_fallback',
          connected: true,
          tableVerified: false,
          message:
            "Supabase cloud connected, but table 'public.reports' is missing from schema cache. Execute supabase/migrations/001_core_report_and_history.sql in the Supabase SQL Editor.",
        };
      }
      return {
        mode: 'offline_fallback',
        connected: false,
        tableVerified: false,
        message: `Supabase error: ${error.message}`,
      };
    }
    return {
      mode: 'supabase',
      connected: true,
      tableVerified: true,
      message: "Supabase cloud connected and 'public.reports' table verified.",
    };
  } catch (err: any) {
    return {
      mode: 'offline_fallback',
      connected: false,
      tableVerified: false,
      message: err.message || 'Supabase connection failed.',
    };
  }
}

// Helper: load storage
function loadLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}`, err);
    return fallback;
  }
}

function saveLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving localStorage for ${key}`, err);
  }
}

// -----------------------------------------------------------------------------
// 1. CREATE REPORT (FR-01)
// -----------------------------------------------------------------------------
export async function createReport(
  input: CreateReportInput,
  creatorUserId?: string
): Promise<{ report: Report; error?: string }> {
  // Client-side validations
  if (!input.title || input.title.trim().length < 5) {
    return { report: {} as Report, error: 'Title must be at least 5 characters long.' };
  }
  if (!input.description || input.description.trim().length < 10) {
    return { report: {} as Report, error: 'Description must be at least 10 characters long.' };
  }
  if (!input.location_text || input.location_text.trim().length < 3) {
    return { report: {} as Report, error: 'Please provide a valid location or area name.' };
  }
  if (!input.category) {
    return { report: {} as Report, error: 'Please select an issue category.' };
  }

  const reference = generateReference();
  const now = new Date().toISOString();

  // Mode A: Live Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reference,
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          location_text: input.location_text.trim(),
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          status: 'Reported',
          created_by: creatorUserId ?? null,
        })
        .select()
        .single();

      if (error) {
        if (isSchemaCacheError(error)) {
          console.warn(
            "[Supabase Schema Cache Alert] Table 'public.reports' not found in cloud project. Run supabase/migrations/001_core_report_and_history.sql in Supabase SQL Editor. Falling back to persistent storage."
          );
        } else {
          console.error('Supabase createReport error:', error);
          return { report: {} as Report, error: error.message };
        }
      } else if (data) {
        // Record initial status history
        await supabase.from('report_status_history').insert({
          report_id: data.id,
          old_status: null,
          new_status: 'Reported',
          changed_by: creatorUserId ?? null,
          message: 'Report submitted by citizen',
        });

        return { report: data as Report };
      }
    } catch (err: any) {
      console.warn('Falling back to local storage due to Supabase error:', err);
    }
  }

  // Mode B: Local Persistent Storage
  const reports = loadLocalStorage<Report[]>(STORAGE_KEY_REPORTS, SEED_REPORTS);
  const history = loadLocalStorage<ReportStatusHistory[]>(STORAGE_KEY_HISTORY, SEED_HISTORY);

  const newReport: Report = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reference,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    location_text: input.location_text.trim(),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: 'Reported',
    created_by: creatorUserId ?? 'anonymous-citizen',
    created_at: now,
    updated_at: now,
    confirmations_count: 0,
    has_confirmed: false,
  };

  reports.unshift(newReport);
  saveLocalStorage(STORAGE_KEY_REPORTS, reports);

  // Record initial status history
  const initialHistory: ReportStatusHistory = {
    id: `hist-${Date.now()}`,
    report_id: newReport.id,
    old_status: null,
    new_status: 'Reported',
    changed_by: creatorUserId ?? 'Citizen',
    message: 'Report submitted by citizen',
    created_at: now,
  };
  history.push(initialHistory);
  saveLocalStorage(STORAGE_KEY_HISTORY, history);

  return { report: newReport };
}

// -----------------------------------------------------------------------------
// 2. BROWSE REPORTS (FR-02)
// -----------------------------------------------------------------------------
export async function getReports(
  filters: ReportFilterParams = {},
  currentUserId?: string
): Promise<{ reports: Report[]; error?: string }> {
  // Mode A: Live Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

      if (filters.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const term = `%${filters.searchQuery.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term},location_text.ilike.${term},reference.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) {
        if (isSchemaCacheError(error)) {
          console.warn(
            "[Supabase Schema Cache Alert] Table 'public.reports' not found in schema cache. Execute migration SQL in Supabase dashboard. Falling back to local storage."
          );
        } else {
          console.error('Supabase getReports error:', error);
          return { reports: [], error: error.message };
        }
      } else if (data) {
        return { reports: data as Report[] };
      }
    } catch (err: any) {
      console.warn('Falling back to local storage for getReports:', err);
    }
  }

  // Mode B: Local Persistent Storage
  const allReports = loadLocalStorage<Report[]>(STORAGE_KEY_REPORTS, SEED_REPORTS);
  const confirmations = loadLocalStorage<ReportConfirmation[]>(STORAGE_KEY_CONFIRMATIONS, []);

  let filtered = allReports.map((r) => {
    const reportConfs = confirmations.filter((c) => c.report_id === r.id);
    const hasConfirmed = currentUserId ? reportConfs.some((c) => c.user_id === currentUserId) : false;
    return {
      ...r,
      confirmations_count: (r.confirmations_count || 0) + reportConfs.length,
      has_confirmed: hasConfirmed,
    };
  });

  if (filters.category && filters.category !== 'ALL') {
    filtered = filtered.filter((r) => r.category === filters.category);
  }
  if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter((r) => r.status === filters.status);
  }
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.location_text.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (filters.sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (filters.sortBy === 'confirmations') {
    filtered.sort((a, b) => (b.confirmations_count || 0) - (a.confirmations_count || 0));
  } else {
    // Default: newest
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return { reports: filtered };
}

// -----------------------------------------------------------------------------
// 3. VIEW REPORT DETAILS (FR-03)
// -----------------------------------------------------------------------------
export async function getReportByReference(
  reference: string,
  currentUserId?: string
): Promise<{ report?: Report; history: ReportStatusHistory[]; error?: string }> {
  const cleanRef = reference.trim().toUpperCase();

  // Mode A: Live Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('reference', cleanRef)
        .single();

      if (reportError) {
        if (!isSchemaCacheError(reportError)) {
          return { history: [], error: 'Report not found with reference: ' + cleanRef };
        }
      } else if (reportData) {
        const { data: histData } = await supabase
          .from('report_status_history')
          .select('*')
          .eq('report_id', reportData.id)
          .order('created_at', { ascending: true });

        return {
          report: reportData as Report,
          history: (histData || []) as ReportStatusHistory[],
        };
      }
    } catch (err: any) {
      console.warn('Falling back to local storage for getReportByReference:', err);
    }
  }

  // Mode B: Local Persistent Storage
  const reports = loadLocalStorage<Report[]>(STORAGE_KEY_REPORTS, SEED_REPORTS);
  const history = loadLocalStorage<ReportStatusHistory[]>(STORAGE_KEY_HISTORY, SEED_HISTORY);
  const confirmations = loadLocalStorage<ReportConfirmation[]>(STORAGE_KEY_CONFIRMATIONS, []);

  const report = reports.find((r) => r.reference.toUpperCase() === cleanRef);
  if (!report) {
    return { history: [], error: `No report found matching reference "${cleanRef}".` };
  }

  const reportConfs = confirmations.filter((c) => c.report_id === report.id);
  const hasConfirmed = currentUserId ? reportConfs.some((c) => c.user_id === currentUserId) : false;

  const reportWithPulse: Report = {
    ...report,
    confirmations_count: (report.confirmations_count || 0) + reportConfs.length,
    has_confirmed: hasConfirmed,
  };

  const reportHistory = history
    .filter((h) => h.report_id === report.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return { report: reportWithPulse, history: reportHistory };
}

// -----------------------------------------------------------------------------
// 4. MODERATOR STATUS UPDATE (FR-04)
// -----------------------------------------------------------------------------
export async function updateReportStatus(
  input: StatusUpdateInput
): Promise<{ success: boolean; updatedReport?: Report; error?: string }> {
  const { reportId, newStatus, message, moderatorId } = input;
  const now = new Date().toISOString();

  // Mode A: Live Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch current report
      const { data: currentReport, error: fetchErr } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!fetchErr && currentReport) {
        const oldStatus = currentReport.status as ReportStatus;

        // 2. Update status
        const { data: updatedData, error: updateErr } = await supabase
          .from('reports')
          .update({
            status: newStatus,
            updated_at: now,
          })
          .eq('id', reportId)
          .select()
          .single();

        if (updateErr) {
          return { success: false, error: updateErr.message };
        }

        // 3. Record status history entry
        await supabase.from('report_status_history').insert({
          report_id: reportId,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: moderatorId || 'moderator',
          message: message?.trim() || `Status updated from ${oldStatus} to ${newStatus}`,
        });

        return { success: true, updatedReport: updatedData as Report };
      }
    } catch (err: any) {
      console.warn('Falling back to local storage for updateReportStatus:', err);
    }
  }

  // Mode B: Local Persistent Storage
  const reports = loadLocalStorage<Report[]>(STORAGE_KEY_REPORTS, SEED_REPORTS);
  const history = loadLocalStorage<ReportStatusHistory[]>(STORAGE_KEY_HISTORY, SEED_HISTORY);

  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx === -1) {
    return { success: false, error: 'Report not found.' };
  }

  const oldStatus = reports[idx].status;
  reports[idx] = {
    ...reports[idx],
    status: newStatus,
    updated_at: now,
  };
  saveLocalStorage(STORAGE_KEY_REPORTS, reports);

  // Record history
  const historyEntry: ReportStatusHistory = {
    id: `hist-${Date.now()}`,
    report_id: reportId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: moderatorId || 'Authorized Moderator',
    message: message?.trim() || `Status transitioned to ${newStatus}`,
    created_at: now,
  };
  history.push(historyEntry);
  saveLocalStorage(STORAGE_KEY_HISTORY, history);

  return { success: true, updatedReport: reports[idx] };
}

// -----------------------------------------------------------------------------
// 5. RAASTA PULSE CONFIRMATIONS (FR-05)
// -----------------------------------------------------------------------------
export async function toggleConfirmation(
  reportId: string,
  userId: string
): Promise<{ confirmed: boolean; newCount: number; error?: string }> {
  if (!userId) {
    return { confirmed: false, newCount: 0, error: 'User must be identified to confirm.' };
  }

  // Mode A: Live Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing, error: checkErr } = await supabase
        .from('report_confirmations')
        .select('id')
        .eq('report_id', reportId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!checkErr) {
        if (existing) {
          await supabase.from('report_confirmations').delete().eq('id', existing.id);
          const { count } = await supabase
            .from('report_confirmations')
            .select('*', { count: 'exact', head: true })
            .eq('report_id', reportId);
          return { confirmed: false, newCount: count || 0 };
        } else {
          await supabase.from('report_confirmations').insert({
            report_id: reportId,
            user_id: userId,
          });
          const { count } = await supabase
            .from('report_confirmations')
            .select('*', { count: 'exact', head: true })
            .eq('report_id', reportId);
          return { confirmed: true, newCount: count || 1 };
        }
      }
    } catch (err: any) {
      console.warn('Falling back to local storage for toggleConfirmation:', err);
    }
  }

  // Mode B: Local Persistent Storage
  const confirmations = loadLocalStorage<ReportConfirmation[]>(STORAGE_KEY_CONFIRMATIONS, []);
  const reports = loadLocalStorage<Report[]>(STORAGE_KEY_REPORTS, SEED_REPORTS);
  const targetReport = reports.find((r) => r.id === reportId);

  // Prevent creator from confirming own report
  if (targetReport && targetReport.created_by === userId) {
    return {
      confirmed: false,
      newCount: targetReport.confirmations_count || 0,
      error: 'As the author of this report, your report is already registered.',
    };
  }

  const existingIdx = confirmations.findIndex((c) => c.report_id === reportId && c.user_id === userId);
  let confirmed = false;

  if (existingIdx >= 0) {
    confirmations.splice(existingIdx, 1);
    confirmed = false;
  } else {
    confirmations.push({
      id: `conf-${Date.now()}`,
      report_id: reportId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    confirmed = true;
  }

  saveLocalStorage(STORAGE_KEY_CONFIRMATIONS, confirmations);
  const baseCount = targetReport?.confirmations_count || 0;
  const activeCount = confirmations.filter((c) => c.report_id === reportId).length;

  return { confirmed, newCount: baseCount + activeCount };
}
