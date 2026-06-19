import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tkwmrfnasbaxcywbcwap.supabase.co';
const supabaseKey = 'sb_publishable_thj6LgVTiglyeAT5vv_Nyg__H1xIoPW';

export const supabase = createClient(supabaseUrl, supabaseKey);
