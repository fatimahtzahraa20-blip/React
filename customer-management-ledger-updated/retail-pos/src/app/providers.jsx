import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";

export default function Providers({ children }) {
  useAuth();
  useTheme();
  return children;
}
