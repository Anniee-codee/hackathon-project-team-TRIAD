// ==============================================================================
// RAASTA — BACKEND VERIFICATION SUITE
// Automated verification for FR-01 through FR-05
// ==============================================================================

const assert = require('assert');

// In-memory mock storage replicating the browser localStorage engine
const storage = new Map();
global.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, val),
  removeItem: (key) => storage.delete(key),
};

function generateReference() {
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

const STORAGE_KEY_REPORTS = 'raasta_reports_v1';
const STORAGE_KEY_HISTORY = 'raasta_history_v1';
const STORAGE_KEY_CONFIRMATIONS = 'raasta_confirmations_v1';

function getReports(filters = {}, currentUserId) {
  const raw = storage.get(STORAGE_KEY_REPORTS);
  const reports = raw ? JSON.parse(raw) : [];
  const confRaw = storage.get(STORAGE_KEY_CONFIRMATIONS);
  const confs = confRaw ? JSON.parse(confRaw) : [];

  let filtered = reports.map((r) => {
    const reportConfs = confs.filter((c) => c.report_id === r.id);
    return {
      ...r,
      confirmations_count: (r.confirmations_count || 0) + reportConfs.length,
      has_confirmed: currentUserId ? reportConfs.some((c) => c.user_id === currentUserId) : false,
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

  return filtered;
}

function createReport(input, creatorUserId = 'citizen-101') {
  if (!input.title || input.title.trim().length < 5) {
    return { error: 'Title must be at least 5 characters long.' };
  }
  if (!input.description || input.description.trim().length < 10) {
    return { error: 'Description must be at least 10 characters long.' };
  }
  if (!input.location_text || input.location_text.trim().length < 3) {
    return { error: 'Please provide a valid location or area name.' };
  }
  if (!input.category) {
    return { error: 'Please select an issue category.' };
  }

  const raw = storage.get(STORAGE_KEY_REPORTS);
  const reports = raw ? JSON.parse(raw) : [];
  const histRaw = storage.get(STORAGE_KEY_HISTORY);
  const history = histRaw ? JSON.parse(histRaw) : [];

  const reference = generateReference();
  const now = new Date().toISOString();

  const newReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    reference,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    location_text: input.location_text.trim(),
    latitude: input.latitude || null,
    longitude: input.longitude || null,
    status: 'Reported',
    created_by: creatorUserId,
    created_at: now,
    updated_at: now,
    confirmations_count: 0,
  };

  reports.unshift(newReport);
  storage.set(STORAGE_KEY_REPORTS, JSON.stringify(reports));

  const histEntry = {
    id: `hist-${Date.now()}`,
    report_id: newReport.id,
    old_status: null,
    new_status: 'Reported',
    changed_by: creatorUserId,
    message: 'Report submitted by citizen',
    created_at: now,
  };
  history.push(histEntry);
  storage.set(STORAGE_KEY_HISTORY, JSON.stringify(history));

  return { report: newReport };
}

function getReportByReference(reference) {
  const raw = storage.get(STORAGE_KEY_REPORTS);
  const reports = raw ? JSON.parse(raw) : [];
  const histRaw = storage.get(STORAGE_KEY_HISTORY);
  const history = histRaw ? JSON.parse(histRaw) : [];

  const report = reports.find((r) => r.reference.toUpperCase() === reference.trim().toUpperCase());
  if (!report) return { error: 'Not found' };

  const reportHistory = history
    .filter((h) => h.report_id === report.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return { report, history: reportHistory };
}

function updateReportStatus(reportId, newStatus, message, moderatorId = 'Officer-42') {
  const raw = storage.get(STORAGE_KEY_REPORTS);
  const reports = raw ? JSON.parse(raw) : [];
  const histRaw = storage.get(STORAGE_KEY_HISTORY);
  const history = histRaw ? JSON.parse(histRaw) : [];

  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx === -1) return { error: 'Report not found' };

  const oldStatus = reports[idx].status;
  const now = new Date().toISOString();

  reports[idx].status = newStatus;
  reports[idx].updated_at = now;
  storage.set(STORAGE_KEY_REPORTS, JSON.stringify(reports));

  const histEntry = {
    id: `hist-${Date.now()}`,
    report_id: reportId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: moderatorId,
    message: message || `Status transitioned to ${newStatus}`,
    created_at: now,
  };
  history.push(histEntry);
  storage.set(STORAGE_KEY_HISTORY, JSON.stringify(history));

  return { success: true, updatedReport: reports[idx] };
}

function toggleConfirmation(reportId, userId) {
  const confRaw = storage.get(STORAGE_KEY_CONFIRMATIONS);
  const confs = confRaw ? JSON.parse(confRaw) : [];
  const repRaw = storage.get(STORAGE_KEY_REPORTS);
  const reports = repRaw ? JSON.parse(repRaw) : [];
  const report = reports.find((r) => r.id === reportId);

  // Author excluded
  if (report && report.created_by === userId) {
    return { error: 'Author cannot confirm own report' };
  }

  const existingIdx = confs.findIndex((c) => c.report_id === reportId && c.user_id === userId);
  let confirmed = false;

  if (existingIdx >= 0) {
    confs.splice(existingIdx, 1);
    confirmed = false;
  } else {
    confs.push({ id: `c-${Date.now()}`, report_id: reportId, user_id: userId });
    confirmed = true;
  }

  storage.set(STORAGE_KEY_CONFIRMATIONS, JSON.stringify(confs));
  return { confirmed, count: confs.filter((c) => c.report_id === reportId).length };
}

// -----------------------------------------------------------------------------
// RUN TEST ASSERTIONS
// -----------------------------------------------------------------------------
console.log('🧪 Starting Raasta Core Backend Test Suite...\n');

// 1. Validation rejection test
const invalidSub = createReport({ title: 'Hi', description: 'Small', category: '', location_text: '' });
assert(invalidSub.error, 'Invalid submission should be rejected');
console.log('✅ FR-01: Validation correctly rejects incomplete/invalid submissions.');

// 2. Report creation & Unique reference generation
const validSub = createReport({
  title: 'Dangerous uncovered manhole on 4th Avenue',
  description: 'Open drainage manhole without warning barricades posing life hazard at night.',
  category: 'Water & Sewage',
  location_text: '4th Avenue, opposite Metro Station Pillar 42',
  latitude: 24.8712,
  longitude: 67.0451,
});

assert(validSub.report, 'Report should be created');
assert(validSub.report.reference.startsWith('RST-'), 'Reference must start with RST-');
assert.strictEqual(validSub.report.status, 'Reported', 'Initial status must be Reported');
console.log(`✅ FR-01: Successfully persisted report with unique reference: ${validSub.report.reference}`);

// 3. Search and category filter
const searchRes = getReports({ searchQuery: 'manhole', category: 'Water & Sewage' });
assert.strictEqual(searchRes.length, 1, 'Search query and category filter should find the created report');
assert.strictEqual(searchRes[0].reference, validSub.report.reference);
console.log('✅ FR-02: Browse reports filtering and text search successfully located the record.');

// 4. Report Details & Chronological History
const detailsRes = getReportByReference(validSub.report.reference);
assert(detailsRes.report, 'Report details must be found by reference');
assert.strictEqual(detailsRes.history.length, 1, 'History must contain initial submission entry');
assert.strictEqual(detailsRes.history[0].new_status, 'Reported');
console.log('✅ FR-03: Report details & initial status history retrieved chronologically.');

// 5. Moderator Status Update
const updateRes = updateReportStatus(
  validSub.report.id,
  'In Progress',
  'Field maintenance crew dispatched with reinforced replacement cover.',
  'Officer-709'
);

assert(updateRes.success, 'Status update must succeed');
assert.strictEqual(updateRes.updatedReport.status, 'In Progress');

const updatedDetails = getReportByReference(validSub.report.reference);
assert.strictEqual(updatedDetails.report.status, 'In Progress', 'Public view must reflect new status');
assert.strictEqual(updatedDetails.history.length, 2, 'History must now contain two chronological entries');
assert.strictEqual(updatedDetails.history[1].old_status, 'Reported');
assert.strictEqual(updatedDetails.history[1].new_status, 'In Progress');
assert.strictEqual(updatedDetails.history[1].changed_by, 'Officer-709');
console.log('✅ FR-04: Moderator status update committed and audit trail verified.');

// 6. Raasta Pulse Confirmations
const pulse1 = toggleConfirmation(validSub.report.id, validSub.report.created_by);
// Creator exclusion test
assert(pulse1.error, 'Author must be excluded from confirming own report');

const pulse2 = toggleConfirmation(validSub.report.id, 'citizen-commuter-1');
assert.strictEqual(pulse2.confirmed, true);
assert.strictEqual(pulse2.count, 1);

// Toggle off (remove confirmation)
const pulse3 = toggleConfirmation(validSub.report.id, 'citizen-commuter-1');
assert.strictEqual(pulse3.confirmed, false);
assert.strictEqual(pulse3.count, 0);
console.log('✅ FR-05: Raasta Pulse confirmation toggles and author exclusion verified.');

console.log('\n🎉 ALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!');
