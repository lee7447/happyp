import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mvvevmuhzadfkgrgixzd.supabase.co";
const supabaseKey = "sb_publishable_4qDQC_oajW1D5_kL4yGE_g_kvqfo7fz";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);