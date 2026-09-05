import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const parts = [value.message, value.details, value.hint]
      .filter((part): part is string => typeof part === "string" && part.length > 0);
    if (parts.length) return parts.join(" ");
    if (typeof value.code === "string") return `Supabase error ${value.code}`;
  }
  if (typeof error === "string" && error) return error;
  return "The account service could not complete the request.";
}
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let createdUserId: string | undefined;
  let shouldDeleteCreatedUser = false;
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const callerClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Authentication required");
    const body = await request.json();
    if (!["student", "teacher"].includes(body.role)) throw new Error("Only student and teacher accounts can be created here.");
    const admin = createClient(url, serviceRole);
    const { data: isAdmin, error: adminPermissionError } = await callerClient.rpc("is_admin");
    if (adminPermissionError) throw adminPermissionError;
    const { data: isTeacher, error: teacherPermissionError } = await callerClient.rpc("has_role", { requested_role: "teacher" });
    if (teacherPermissionError) throw teacherPermissionError;
    if (!isAdmin && !isTeacher) throw new Error("Administrator or teacher access required");
    if (!isAdmin) {
      if (body.role !== "student") throw new Error("Teachers can create student accounts only.");
      const { data: assignedBatch, error: assignedBatchError } = await admin
        .from("teachers")
        .select("teacher_batches!inner(batch_id)")
        .eq("profile_id", caller.id)
        .eq("teacher_batches.batch_id", body.batchId)
        .maybeSingle();
      if (assignedBatchError) throw assignedBatchError;
      if (!assignedBatch) throw new Error("You can enroll students only in a batch assigned to you.");
    }

    const normalizedEmail = String(body.email ?? "").trim().toLowerCase();
    if (!normalizedEmail) throw new Error("Email is required.");
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.fullName },
    });
    if (createError) {
      const createMessage = createError.message.toLowerCase();
      const alreadyRegistered = createMessage.includes("already") || createMessage.includes("registered") || createMessage.includes("exists");
      if (!alreadyRegistered || body.role !== "student") throw createError;

      let existingUser;
      for (let page = 1; page <= 100 && !existingUser; page += 1) {
        const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (usersError) throw usersError;
        existingUser = usersPage.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
        if (usersPage.users.length < 1000) break;
      }
      if (!existingUser) throw new Error("This email is already registered, but its account could not be found.");
      createdUserId = existingUser.id;

      const { data: existingRoles, error: existingRolesError } = await admin.from("profile_roles").select("roles(name)").eq("profile_id", createdUserId);
      if (existingRolesError) throw existingRolesError;
      const privileged = existingRoles?.some((entry) => {
        const role = Array.isArray(entry.roles) ? entry.roles[0] : entry.roles;
        return role && ["super_admin", "admin", "teacher"].includes(role.name);
      });
      if (privileged) throw new Error("This email belongs to a staff account and cannot be enrolled as a student.");

      const { data: existingStudent, error: existingStudentError } = await admin.from("students").select("id").eq("profile_id", createdUserId).maybeSingle();
      if (existingStudentError) throw existingStudentError;
      if (existingStudent) throw new Error("This email is already linked to a student enrollment.");
    } else {
      if (!created.user) throw new Error("User creation failed");
      createdUserId = created.user.id;
      shouldDeleteCreatedUser = true;
    }

    const { error: profileError } = await admin.from("profiles").update({
      full_name: body.fullName,
      phone: body.phone || null,
    }).eq("id", createdUserId);
    if (profileError) throw profileError;

    const { data: role, error: roleError } = await admin.from("roles").select("id").eq("name", body.role).single();
    if (roleError) throw roleError;
    const { error: clearRoleError } = await admin.from("profile_roles").delete().eq("profile_id", createdUserId);
    if (clearRoleError) throw clearRoleError;
    const { error: roleInsertError } = await admin.from("profile_roles").insert({ profile_id: createdUserId, role_id: role.id });
    if (roleInsertError) throw roleInsertError;

    if (body.role === "student") {
      const { error } = await admin.from("students").insert({
        profile_id: createdUserId,
        application_id: body.applicationId,
        father_name: body.fatherName,
        address: body.address || null,
        course_id: body.courseId,
        batch_id: body.batchId,
        enrollment_date: body.enrollmentDate,
      });
      if (error) throw error;
    }

    if (body.role === "teacher") {
      const { data: teacher, error } = await admin.from("teachers").insert({
        profile_id: createdUserId,
        employee_id: body.employeeId,
        specialization: body.specialization || null,
        joining_date: body.joiningDate,
      }).select("id").single();
      if (error) throw error;
      if (body.batchIds?.length) {
        const { error: batchesError } = await admin.from("teacher_batches").insert(
          body.batchIds.map((batchId: string) => ({ teacher_id: teacher.id, batch_id: batchId })),
        );
        if (batchesError) throw batchesError;
      }
    }

    return new Response(JSON.stringify({ id: createdUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    if (createdUserId && shouldDeleteCreatedUser) {
      try {
        const url = Deno.env.get("SUPABASE_URL")!;
        const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        await createClient(url, serviceRole).auth.admin.deleteUser(createdUserId);
      } catch {
        // The original error is more useful to the caller.
      }
    }
    return new Response(JSON.stringify({ error: errorMessage(error) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


