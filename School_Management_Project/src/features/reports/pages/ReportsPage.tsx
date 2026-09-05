import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { getBatches } from "@/features/shared/api/catalog.api";
import { getInstituteReport } from "@/features/reports/api/reports.api";

function csv(name: string, rows: (string | number)[][]) {
  const content = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [batchId, setBatchId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const batches = useQuery({ queryKey: ["batches"], queryFn: getBatches });
  const report = useQuery({
    queryKey: ["institute-report", batchId, dateFrom, dateTo],
    queryFn: () => getInstituteReport({ batchId: batchId || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
  });
  const attendance = report.data?.attendance ?? [];
  const summary = ["present", "absent", "late", "leave"].map((status) => ({
    status: status[0].toUpperCase() + status.slice(1),
    total: attendance.filter((row) => row.status === status).length,
  }));
  const totalSubmissions = (report.data?.assignments ?? []).reduce((sum, assignment) => sum + (assignment.assignment_submissions?.[0]?.count ?? 0), 0);
  return <>
    <PageHeader title="Reports" description="Filter, review, visualize, and export institute performance data." actions={<Button variant="secondary" onClick={() => csv("institute-report.csv", [
      ["Type", "Name", "Detail", "Value"],
      ...summary.map((item) => ["Attendance", item.status, batchId ? "Selected batch" : "All batches", item.total]),
      ["Students", "Enrolled", batchId ? "Selected batch" : "All batches", report.data?.students.length ?? 0],
      ["Assignments", "Created", batchId ? "Selected batch" : "All batches", report.data?.assignments.length ?? 0],
      ["Submissions", "Received", batchId ? "Selected batch" : "All batches", totalSubmissions],
    ])}><Download /> Export summary</Button>} />
    <section className="panel report-filters">
      <label>Batch<select value={batchId} onChange={(event) => setBatchId(event.target.value)}><option value="">All batches</option>{batches.data?.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</select></label>
      <label>From<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
      <label>To<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
    </section>
    {report.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : report.error ? <div className="panel empty-state"><h3>Could not load reports</h3><p>{report.error.message}</p></div> : <>
      <section className="report-stat-grid">
        <article className="panel"><span>Students</span><strong>{report.data?.students.length ?? 0}</strong></article>
        <article className="panel"><span>Assignments</span><strong>{report.data?.assignments.length ?? 0}</strong></article>
        <article className="panel"><span>Submissions</span><strong>{totalSubmissions}</strong></article>
        <article className="panel"><span>Attendance records</span><strong>{attendance.length}</strong></article>
      </section>
      <section className="reports-grid">
        <article className="panel report-chart"><header><BarChart3 /><div><h2>Attendance distribution</h2><p>Statuses for the selected period</p></div></header><div>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={summary}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#26745a" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </div></article>
        <article className="panel report-breakdown"><h2>Assignment performance</h2><p>{totalSubmissions} submissions received across {report.data?.assignments.length ?? 0} assignments.</p>
          {(report.data?.assignments ?? []).slice(0, 8).map((assignment) => <div key={assignment.id}><span><strong>{assignment.title}</strong><small>{(assignment.batches as unknown as { name: string } | null)?.name}</small></span><b>{assignment.assignment_submissions?.[0]?.count ?? 0}</b></div>)}
          {!report.data?.assignments.length && <div className="empty-state"><p>No assignment data for this filter.</p></div>}
        </article>
      </section>
    </>}
  </>;
}
