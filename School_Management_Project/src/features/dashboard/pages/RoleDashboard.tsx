import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Bell, BookOpenCheck, CalendarCheck, CheckCircle2, ClipboardList,
  Clock3, FileCheck2, GraduationCap, Plus, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/Button";
import { getDashboardData, type DashboardActivity } from "@/features/dashboard/api/dashboard.api";
import { useAuthStore } from "@/store/authStore";
import type { AppRole } from "@/types/database.types";

const roleCopy: Record<AppRole, { eyebrow: string; description: string }> = {
  super_admin: { eyebrow: "SUPER ADMIN WORKSPACE", description: "A complete view of your institute's daily operations." },
  admin: { eyebrow: "ADMIN WORKSPACE", description: "A complete view of your institute's daily operations." },
  teacher: { eyebrow: "TEACHER WORKSPACE", description: "Your classes, assignments, and attendance in one place." },
  student: { eyebrow: "STUDENT WORKSPACE", description: "Stay on top of attendance, assignments, and submissions." },
};

function formatRelativeDate(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `${days} days`;
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} late`;
}

function StatCard({
  label, value, note, icon: Icon, tone, href,
}: {
  label: string; value: number; note: string; icon: typeof Users; tone: string; href: string;
}) {
  return (
    <Link to={href} className={`northstar-stat northstar-stat--${tone}`}>
      <div className="northstar-stat__head"><span>{label}</span><Icon /></div>
      <strong>{value.toLocaleString()}</strong>
      <small>{note}</small>
    </Link>
  );
}

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  return (
    <li className="northstar-activity">
      <span><CheckCircle2 /></span>
      <div><strong>{activity.action.replaceAll("_", " ")}</strong><small>{activity.entity_type.replaceAll("_", " ")}</small></div>
      <time>{new Date(activity.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
    </li>
  );
}

export function RoleDashboard() {
  const { profile, roles, user } = useAuthStore();
  const role = (roles[0] ?? "student") as AppRole;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", role, user?.id],
    queryFn: () => getDashboardData(role, user!.id),
    enabled: Boolean(user?.id),
  });

  if (isLoading) {
    return <div className="dashboard-skeleton" aria-label="Loading dashboard"><div /><div /><div /><div /><section /><aside /></div>;
  }
  if (error || !data) {
    return (
      <section className="dashboard-error">
        <ClipboardList /><h1>We couldn't load your workspace</h1>
        <p>{error instanceof Error ? error.message : "Please check your connection and try again."}</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </section>
    );
  }

  const totalAttendance = Object.values(data.attendance).reduce((sum, value) => sum + value, 0);
  const attendanceRate = totalAttendance ? Math.round((data.attendance.present / totalAttendance) * 100) : 0;
  const attendanceChart = [
    { name: "Present", value: data.attendance.present, color: "#26745a" },
    { name: "Late", value: data.attendance.late, color: "#e7a44f" },
    { name: "Absent", value: data.attendance.absent, color: "#df6a62" },
    { name: "Leave", value: data.attendance.leave, color: "#8296bd" },
  ];
  const adminStats = [
    { label: "Total students", value: data.students, note: "Enrolled across all batches", icon: GraduationCap, tone: "mint", href: "/students" },
    { label: "Total teachers", value: data.teachers, note: "Active faculty members", icon: Users, tone: "lavender", href: "/teachers" },
    { label: "Pending assignments", value: data.pendingAssignments, note: "Still awaiting submission", icon: Clock3, tone: "peach", href: "/assignments" },
    { label: "Submitted work", value: data.submissions, note: "Assignments received", icon: FileCheck2, tone: "rose", href: "/assignments" },
  ];
  const teacherStats = [
    { label: "My classes", value: data.classes, note: "Assigned active batches", icon: BookOpenCheck, tone: "mint", href: "/batches" },
    { label: "My students", value: data.students, note: "Across your classes", icon: GraduationCap, tone: "lavender", href: "/students" },
    { label: "Assignments", value: data.assignments, note: "Created by you", icon: ClipboardList, tone: "peach", href: "/assignments" },
    { label: "Submissions", value: data.submissions, note: "Student work received", icon: FileCheck2, tone: "rose", href: "/assignments" },
  ];
  const studentStats = [
    { label: "Attendance", value: attendanceRate, note: "Overall attendance percentage", icon: CalendarCheck, tone: "mint", href: "/attendance" },
    { label: "Assignments", value: data.assignments, note: "Published for your batch", icon: ClipboardList, tone: "lavender", href: "/assignments" },
    { label: "To submit", value: data.pendingAssignments, note: "Assignments remaining", icon: Clock3, tone: "peach", href: "/assignments" },
    { label: "Notifications", value: data.unreadNotifications, note: "Unread updates", icon: Bell, tone: "rose", href: "/notifications" },
  ];
  const stats = role === "student" ? studentStats : role === "teacher" ? teacherStats : adminStats;

  return (
    <div className="northstar-dashboard">
      <header className="dashboard-welcome">
        <div>
          <span>{roleCopy[role].eyebrow}</span>
          <h1>Good day, {profile?.full_name?.split(" ")[0] ?? "there"}.</h1>
          <p>{roleCopy[role].description}</p>
        </div>
        {role !== "student" && <Link to="/assignments" className="button button--primary"><Plus /> Create assignment</Link>}
      </header>

      <section className="northstar-stats">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="northstar-dashboard__grid">
        <article className="panel northstar-attendance">
          <div className="northstar-panel-head">
            <div><h2>Attendance summary</h2><p>{role === "student" ? "Your complete attendance record" : "Today's recorded attendance"}</p></div>
            <Link to="/attendance">View report <ArrowRight /></Link>
          </div>
          <div className="northstar-attendance__body">
            <div className="attendance-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceChart} dataKey="value" innerRadius={60} outerRadius={78} paddingAngle={3} stroke="none">
                    {attendanceChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div><strong>{attendanceRate}%</strong><span>Present</span></div>
            </div>
            <div className="attendance-legend">
              {attendanceChart.map((item) => (
                <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{item.value}</strong></div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel northstar-activity-panel">
          <div className="northstar-panel-head">
            <div><h2>{data.recentActivity.length ? "Recent activity" : "Quick access"}</h2><p>Your latest workspace updates</p></div>
          </div>
          {data.recentActivity.length ? (
            <ul>{data.recentActivity.map((activity) => <ActivityItem activity={activity} key={activity.id} />)}</ul>
          ) : (
            <div className="quick-access-grid">
              <Link to="/assignments"><ClipboardList /><span>Assignments</span><ArrowRight /></Link>
              <Link to="/attendance"><CalendarCheck /><span>Attendance</span><ArrowRight /></Link>
              <Link to="/notifications"><Bell /><span>Notifications</span><ArrowRight /></Link>
            </div>
          )}
        </article>
      </section>

      <article className="panel northstar-assignments">
        <div className="northstar-panel-head">
          <div><h2>{role === "student" ? "Upcoming assignments" : "Recent assignments"}</h2><p>Deadlines and submission progress at a glance</p></div>
          <Link to="/assignments">View all <ArrowRight /></Link>
        </div>
        {data.recentAssignments.length ? (
          <div className="northstar-assignment-list">
            <div className="northstar-assignment-row northstar-assignment-row--head">
              <span>Assignment</span><span>Class</span><span>Due</span><span>Submissions</span><span>Status</span>
            </div>
            {data.recentAssignments.map((assignment) => {
              const dueLabel = formatRelativeDate(assignment.due_at);
              return (
                <Link className="northstar-assignment-row" to="/assignments" key={assignment.id}>
                  <div><span className="assignment-file-icon"><ClipboardList /></span><span><strong>{assignment.title}</strong><small>{assignment.courses?.name ?? "General"}</small></span></div>
                  <span>{assignment.batches?.name ?? "—"}</span>
                  <span className={dueLabel.includes("late") ? "text-danger" : ""}>{dueLabel}</span>
                  <span>{assignment.assignment_submissions?.[0]?.count ?? 0}</span>
                  <span className={`badge badge--${assignment.status}`}>{assignment.status}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="northstar-empty"><ClipboardList /><h3>No assignments yet</h3><p>Assignments will appear here when they are published.</p></div>
        )}
      </article>
    </div>
  );
}
