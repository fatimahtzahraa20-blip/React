import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  const auth = request.headers.get('Authorization');
  if (!auth) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return new Response('Only administrators can invite users', { status: 403, headers: corsHeaders });

  const { email, fullName, role } = await request.json();
  if (!email || !fullName || !['admin', 'hod', 'coordinator', 'faculty'].includes(role)) return new Response('Invalid invitation data', { status: 400, headers: corsHeaders });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName } });
  if (error) return Response.json({ error: error.message }, { status: 400, headers: corsHeaders });

  const { error: profileError } = await admin.from('profiles').update({ role }).eq('id', data.user.id).select('id').single();
  if (profileError) return Response.json({ error: 'Invitation sent, but role assignment failed. The user remains Faculty. Update their role in Team Management.' }, { status: 500, headers: corsHeaders });

  return Response.json({ user: data.user }, { headers: corsHeaders });
});