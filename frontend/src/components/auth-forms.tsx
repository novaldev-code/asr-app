"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordReset,
  resendVerificationEmail,
  resetPasswordWithToken,
  verifyEmailWithToken,
} from "@/lib/api/auth";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type LoginValues,
  type RegisterValues,
  type ResetPasswordValues,
} from "@/lib/validators";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function SuccessNote({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-border bg-graphite/40 p-4 text-bone">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-fog">{description}</p>
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useSessionStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      const user = await login({ email: values.email, password: values.password });
      const skipped = await useCartStore.getState().mergeGuest();
      useCartStore
        .getState()
        .clampToStock(useDataStore.getState().products);
      toast.success(`Selamat datang, ${user.name}.`);
      if (skipped > 0) {
        toast.warning(
          `${skipped} item tidak dapat digabung karena stok tidak mencukupi.`,
        );
      }
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/")
          ? next
          : user.role === "admin"
            ? "/admin"
            : "/account";
      router.push(target);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email atau password salah.";
      toast.error(message);
      if (/verif/i.test(message)) {
        router.push(
          `/verify-email?email=${encodeURIComponent(values.email)}`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(kind: "customer" | "admin") {
    const account = DEMO_ACCOUNTS[kind];
    form.setValue("email", account.email);
    form.setValue("password", "Password123!");
  }

  return (
    <Card className="border-border/60 bg-carbon">
      <CardHeader>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Masuk ke akun Anda</CardTitle>
        <CardDescription>
          Masuk dengan email dan password akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {searchParams.get("verified") === "1" ? (
          <SuccessNote
            title="Email terverifikasi"
            description="Akun Anda sudah aktif. Silakan masuk."
          />
        ) : null}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-fog transition-colors hover:text-bone hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              {...form.register("password")}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
            Masuk <ArrowRight />
          </Button>
        </form>

        <div className="rounded-[10px] border border-border/60 bg-background/40 p-4">
          <p className="text-[11px] font-medium tracking-[0.16em] text-ash uppercase">Akun demo</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => fillDemo("customer")}
            >
              <UserRound /> Pelanggan
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 rounded-full"
              onClick={() => fillDemo("admin")}
            >
              <LockKeyhole /> Admin
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-fog">
        Belum punya akun?{" "}
        <Link href="/register" className="ml-1 font-medium text-bone hover:underline">
          Daftar sekarang
        </Link>
      </CardFooter>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const register = useSessionStore((state) => state.register);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setSubmitting(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Akun berhasil dibuat. Silakan verifikasi email Anda.");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Pendaftaran gagal. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60 bg-carbon">
      <CardHeader>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Buat akun baru</CardTitle>
        <CardDescription>
          Simpan alamat, pantau pesanan, dan checkout lebih cepat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="register-name">Nama lengkap</Label>
            <Input id="register-name" placeholder="Nama Anda" {...form.register("name")} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              {...form.register("password")}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-confirm">Konfirmasi password</Label>
            <Input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password"
              {...form.register("confirmPassword")}
            />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
            Daftar <ArrowRight />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-fog">
        Sudah punya akun?{" "}
        <Link href="/login" className="ml-1 font-medium text-bone hover:underline">
          Masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengirim tautan reset password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60 bg-carbon">
      <CardHeader>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Lupa password</CardTitle>
        <CardDescription>
          Masukkan email akun Anda. Kami akan mengirim tautan reset password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <SuccessNote
            title="Tautan reset terkirim"
            description="Jika email terdaftar, tautan reset telah dikirim. Di mode pengembangan, tautan tercetak di konsol server."
          />
        ) : null}
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="nama@email.com"
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full"
            disabled={submitting}
          >
            <Mail /> Kirim tautan reset
          </Button>
        </form>
        {sent ? (
          <Button
            variant="outline"
            className="w-full rounded-full"
            render={<Link href="/reset-password" />}
          >
            Sudah punya token? Reset password
          </Button>
        ) : null}
      </CardContent>
      <CardFooter className="justify-center text-sm text-fog">
        Ingat password Anda?{" "}
        <Link href="/login" className="ml-1 font-medium text-bone hover:underline">
          Kembali masuk
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const queryToken = searchParams.get("token") ?? "";
  const [manualToken, setManualToken] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    const token = queryToken || manualToken.trim();
    if (!token) {
      toast.error("Token reset wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordWithToken(token, values.password);
      setDone(true);
      toast.success("Password berhasil direset.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Token reset tidak valid atau kedaluwarsa.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-border/60 bg-carbon">
      <CardHeader>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Reset password</CardTitle>
        <CardDescription>Buat password baru untuk akun Anda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {done ? (
          <SuccessNote
            title="Password diperbarui"
            description="Password akun Anda telah diubah. Silakan masuk kembali."
          />
        ) : null}
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {queryToken ? null : (
            <div className="space-y-1.5">
              <Label htmlFor="reset-token">Token reset</Label>
              <Input
                id="reset-token"
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="Tempel token dari email"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">Password baru</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              {...form.register("password")}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm">Konfirmasi password</Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi password"
              {...form.register("confirmPassword")}
            />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full"
            disabled={submitting || done}
          >
            Simpan password
          </Button>
        </form>
        <Button
          variant="ghost"
          className="w-full rounded-full"
          render={<Link href="/login" />}
        >
          Kembali ke halaman masuk
        </Button>
      </CardContent>
    </Card>
  );
}

export function VerifyEmailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const alreadyVerified = searchParams.get("verified") === "1";
  const attempted = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    void (async () => {
      try {
        await verifyEmailWithToken(token);
        setVerified(true);
        toast.success("Email berhasil diverifikasi. Silakan masuk.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Tautan verifikasi tidak valid atau kedaluwarsa.",
        );
      }
    })();
  }, [token]);

  async function handleResend() {
    if (!email) {
      toast.error("Email tidak diketahui. Silakan daftar ulang.");
      return;
    }
    setSubmitting(true);
    try {
      await resendVerificationEmail(email);
      toast.success("Email verifikasi dikirim ulang.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengirim ulang email verifikasi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleAlreadyVerified() {
    router.push("/login");
  }

  return (
    <Card className="border-border/60 bg-carbon">
      <CardHeader>
        <CardTitle className="font-serif text-3xl tracking-[-0.03em]">Verifikasi email</CardTitle>
        <CardDescription>
          {email
            ? `Kami telah mengirim tautan verifikasi ke ${email}.`
            : "Kami telah mengirim tautan verifikasi ke email Anda."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verified || alreadyVerified ? (
          <SuccessNote
            title="Email terverifikasi"
            description="Akun Anda sudah aktif. Silakan masuk untuk melanjutkan."
          />
        ) : null}
        <div className="flex items-center gap-3 rounded-[10px] border border-border/60 bg-background/40 p-4">
          <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background">
            <Mail className="size-5 text-bone" />
          </span>
          <div className="text-sm">
            <p className="font-medium">Cek kotak masuk Anda</p>
            <p className="text-xs text-ash">
              Di mode pengembangan, tautan verifikasi tercetak di konsol server.
            </p>
          </div>
        </div>
        <Button
          className="w-full rounded-full"
          disabled={submitting}
          onClick={handleResend}
        >
          Kirim ulang email
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={handleAlreadyVerified}
        >
          Lanjut ke halaman masuk
        </Button>
      </CardContent>
    </Card>
  );
}
