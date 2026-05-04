import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yhmzruolieokljqwtobs.supabase.co";
const supabaseAnonKey = "sb_publishable_0itZt94lAk9rcZWN8j_8LQ_MT1yW2Xq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);