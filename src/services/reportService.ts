import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Report, ReportStatus, ReportStatusHistory, CreateReportInput, FilterOptions } from '../types';

const LOCAL_STORAGE_KEY_REPORTS = 'raasta_mock_reports';
const LOCAL_STORAGE_KEY_HISTORY = 'raasta_mock_history';

// Initial seed data for fallback demonstration if live Supabase is not yet keyed
const INITIAL_SEED_REPORTS: Report[] = [
  {
    id: 'b521ea80-1a2f-4889-8d7b-4bbca076ec01',
    reference: 'RAA-2026-1001',
    title: 'Deep pothole causing accidents near Metro Station Gate 2',
    description: 'A major crater has developed right at the turning point of the main road. Two motorcyclists slipped yesterday evening during rain.',
    category: 'Pothole / Road Damage',
    location_text: 'Metro Station Gate 2, Ring Road',
    latitude: 25.3960,
    longitude: 68.3578,
    status: 'In Progress',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'c819fa22-3c4d-4e9b-b98a-5dfcb189fc02',
    reference: 'RAA-2026-1002',
    title: 'Main water line burst causing flooding on street 4',
    description: 'Clean drinking water is overflowing onto the street since 6 AM today, flooding 3 residential houses.',
    category: 'Water Supply & Leakage',
    location_text: 'Street 4, Sector B-11',
    latitude: 25.3940,
    longitude: 68.3610,
    status: 'Under Review',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'd920aa33-5e6f-4a1c-c01b-6eecb290fd03',
    reference: 'RAA-2026-1003',
    title: 'Uncollected garbage pile attracting stray animals',
    description: 'Municipal trash bin has been overflowing for over a week. Foul smell and health hazard for children attending nearby school.',
    category: 'Garbage / Waste Disposal',
    location_text: 'Corner of Jinnah Avenue & Market Rd',
    latitude: 25.3980,
    longitude: 68.3520,
    status: 'Reported',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

const INITIAL_SEED_HISTORY: ReportStatusHistory[] = [
  {
    id: 'hist-1',
    report_id: 'b521ea80-1a2f-4889-8d7b-4bbca076ec01',
    old_status: null,
    new_status: 'Reported',
    message: 'Initial report filed by citizen.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'hist-2',
    report_id: 'b521ea80-1a2f-4889-8d7b-4bbca076ec01',
    old_status: 'Reported',
    new_status: 'Under Review',
    message: 'Assigned to Ward Engineer for inspection.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'hist-3',
    report_id: 'b521ea80-1a2f-4889-8d7b-4bbca076ec01',
    old_status: 'Under Review',
    new_status: 'In Progress',
    message: 'Repair team and asphalt machine dispatched to site.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'hist-4',
    report_id: 'c819fa22-3c4d-4e9b-b98a-5dfcb189fc02',
    old_status: null,
    new_status: 'Reported',
    message: 'Initial report filed by citizen.',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'hist-5',
    report_id: 'c819fa22-3c4d-4e9b-b98a-5dfcb189fc02',
    old_status: 'Reported',
    new_status: 'Under Review',
    message: 'Water board quick-response unit notified.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'hist-6',
    report_id: 'd920aa33-5e6f-4a1c-c01b-6eecb290fd03',
    old_status: null,
    new_status: 'Reported',
    message: 'Initial report filed by citizen.',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

function getLocalReports(): Report[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_REPORTS);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_SEED_REPORTS));
    return INITIAL_SEED_REPORTS;
  }
  return JSON.parse(data);
}

function saveLocalReports(reports: Report[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_REPORTS, JSON.stringify(reports));
}

function getLocalHistory(): ReportStatusHistory[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(INITIAL_SEED_HISTORY));
    return INITIAL_SEED_HISTORY;
  }
  return JSON.parse(data);
}

