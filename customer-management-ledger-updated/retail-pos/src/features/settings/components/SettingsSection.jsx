import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsSection({ title, description, children }) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="grid gap-4 pt-1 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}
