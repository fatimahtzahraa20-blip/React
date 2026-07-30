import AuthLayout from "@/layouts/AuthLayout";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}