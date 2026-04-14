// --- Supabase Configuration ---
// Note: In a production environment with a build tool, you would use environment variables.
// For a vanilla JS project, ensure this file is NOT public if your database is sensitive.
var SUPABASE_URL = 'https://yadfrluqxsrmgsfrrkqn.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZGZybHVxeHNybWdzZnJya3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjEyNzUsImV4cCI6MjA5MTczNzI3NX0.HrIzK5psYiIzdLOY-TjNR8DO0a7L2gLcTjjoLqLonqs';

var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