function saveLocalHistory(history: ReportStatusHistory[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
}

/**
 * Creates a new civic report. Generates a unique human-readable reference.
 */
export async function createReport(input: CreateReportInput): Promise<{ data: Report | null; error: string | null }> {
  // Input validation
  if (!input.title || input.title.trim().length < 4) {
    return { data: null, error: 'Title must be at least 4 characters long.' };
  }
  if (!input.description || input.description.trim().length < 6) {
    return { data: null, error: 'Description must be at least 6 characters long.' };
  }
  if (!input.location_text || input.location_text.trim().length < 3) {
    return { data: null, error: 'Please specify a valid area or landmark.' };
  }

  // Live Supabase flow
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category,
          location_text: input.location_text.trim(),
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          status: 'Reported'
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data as Report, error: null };
    } catch (err: unknown) {
      return { data: null, error: (err as Error).message || 'Failed to submit report to Supabase.' };
    }
  }

  // Local persistence fallback
  const reports = getLocalReports();
  const nextSeq = reports.length + 1001;
  const curYear = new Date().getFullYear();
  const newRef = `RAA-${curYear}-${String(nextSeq).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newReport: Report = {
    id: 'local-' + Math.random().toString(36).substring(2, 11),
    reference: newRef,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    location_text: input.location_text.trim(),
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    status: 'Reported',
    created_at: now,
    updated_at: now,
  };

  reports.unshift(newReport);
  saveLocalReports(reports);

  const history = getLocalHistory();
  history.push({
    id: 'hist-' + Math.random().toString(36).substring(2, 11),
    report_id: newReport.id,
    old_status: null,
    new_status: 'Reported',
    message: 'Initial report filed by citizen.',
    created_at: now,
  });
  saveLocalHistory(history);

  return { data: newReport, error: null };
}

/**
 * Fetches all reports with optional text search, category, and status filters.
 */
export async function getReports(filters?: FilterOptions): Promise<{ data: Report[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.category && filters.category !== 'ALL') {
        query = query.eq('category', filters.category);
      }
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const term = `%${filters.searchQuery.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term},location_text.ilike.${term},reference.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) {
        return { data: [], error: error.message };
      }
      return { data: (data as Report[]) || [], error: null };
    } catch (err: unknown) {
      return { data: [], error: (err as Error).message || 'Failed to fetch reports from Supabase.' };
    }
  }

  // Local persistence fallback
  let reports = getLocalReports();
  if (filters?.status && filters.status !== 'ALL') {
    reports = reports.filter(r => r.status === filters.status);
  }
  if (filters?.category && filters.category !== 'ALL') {
    reports = reports.filter(r => r.category === filters.category);
  }
  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    reports = reports.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.location_text.toLowerCase().includes(q) ||
      r.reference.toLowerCase().includes(q)
    );
  }

  return { data: reports, error: null };
}

/**
 * Fetches a single report by reference or ID.
 */
export async function getReportByReference(referenceOrId: string): Promise<{ data: Report | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(referenceOrId);
      const query = isUuid
        ? supabase.from('reports').select('*').eq('id', referenceOrId).single()
        : supabase.from('reports').select('*').eq('reference', referenceOrId).single();

      const { data, error } = await query;
      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data as Report, error: null };
    } catch (err: unknown) {
      return { data: null, error: (err as Error).message || 'Failed to fetch report.' };
    }
  }

  const reports = getLocalReports();
  const found = reports.find(r => r.reference.toUpperCase() === referenceOrId.toUpperCase() || r.id === referenceOrId);
  return { data: found || null, error: found ? null : 'Report not found' };
}

/**
 * Fetches chronological status history for a given report.
 */
export async function getReportHistory(reportId: string): Promise<{ data: ReportStatusHistory[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('report_status_history')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }
      return { data: (data as ReportStatusHistory[]) || [], error: null };
    } catch (err: unknown) {
      return { data: [], error: (err as Error).message || 'Failed to fetch status history.' };
    }
  }

  const history = getLocalHistory();
  const filtered = history.filter(h => h.report_id === reportId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return { data: filtered, error: null };
}

/**
 * Updates a report status (Authorized Moderator action).
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  moderatorMessage?: string
): Promise<{ success: boolean; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Failed to update status in Supabase.' };
    }
  }

  // Local fallback
  const reports = getLocalReports();
  const index = reports.findIndex(r => r.id === reportId);
  if (index === -1) {
    return { success: false, error: 'Report not found' };
  }

  const oldStatus = reports[index].status;
  const now = new Date().toISOString();
  reports[index].status = newStatus;
  reports[index].updated_at = now;
  saveLocalReports(reports);

  const history = getLocalHistory();
  history.push({
    id: 'hist-' + Math.random().toString(36).substring(2, 11),
    report_id: reportId,
    old_status: oldStatus,
    new_status: newStatus,
    message: moderatorMessage || 'Status updated by authorized moderator.',
    created_at: now,
  });
  saveLocalHistory(history);

  return { success: true, error: null };
}
