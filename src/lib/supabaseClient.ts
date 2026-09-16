import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string } {
  const localUrl = localStorage.getItem('ravi_supabase_url') || '';
  const localKey = localStorage.getItem('ravi_supabase_anon_key') || '';
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || '',
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function updateSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem('ravi_supabase_url', url);
  localStorage.setItem('ravi_supabase_anon_key', anonKey);
  supabaseInstance = null; // force re-creation
}

export const SUPABASE_SQL_SCHEMA = `-- RAVI KI UPSC DIARY — Supabase Schema & Row Level Security (RLS)
-- Run this in your Supabase SQL Editor to set up all tables and security policies:

-- 1. Profiles & Settings
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null default 'Ravi',
  display_name text not null default 'IAS RAVI',
  role text default 'UPSC 2029 Aspirant',
  mission text default 'First Attempt Preparation',
  tagline text default 'चलो कुछ ऐसा कर जाएँ, कि नाम हमारा मिसाल बन जाए।',
  target_year integer default 2029,
  first_attempt_year integer default 2029,
  job_end_date date default '2026-12-31',
  full_time_start_date date default '2027-01-01',
  daily_target_job_hours numeric default 5.5,
  daily_target_fulltime_hours numeric default 12.0,
  sleep_target_hours numeric default 6.0,
  optional_subject text default 'Political Science & International Relations (PSIR)',
  profile_photo text,
  manual_mode_override text default 'AUTO',
  pw_class_timing text default '19:00 - 22:30',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Daily Schedule
create table if not exists public.daily_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  day_of_week text not null default 'all',
  start_time text not null,
  end_time text not null,
  title text not null,
  duration_hours numeric not null default 1.0,
  category text not null default 'GS',
  is_study boolean default true,
  completed boolean default false,
  mode text default 'JOB + UPSC',
  notes text,
  created_at timestamptz default now()
);

-- 3. Study Entries (UPSC Study Register)
create table if not exists public.study_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  date date not null,
  subject text not null,
  topic text not null,
  study_type text not null,
  start_time text,
  end_time text,
  duration_hours numeric not null,
  source text,
  book text,
  lecture text,
  revision boolean default false,
  mcq_count integer default 0,
  pyq_count integer default 0,
  answer_writing_count integer default 0,
  test_count integer default 0,
  status text default 'Completed',
  difficulty text default 'Moderate',
  notes text,
  created_at timestamptz default now()
);

-- 4. Subjects & Topics
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  category text not null default 'GS',
  study_hours numeric default 0,
  total_topics integer default 0,
  completed_topics integer default 0,
  revision_count integer default 0,
  pyq_count integer default 0,
  mcq_count integer default 0,
  test_count integer default 0,
  color text default '#4F46E5',
  description text,
  created_at timestamptz default now()
);

-- 5. Books & Resources
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  subject text not null,
  author text,
  type text default 'Standard Book',
  total_pages integer default 100,
  completed_pages integer default 0,
  progress_percent numeric default 0,
  status text default 'Reading',
  notes text,
  created_at timestamptz default now()
);

-- 6. PYQ Entries
create table if not exists public.pyq_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  year integer not null,
  exam text not null default 'Prelims',
  subject text not null,
  topic text not null,
  question text not null,
  attempted boolean default true,
  correct boolean default true,
  explanation text,
  revision_required boolean default false,
  created_at timestamptz default now()
);

-- 7. MCQ Entries
create table if not exists public.mcq_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  date date not null,
  subject text not null,
  topic text not null,
  total_questions integer default 0,
  correct integer default 0,
  wrong integer default 0,
  skipped integer default 0,
  accuracy numeric default 0,
  source text,
  notes text,
  created_at timestamptz default now()
);

-- 8. Tests & Mocks
create table if not exists public.test_entries (
  id uuid primary key default gen_random_uuid(),
  user_id references auth.users on delete cascade,
  test_name text not null,
  date date not null,
  subject text not null,
  test_type text default 'Sectional',
  total_questions integer default 100,
  attempted integer default 0,
  correct integer default 0,
  wrong integer default 0,
  score numeric default 0,
  max_score numeric default 200,
  percentage numeric default 0,
  time_taken_minutes integer default 120,
  mistakes text,
  improvement_notes text,
  created_at timestamptz default now()
);

-- 9. Answer Writing
create table if not exists public.answer_writing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  date date not null,
  question text not null,
  subject text not null,
  topic text not null,
  word_limit integer default 250,
  words_written integer default 0,
  time_taken_minutes numeric default 9.0,
  self_score numeric default 0,
  max_score numeric default 15,
  model_answer_reviewed boolean default false,
  improvement_notes text,
  created_at timestamptz default now()
);

-- 10. Daily Diary
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  date date not null,
  what_i_learned text,
  what_i_completed text,
  mistakes_made text,
  how_to_improve_tomorrow text,
  biggest_achievement text,
  todays_lesson text,
  mood text default 'Determined',
  overall_rating integer default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  category text not null,
  deadline date,
  progress_percent numeric default 0,
  status text default 'In Progress',
  notes text,
  created_at timestamptz default now()
);

-- 12. Backlog
create table if not exists public.backlog (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  task text not null,
  category text not null,
  priority text default 'Medium',
  deadline date,
  status text default 'Pending',
  notes text,
  created_at timestamptz default now()
);

-- 13. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.daily_schedule enable row level security;
alter table public.study_entries enable row level security;
alter table public.subjects enable row level security;
alter table public.books enable row level security;
alter table public.pyq_entries enable row level security;
alter table public.mcq_entries enable row level security;
alter table public.test_entries enable row level security;
alter table public.answer_writing enable row level security;
alter table public.diary_entries enable row level security;
alter table public.goals enable row level security;
alter table public.backlog enable row level security;

-- Policies: Users can only view & modify their own rows
create policy "Users manage their own profiles" on public.profiles for all using (auth.uid() = user_id);
create policy "Users manage their own schedule" on public.daily_schedule for all using (auth.uid() = user_id);
create policy "Users manage their own study entries" on public.study_entries for all using (auth.uid() = user_id);
create policy "Users manage their own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Users manage their own books" on public.books for all using (auth.uid() = user_id);
create policy "Users manage their own pyqs" on public.pyq_entries for all using (auth.uid() = user_id);
create policy "Users manage their own mcqs" on public.mcq_entries for all using (auth.uid() = user_id);
create policy "Users manage their own tests" on public.test_entries for all using (auth.uid() = user_id);
create policy "Users manage their own answers" on public.answer_writing for all using (auth.uid() = user_id);
create policy "Users manage their own diary" on public.diary_entries for all using (auth.uid() = user_id);
create policy "Users manage their own goals" on public.goals for all using (auth.uid() = user_id);
create policy "Users manage their own backlog" on public.backlog for all using (auth.uid() = user_id);
`;
