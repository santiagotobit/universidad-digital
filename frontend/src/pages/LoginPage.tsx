import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { useAuth } from "../hooks/useAuth";
import { sanitizeText } from "../utils/sanitize";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  const onSubmit = async (values: LoginForm) => {
    const email = sanitizeText(values.email);
    const password = sanitizeText(values.password);
    await login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <h1>Iniciar sesión</h1>
      {error ? <Alert message={error} /> : null}
      <form onSubmit={handleSubmit(onSubmit)} className="grid" data-testid="login-form">
        <Input
          label="Correo electrónico"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isSubmitting || !isValid}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
