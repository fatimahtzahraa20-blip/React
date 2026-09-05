import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return <main className="not-found"><div className="brand__mark"><span>N</span></div><strong>404</strong><h1>Page not found</h1><p>The page you’re looking for doesn’t exist or has moved.</p><Link to="/"><Button>Back to dashboard</Button></Link></main>;
}
