import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export const WHATSAPP_NUMBER =
  process.env.REACT_APP_WHATSAPP_NUMBER || "919533726951";
export const ADMIN_EMAIL =
  process.env.REACT_APP_ADMIN_EMAIL || "sweetnestmalkajgiri@gmail.com";
export const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_d900ca27-18dc-4d29-be23-8d2921c7d259/artifacts/8qzlth55_ChatGPT%20Image%20Apr%2018%2C%202026%2C%2011_39_09%20AM.png";
