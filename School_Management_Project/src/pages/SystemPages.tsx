import { AlertTriangle, DatabaseZap, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function UnauthorizedPage(){return <main className="system-page"><ShieldX/><h1>Access denied</h1><p>Your account does not have permission to open this page.</p><Link to="/"><Button>Return to dashboard</Button></Link></main>;}
export function SetupRequiredPage(){return <main className="system-page"><DatabaseZap/><h1>Connect Supabase</h1><p>Add a valid Supabase URL and anonymous key to your <code>.env</code> file, then restart the development server.</p><pre>VITE_SUPABASE_URL=https://your-project.supabase.co{"\n"}VITE_SUPABASE_ANON_KEY=your-anon-key{"\n"}VITE_APP_URL=http://localhost:5173</pre><a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"><Button>Open Supabase dashboard</Button></a></main>;}
export function ServerErrorPage(){return <main className="system-page"><AlertTriangle/><h1>Something went wrong</h1><p>Refresh the page or contact your institute administrator if the problem continues.</p><Button onClick={()=>location.reload()}>Try again</Button></main>;}
