import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gaglasdtpbhxevenffdg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Eh7WCDXMILG8oyNj0e4PYA_UWfCiqTk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
