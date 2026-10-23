-- ==============================================================================
-- RAASTA CIVIC PLATFORM - CORE DATABASE SCHEMA
-- Migration: 001_core_reports_and_history.sql
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Report Status & Category Enum Types
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

DO $$ BEGIN
    CREATE TYPE report_category AS ENUM (
        'Pothole / Road Damage',
        'Water Supply & Leakage',
        'Garbage / Waste Disposal',
        'Streetlight / Electricity',
        'Sewage & Drainage',
        'Public Safety & Obstruction',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL DEFAULT 'Other',
    location_text VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    status report_status NOT NULL DEFAULT 'Reported',
    created_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    old_status report_status NULL,
    new_status report_status NOT NULL,
    changed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Community Confirmations Table (Raasta Pulse - Kashish branch integration)
CREATE TABLE IF NOT EXISTS public.report_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_report_user_confirmation UNIQUE (report_id, user_id)
);

-- 6. Sequence & Trigger for Unique Reference Generation (Format: RAA-2026-XXXX)
CREATE SEQUENCE IF NOT EXISTS report_reference_seq START WITH 1001;

CREATE OR REPLACE FUNCTION generate_report_reference()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
    cur_year TEXT;
BEGIN
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        next_val := nextval('report_reference_seq');
        cur_year := to_char(CURRENT_DATE, 'YYYY');
        NEW.reference := 'RAA-' || cur_year || '-' || lpad(next_val::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_report_reference ON public.reports;
CREATE TRIGGER trg_set_report_reference
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION generate_report_reference();

-- 7. Trigger to Record Initial Status History & Status Changes
CREATE OR REPLACE FUNCTION record_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.report_status_history (
            report_id,
            old_status,
            new_status,
            changed_by,
            message,
            created_at
        ) VALUES (
            NEW.id,
            NULL,
            NEW.status,
            NEW.created_by,
            'Initial report filed by citizen.',
            NEW.created_at
        );
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        NEW.updated_at := timezone('utc'::text, now());
        INSERT INTO public.report_status_history (
            report_id,
            old_status,
            new_status,
            changed_by,
            message,
            created_at
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(),
            'Status updated by moderator.',
            timezone('utc'::text, now())
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_report_status_history ON public.reports;
CREATE TRIGGER trg_report_status_history
    AFTER INSERT OR UPDATE OF status ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION record_status_history();

-- 8. Moderator Roles / Check Table
CREATE TABLE IF NOT EXISTS public.moderators (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.moderators
        WHERE user_id = auth.uid()
    ) OR (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'moderator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;

-- Public can read all reports
DROP POLICY IF EXISTS "Public can view all reports" ON public.reports;
CREATE POLICY "Public can view all reports"
    ON public.reports FOR SELECT
    TO anon, authenticated
    USING (true);

-- Anyone (citizen/anon or auth) can create reports
DROP POLICY IF EXISTS "Anyone can create reports" ON public.reports;
CREATE POLICY "Anyone can create reports"
    ON public.reports FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        title IS NOT NULL AND length(trim(title)) > 3 AND
        description IS NOT NULL AND length(trim(description)) > 5 AND
        location_text IS NOT NULL
    );

-- Only moderators can update report status
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (is_moderator())
    WITH CHECK (is_moderator());

-- Public can view status history
DROP POLICY IF EXISTS "Public can view status history" ON public.report_status_history;
CREATE POLICY "Public can view status history"
    ON public.report_status_history FOR SELECT
    TO anon, authenticated
    USING (true);

-- Confirmations policies
DROP POLICY IF EXISTS "Public can view confirmations" ON public.report_confirmations;
CREATE POLICY "Public can view confirmations"
    ON public.report_confirmations FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle their confirmation" ON public.report_confirmations;
CREATE POLICY "Authenticated users can toggle their confirmation"
    ON public.report_confirmations FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reports_reference ON public.reports(reference);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_report_id ON public.report_status_history(report_id, created_at ASC);
