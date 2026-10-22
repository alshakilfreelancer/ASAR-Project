import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ClientInquiryItem } from '../data/defaultData';

export const SUPABASE_PROJECT_ID = 'utblsxterubtziionaja';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_WEybADSkx1-kQdyJvHI3_Q_j9JYkFIZ';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(
  customUrl: string = SUPABASE_URL,
  customKey: string = SUPABASE_PUBLISHABLE_KEY
): SupabaseClient {
  const url = (customUrl || SUPABASE_URL).trim();
  const key = (customKey || SUPABASE_PUBLISHABLE_KEY).trim();

  if (!cachedClient || cachedUrl !== url || cachedKey !== key) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedUrl = url;
    cachedKey = key;
  }
  return cachedClient;
}

export interface SupabaseInquiryRow {
  id: string;
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  inquiry_type: string;
  project_location: string;
  manpower_details: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  created_at?: string;
}

export interface SupabaseOperationResult {
  ok: boolean;
  needsTableSetup?: boolean;
  message: string;
  errorCode?: string;
}

/**
 * Ready-to-run SQL script for Supabase SQL Editor (Project: utblsxterubtziionaja)
 * Creates the `public.inquiries` table for the website form and `public.site_cms` table for Admin Mode edits.
 */
export const SUPABASE_SQL_SETUP_SCRIPT = `-- Run this once in your Supabase SQL Editor (Project ID: utblsxterubtziionaja)
-- URL: https://supabase.com/dashboard/project/utblsxterubtziionaja/sql/new

CREATE TABLE IF NOT EXISTS public.inquiries (
  id text PRIMARY KEY,
  client_name text NOT NULL,
  company_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  inquiry_type text NOT NULL,
  project_location text NOT NULL,
  manpower_details text DEFAULT '',
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on inquiries" ON public.inquiries;
CREATE POLICY "Allow public insert on inquiries"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on inquiries" ON public.inquiries;
CREATE POLICY "Allow public select on inquiries"
  ON public.inquiries FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public update on inquiries" ON public.inquiries;
CREATE POLICY "Allow public update on inquiries"
  ON public.inquiries FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on inquiries" ON public.inquiries;
CREATE POLICY "Allow public delete on inquiries"
  ON public.inquiries FOR DELETE
  TO anon, authenticated
  USING (true);

-- Optional table for full website CMS state sync
CREATE TABLE IF NOT EXISTS public.site_cms (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_cms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on site_cms" ON public.site_cms;
CREATE POLICY "Allow public access on site_cms"
  ON public.site_cms FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);`;

function mapRowToInquiryItem(row: Record<string, unknown>): ClientInquiryItem {
  const rawType = String(
    row.inquiry_type || row.inquiryType || 'Skilled & Unskilled Manpower Supply'
  ) as ClientInquiryItem['inquiryType'];

  const rawStatus = String(row.status || 'new');
  const validStatus: ClientInquiryItem['status'] =
    rawStatus === 'reviewed' || rawStatus === 'archived' ? rawStatus : 'new';

  return {
    id: String(row.id || `inq-${Date.now()}`),
    clientName: String(row.client_name || row.clientName || 'Valued Client'),
    companyName: String(row.company_name || row.companyName || 'Client Organization'),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    inquiryType: rawType,
    projectLocation: String(row.project_location || row.projectLocation || 'Muscat, Oman'),
    manpowerDetails: String(row.manpower_details || row.manpowerDetails || ''),
    message: String(row.message || ''),
    status: validStatus,
    authorId: 'supabase_backend',
    createdAtText: row.created_at ? String(row.created_at) : undefined,
  };
}

/**
 * Inserts a new client inquiry from the website form into Supabase (`public.inquiries`).
 */
