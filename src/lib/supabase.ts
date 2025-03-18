
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmegcufwqfhdsvajvahz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtZWdjdWZ3cWZoZHN2YWp2YWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNzExNTIsImV4cCI6MjA1NDk0NzE1Mn0.NEMBNLDiK9Cxt-r48aTh2AVLvB45iwYIJeOQ3NGA1fI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
};

export type Task = {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignee_id?: string;
  assignee_name?: string;
  deadline?: string;
  time_estimate?: number;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  next_contact_date?: string;
  created_at: string;
  updated_at: string;
};
