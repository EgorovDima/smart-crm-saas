// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mpecqvgsnfbbayndfsdb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZWNxdmdzbmZiYmF5bmRmc2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjc0MTksImV4cCI6MjA1Nzk0MzQxOX0.dA0y-HzB-pbJ1n-EZYYOHxNLfbswxNrWdxeCD2XvK-U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);