export async function submitInquiryToSupabase(
  inquiry: ClientInquiryItem,
  customUrl?: string,
  customKey?: string
): Promise<SupabaseOperationResult> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const rowPayload: SupabaseInquiryRow = {
      id: inquiry.id,
      client_name: inquiry.clientName,
      company_name: inquiry.companyName,
      email: inquiry.email,
      phone: inquiry.phone,
      inquiry_type: inquiry.inquiryType,
      project_location: inquiry.projectLocation,
      manpower_details: inquiry.manpowerDetails || '',
      message: inquiry.message,
      status: inquiry.status || 'new',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('inquiries').insert([rowPayload]);

    if (error) {
      const isMissingTable =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('could not find the table') ||
        error.message?.toLowerCase().includes('relation "public.inquiries" does not exist');

      return {
        ok: false,
        needsTableSetup: isMissingTable,
        errorCode: error.code,
        message: isMissingTable
          ? 'Supabase connected (utblsxterubtziionaja), but table "public.inquiries" is not created yet. Run the 1-click SQL setup script in your Supabase dashboard.'
          : `Supabase response: ${error.message}`,
      };
    }

    return {
      ok: true,
      message: `Saved directly to Supabase (Project: ${SUPABASE_PROJECT_ID}) table "public.inquiries".`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Network error connecting to Supabase',
    };
  }
}

/**
 * Fetches all submitted inquiries from Supabase (`public.inquiries`).
 */
export async function fetchInquiriesFromSupabase(
  customUrl?: string,
  customKey?: string
): Promise<{ items: ClientInquiryItem[]; status: SupabaseOperationResult }> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      const isMissingTable =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('could not find the table') ||
        error.message?.toLowerCase().includes('relation "public.inquiries" does not exist');

      return {
        items: [],
        status: {
          ok: false,
          needsTableSetup: isMissingTable,
          errorCode: error.code,
          message: isMissingTable
            ? 'Connected to Supabase project utblsxterubtziionaja — waiting for "public.inquiries" table creation.'
            : error.message,
        },
      };
    }

    const items = Array.isArray(data)
      ? data.map((row) => mapRowToInquiryItem(row as Record<string, unknown>))
      : [];

    return {
      items,
      status: {
        ok: true,
        message: `Connected to Supabase (${SUPABASE_PROJECT_ID}) · ${items.length} inquiries loaded.`,
      },
    };
  } catch (err) {
    return {
      items: [],
      status: {
        ok: false,
        message: err instanceof Error ? err.message : 'Unable to reach Supabase endpoint',
      },
    };
  }
}

/**
 * Updates an inquiry status ('new' | 'reviewed' | 'archived') in Supabase (`public.inquiries`).
 */
export async function updateInquiryStatusInSupabase(
  id: string,
  status: ClientInquiryItem['status'],
  customUrl?: string,
  customKey?: string
): Promise<SupabaseOperationResult> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
    if (error) {
      return { ok: false, errorCode: error.code, message: error.message };
    }
    return { ok: true, message: `Updated inquiry ${id} status to ${status.toUpperCase()} in Supabase.` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to update inquiry in Supabase',
    };
  }
}

/**
 * Deletes an inquiry row from Supabase (`public.inquiries`).
 */
export async function deleteInquiryFromSupabase(
  id: string,
  customUrl?: string,
  customKey?: string
): Promise<SupabaseOperationResult> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) {
      return { ok: false, errorCode: error.code, message: error.message };
    }
    return { ok: true, message: `Deleted inquiry ${id} from Supabase.` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to delete inquiry from Supabase',
    };
  }
}

/**
 * Optional: Syncs full website CMS state to Supabase (`public.site_cms`) if the table exists.
 */
export async function syncSiteCmsToSupabase(
  payload: Record<string, unknown>,
  customUrl?: string,
  customKey?: string
): Promise<SupabaseOperationResult> {
  try {
    const supabase = getSupabaseClient(customUrl, customKey);
    const { error } = await supabase.from('site_cms').upsert(
      {
        id: 'main',
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      return { ok: false, errorCode: error.code, message: error.message };
    }
    return { ok: true, message: 'Synced website CMS state to Supabase (public.site_cms).' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to sync CMS state to Supabase',
    };
  }
}
