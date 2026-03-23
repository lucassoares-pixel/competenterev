import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const SUPABASE_URL = 'https://hxcohoabnqdzekptrauu.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4Y29ob2FibnFkemVrcHRyYXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjExNDcsImV4cCI6MjA4OTc5NzE0N30.SXtnhP0HxY6du2hO-q62WUU5p9thvITmmEFe1g_b6S4'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } },
})

export default supabase
