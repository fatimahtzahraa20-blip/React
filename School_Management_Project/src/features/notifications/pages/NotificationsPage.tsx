import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, LoaderCircle, Plus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import {
  getNotificationRecipients, getNotifications, markAllNotificationsRead, markNotificationRead, sendNotification,
} from "@/features/notifications/api/notifications.api";

export function NotificationsPage() {
  const roles = useAuthStore((state) => state.roles);
  const canSend = roles.some((role) => ["super_admin", "admin", "teacher"].includes(role));
  const client = useQueryClient();
  const navigate = useNavigate();
  const [compose, setCompose] = useState(false);
  const query = useQuery({ queryKey: ["notifications"], queryFn: getNotifications });
  const recipients = useQuery({ queryKey: ["notification-recipients"], queryFn: getNotificationRecipients, enabled: compose });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (error) => toast.error(error.message),
  });
  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const send = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => { setCompose(false); toast.success("Notification sent"); },
    onError: (error) => toast.error(error.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const audience = String(form.get("audience"));
    const selected = form.getAll("recipients").map(String);
    const recipientIds = audience === "selected" ? selected : (recipients.data ?? []).filter((profile) => {
      if (audience === "all") return true;
      return profile.profile_roles.some((profileRole) => (profileRole.roles as unknown as { name: string } | null)?.name === audience);
    }).map((profile) => profile.id);
    send.mutate({ recipientIds, title: String(form.get("title")), message: String(form.get("message")), link: String(form.get("link") ?? "") });
  }
  return <>
    <PageHeader title="Notifications" description="Important institute, attendance, and assignment updates." actions={<>
      <Button variant="secondary" onClick={() => readAll.mutate()} disabled={readAll.isPending}><CheckCheck /> Mark all read</Button>
      {canSend && <Button onClick={() => setCompose(true)}><Plus /> Send notification</Button>}
    </>} />
    <section className="panel notifications-list">
      {query.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : query.error ? <div className="empty-state"><h3>Could not load notifications</h3><p>{query.error.message}</p></div> : query.data?.map((item) =>
        <article className={item.read_at ? "" : "unread"} key={item.id} role={item.link ? "button" : undefined} tabIndex={item.link ? 0 : undefined} onClick={() => {
          if (!item.read_at) readOne.mutate(item.id);
          if (item.link) navigate(item.link);
        }}>
          <div><Bell /></div><span><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.created_at).toLocaleString()}</small></span>
        </article>
      )}
    </section>
    {!query.isLoading && !query.data?.length && <div className="panel empty-state"><Bell /><h3>You're all caught up</h3><p>New notifications will appear here.</p></div>}
    <Modal open={compose} onClose={() => setCompose(false)} title="Send notification" description="Send an update to users by role or individual selection.">
      <form className="form" onSubmit={submit}>
        <label>Audience<select name="audience" defaultValue="all"><option value="all">All active users</option><option value="student">All students</option><option value="teacher">All teachers</option><option value="admin">All admins</option><option value="selected">Selected users</option></select></label>
        <label>Selected users<select name="recipients" multiple size={5}>{recipients.data?.map((profile) => <option value={profile.id} key={profile.id}>{profile.full_name} | {profile.email}</option>)}</select></label>
        <label className="form__wide">Title<input name="title" required maxLength={120} /></label>
        <label className="form__wide">Message<textarea name="message" rows={4} required maxLength={1000} /></label>
        <label className="form__wide">Internal link<input name="link" placeholder="/assignments" /></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setCompose(false)}>Cancel</Button><Button disabled={send.isPending}><Send /> Send</Button></div>
      </form>
    </Modal>
  </>;
}


