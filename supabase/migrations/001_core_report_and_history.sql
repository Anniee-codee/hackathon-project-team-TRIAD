-- ==============================================================================
-- RAASTA CIVIC ISSUE REPORTING PLATFORM
-- Migration: 001_core_report_and_history.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE issue_category AS ENUM (
        'Roads & Potholes',
        'Water & Sewage',
        'Electricity',
        'Garbage & Sanitation',
        'Streetlights',
        'Public Safety',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM (
        'Reported',
        'Under Review',
        'In Progress',
        'Resolved',
        'Rejected',
        'Duplicate'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLE: reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(24) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category issue_category NOT NULL,
    location_text VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status report_status NOT NULL DEFAULT 'Reported',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLE: report_status_history
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    old_status report_status,
    new_status report_status NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLE: report_confirmations (Raasta Pulse - Secondary Feature)
CREATE TABLE IF NOT EXISTS public.report_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_report_user_confirmation UNIQUE (report_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_reference ON public.reports(reference);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_report ON public.report_status_history(report_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_confirmations_report ON public.report_confirmations(report_id);

-- 5. FUNCTION: Generate unique human-readable reference (e.g. RST-20261023-8412)
CREATE OR REPLACE FUNCTION public.generate_unique_report_reference()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    random_part TEXT;
    candidate_ref TEXT;
    ref_exists BOOLEAN;
BEGIN
    date_part := to_char(timezone('utc'::text, now()), 'YYYYMMDD');
    LOOP
        random_part := upper(substr(md5(random()::text), 1, 4));
        candidate_ref := 'RST-' || date_part || '-' || random_part;
        
        SELECT EXISTS(SELECT 1 FROM public.reports WHERE reference = candidate_ref) INTO ref_exists;
        EXIT WHEN NOT ref_exists;
    END LOOP;

    NEW.reference := candidate_ref;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Auto-assign reference before insert if not provided
DROP TRIGGER IF EXISTS trg_assign_report_reference ON public.reports;
CREATE TRIGGER trg_assign_report_reference
BEFORE INSERT ON public.reports
FOR EACH ROW
WHEN (NEW.reference IS NULL OR NEW.reference = '')
EXECUTE FUNCTION public.generate_unique_report_reference();

-- 6. FUNCTION & TRIGGER: Auto-log initial status and status transitions
CREATE OR REPLACE FUNCTION public.log_report_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.report_status_history (report_id, old_status, new_status, changed_by, message)
        VALUES (NEW.id, NULL, NEW.status, NEW.created_by, 'Report submitted by citizen');
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        NEW.updated_at := timezone('utc'::text, now());
        INSERT INTO public.report_status_history (report_id, old_status, new_status, changed_by, message)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), COALESCE(NEW.description, 'Status updated by moderator'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_report_status ON public.reports;
CREATE TRIGGER trg_log_report_status
AFTER INSERT OR UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.log_report_status_history();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_confirmations ENABLE ROW LEVEL SECURITY;

-- Reports: Anyone can view reports
DROP POLICY IF EXISTS "Public can view all reports" ON public.reports;
CREATE POLICY "Public can view all reports"
ON public.reports FOR SELECT
USING (true);

-- Reports: Anyone can insert a report, default status must be 'Reported'
DROP POLICY IF EXISTS "Citizens can submit reports" ON public.reports;
CREATE POLICY "Citizens can submit reports"
ON public.reports FOR INSERT
WITH CHECK (status = 'Reported');

-- Reports: Authenticated moderators can update report status
DROP POLICY IF EXISTS "Moderators can update report status" ON public.reports;
CREATE POLICY "Moderators can update report status"
ON public.reports FOR UPDATE
USING (true);

-- Status History: Anyone can view status history
DROP POLICY IF EXISTS "Public can view status history" ON public.report_status_history;
CREATE POLICY "Public can view status history"
ON public.report_status_history FOR SELECT
USING (true);

-- Confirmations: Anyone can view confirmations
DROP POLICY IF EXISTS "Public can view confirmations" ON public.report_confirmations;
CREATE POLICY "Public can view confirmations"
ON public.report_confirmations FOR SELECT
USING (true);

-- Confirmations: Users can add confirmation
DROP POLICY IF EXISTS "Users can add own confirmation" ON public.report_confirmations;
CREATE POLICY "Users can add own confirmation"
ON public.report_confirmations FOR INSERT
WITH CHECK (true);

-- Confirmations: Users can remove confirmation
DROP POLICY IF EXISTS "Users can remove own confirmation" ON public.report_confirmations;
CREATE POLICY "Users can remove own confirmation"
ON public.report_confirmations FOR DELETE
USING (true);
