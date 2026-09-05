import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LoaderCircle, Save, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { getBatches } from "@/features/shared/api/catalog.api";
import { getStudents } from "@/features/students/api/students.api";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import type { AttendanceStatus } from "@/types/database.types";
import { getAttendance, getAttendanceReport, saveAttendance } from "../api/attendance.api";

interface AttendanceReportRow {
  id: string; student_id: string; batch_id: string; attendance_date: string; status: AttendanceStatus; remarks: string | null;
  students?: { application_id: string; profiles?: { full_name: string } | null } | null;
  batches?: { name: string } | null;
}

function downloadCsv(name: string, rows: (string | number)[][]) {
  const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AttendanceManagementPage() {
  const { user, roles } = useAuthStore();
  const canMark = roles.some((role) => ["super_admin", "admin", "teacher"].includes(role));
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"mark" | "report">("mark");
  const client = useQueryClient();

  const batches = useQuery({ queryKey: ["batches"], queryFn: getBatches, enabled: canMark });
  useEffect(() => { if (!batchId && batches.data?.[0]) setBatchId(batches.data[0].id); }, [batchId, batches.data]);
  const students = useQuery({
    queryKey: ["attendance-students", batchId],
    queryFn: () => getStudents({ batchId, pageSize: 500 }),
    enabled: Boolean(batchId) && canMark,
  });
  const existing = useQuery({
    queryKey: ["attendance-records", batchId, date],
    queryFn: () => getAttendance(batchId, date),
    enabled: Boolean(batchId) && canMark,
  });
  const report = useQuery({
    queryKey: ["attendance-report", batchId],
    queryFn: () => getAttendanceReport(),
    enabled: canMark && view === "report",
  });

  useEffect(() => {
    if (!students.data || existing.isLoading) return;
    const saved = new Map(existing.data?.map((record) => [record.student_id, record]));
    setStatuses(Object.fromEntries(students.data.data.map((student) => [student.id, saved.get(student.id)?.status ?? "present"])));
    setRemarks(Object.fromEntries(students.data.data.map((student) => [student.id, saved.get(student.id)?.remarks ?? ""])));
  }, [students.data, existing.data, existing.isLoading]);

  const filteredStudents = useMemo(() => (students.data?.data ?? []).filter((student) =>
    `${student.profiles?.full_name ?? ""} ${student.application_id}`.toLowerCase().includes(search.toLowerCase()),
  ), [students.data, search]);
  const visibleReport = useMemo(() => (report.data ?? []).filter((record) =>
    !batchId || record.batch_id === batchId
  ), [report.data, batchId]);

  const save = useMutation({
    mutationFn: () => saveAttendance((students.data?.data ?? []).map((student) => ({
      student_id: student.id,
      batch_id: batchId,
      attendance_date: date,
      status: statuses[student.id] ?? "present",
      marked_by: user!.id,
      remarks: remarks[student.id] || null,
    }))),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["attendance-records", batchId, date] });
      client.invalidateQueries({ queryKey: ["attendance-report"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Attendance saved");
    },
    onError: (error) => toast.error(error.message),
  });

  if (!canMark) return <StudentAttendance />;
  return <>
    <PageHeader
      title="Attendance"
      description="Record attendance, update saved records, and export reports."
      actions={<>
        <Button variant="secondary" onClick={() => setView(view === "mark" ? "report" : "mark")}>{view === "mark" ? "View reports" : "Mark attendance"}</Button>
        {view === "mark" && <Button onClick={() => save.mutate()} disabled={!students.data?.data.length || save.isPending}><Save /> Save attendance</Button>}
      </>}
    />
    <section className="panel attendance-controls">
      <div className="class-picker">
        <label>Batch<select value={batchId} onChange={(event) => setBatchId(event.target.value)}>{batches.data?.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
        {view === "mark" && <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>}
        {view === "mark" && <label className="standalone-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student" /></label>}
        {view === "report" && <Button variant="secondary" onClick={() => downloadCsv("attendance-report.csv", [
          ["Date", "Student", "Application ID", "Batch", "Status", "Remarks"],
          ...visibleReport.map((record: AttendanceReportRow) => [
            record.attendance_date,
            record.students?.profiles?.full_name ?? "",
            record.students?.application_id ?? "",
            record.batches?.name ?? "",
            record.status,
            record.remarks ?? "",
          ]),
        ])}><Download /> Export CSV</Button>}
      </div>
    </section>

    {view === "mark" ? <section className="panel attendance-list">
      {(students.isLoading || existing.isLoading) ? <div className="route-loader"><LoaderCircle className="spin" /></div> : filteredStudents.length ? filteredStudents.map((student) =>
        <div className="attendance-student attendance-student--detailed" key={student.id}>
          <div className="student-cell"><div className="avatar">{student.profiles?.full_name.slice(0, 2).toUpperCase()}</div><div><strong>{student.profiles?.full_name}</strong><small>{student.application_id}</small></div></div>
          <div className="status-toggle">{(["present", "absent", "late", "leave"] as const).map((attendanceStatus) =>
            <button type="button" key={attendanceStatus} className={`${attendanceStatus} ${statuses[student.id] === attendanceStatus ? "active" : ""}`} onClick={() => setStatuses({ ...statuses, [student.id]: attendanceStatus })}>{attendanceStatus}</button>
          )}</div>
          <input className="attendance-remarks" value={remarks[student.id] ?? ""} onChange={(event) => setRemarks({ ...remarks, [student.id]: event.target.value })} placeholder="Optional remarks" />
        </div>
      ) : <div className="empty-state"><h3>No students found</h3><p>Add students to this batch or change your search.</p></div>}
    </section> : <AttendanceReport records={visibleReport} loading={report.isLoading} />}
  </>;
}

function AttendanceReport({ records, loading }: { records: AttendanceReportRow[]; loading: boolean }) {
  const totals = records.reduce<Record<AttendanceStatus, number>>((summary, record) => {
    summary[record.status as AttendanceStatus] += 1;
    return summary;
  }, { present: 0, absent: 0, late: 0, leave: 0 });
  return <>
    <section className="attendance-report-stats">
      {(["present", "absent", "late", "leave"] as const).map((status) => <article className="panel" key={status}><span>{status}</span><strong>{totals[status]}</strong></article>)}
    </section>
    <section className="panel production-table">
      {loading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : records.length ? records.map((record) =>
        <div className="report-row report-row--full" key={record.id}>
          <span>{record.attendance_date}</span>
          <span>{record.students?.profiles?.full_name ?? "Student"}<small>{record.students?.application_id}</small></span>
          <span>{record.batches?.name}</span>
          <span className={`badge badge--${record.status}`}>{record.status}</span>
          <span>{record.remarks || "-"}</span>
        </div>
      ) : <div className="empty-state"><h3>No attendance records</h3><p>Saved attendance will appear in this report.</p></div>}
    </section>
  </>;
}

function StudentAttendance() {
  const user = useAuthStore((state) => state.user);
  const report = useQuery({
    queryKey: ["my-attendance", user?.id],
    queryFn: async () => {
      const { data: student, error } = await supabase.from("students").select("id").eq("profile_id", user!.id).single();
      if (error) throw error;
      return getAttendanceReport(student.id);
    },
  });
  const attendanceRecords = (report.data ?? []) as AttendanceReportRow[];
  const totals = attendanceRecords.reduce<Record<AttendanceStatus, number>>((summary, record) => {
    summary[record.status as AttendanceStatus] += 1;
    return summary;
  }, { present: 0, absent: 0, late: 0, leave: 0 });
  const total = Object.values(totals).reduce((sum, count) => sum + count, 0);
  const percentage = total ? Math.round((totals.present / total) * 100) : 0;
  return <>
    <PageHeader title="My attendance" description="Your complete attendance history." actions={<Button variant="secondary" onClick={() => downloadCsv("my-attendance.csv", [
      ["Date", "Batch", "Status", "Remarks"],
      ...attendanceRecords.map((record) => [record.attendance_date, record.batches?.name ?? "", record.status, record.remarks ?? ""]),
    ])}><Download /> Export CSV</Button>} />
    <section className="attendance-report-stats"><article className="panel"><span>Attendance rate</span><strong>{percentage}%</strong></article>{(["present", "absent", "late"] as const).map((status) => <article className="panel" key={status}><span>{status}</span><strong>{totals[status]}</strong></article>)}</section>
    <section className="panel production-table">{report.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : attendanceRecords.map((item) => <div className="report-row report-row--student" key={item.id}><span>{item.attendance_date}</span><span>{item.batches?.name}</span><span className={`badge badge--${item.status}`}>{item.status}</span><span>{item.remarks || "-"}</span></div>)}</section>
  </>;
}


