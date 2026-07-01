"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, KeyRound, Shield, User } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminUserService, AdminUser } from "../../services/user.service";

const userFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["active", "suspended"]),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: AdminUser | null;
}

const steps = [
  { label: "Profil", icon: User },
  { label: "Akses", icon: Shield },
  { label: "Keamanan", icon: KeyRound },
];

export function UserFormModal({ open, onOpenChange, onSuccess, initialData }: UserFormModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    setValue,
    control,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "USER",
      status: "active",
      password: "",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });
  const selectedStatus = useWatch({ control, name: "status" });
  const watchedName = useWatch({ control, name: "name" });
  const watchedEmail = useWatch({ control, name: "email" });
  const watchedPassword = useWatch({ control, name: "password" });

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status as "active" | "suspended",
        password: "",
      });
    } else {
      reset({
        name: "",
        email: "",
        role: "USER",
        status: "active",
        password: "",
      });
    }
  }, [initialData, open, reset]);

  const nextStep = async () => {
    const fieldsToValidate =
      step === 1 ? (["name", "email"] as const) : step === 2 ? (["role", "status"] as const) : [];
    const valid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));
    if (valid) setStep((current) => Math.min(3, current + 1));
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);
      const payload: {
        name: string;
        email: string;
        role: "ADMIN" | "USER";
        status: "active" | "suspended";
        password?: string;
      } = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (isEditing && initialData) {
        await adminUserService.updateUser(initialData.id, payload);
        toast.success("Data pengguna berhasil diperbarui");
      } else {
        await adminUserService.createUser(payload);
        toast.success("Pengguna berhasil ditambahkan");
      }

      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan pengguna";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setStep(1);
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui profil, role, status, atau password pengguna."
              : "Buat akun baru dengan role dan status akses yang sesuai."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-explore/20 bg-explore-container p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((item, index) => {
              const stepNumber = index + 1;
              const Icon = item.icon;
              const active = step === stepNumber;
              const completed = step > stepNumber;
              return (
                <div
                  key={item.label}
                  className={`rounded-xl border p-3 transition ${
                    active
                      ? "border-amber-500 bg-white shadow-sm"
                      : "border-white/80 bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                        active || completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-emerald-100 bg-emerald-100 text-emerald-500"
                      }`}
                    >
                      {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-500">
                        Langkah {stepNumber}
                      </p>
                      <p className="text-sm font-extrabold text-slate-950">{item.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 py-2">
          {step === 1 && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama lengkap</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                  placeholder="Contoh: Siti Rahma"
                />
                {errors.name && <p className="text-sm font-medium text-rose-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                  placeholder="nama@email.com"
                />
                {errors.email && <p className="text-sm font-medium text-rose-600">{errors.email.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <FieldGroup title="Role" description="Pilih level akses yang dibutuhkan pengguna.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    selected={selectedRole === "USER"}
                    title="User"
                    description="Akses fitur publik seperti eksplorasi, favorit, dan ulasan."
                    tone="blue"
                    onClick={() => setValue("role", "USER")}
                  />
                  <ChoiceCard
                    selected={selectedRole === "ADMIN"}
                    title="Admin"
                    description="Akses penuh ke dashboard operasional dan data platform."
                    tone="amber"
                    onClick={() => setValue("role", "ADMIN")}
                  />
                </div>
              </FieldGroup>

              <FieldGroup title="Status akun" description="Atur apakah akun dapat login ke platform.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceCard
                    selected={selectedStatus === "active"}
                    title="Aktif"
                    description="Pengguna bisa login dan memakai fitur platform."
                    tone="emerald"
                    onClick={() => setValue("status", "active")}
                  />
                  <ChoiceCard
                    selected={selectedStatus === "suspended"}
                    title="Ditangguhkan"
                    description="Akun dinonaktifkan sementara dari akses platform."
                    tone="rose"
                    onClick={() => setValue("status", "suspended")}
                  />
                </div>
              </FieldGroup>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-explore">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950">
                      {isEditing ? "Reset password" : "Set password"}
                    </h4>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      {isEditing
                        ? "Kosongkan field ini jika password tidak perlu diubah."
                        : "Password wajib minimal 6 karakter untuk akun baru."}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password baru</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500"
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.password && (
                    <p className="text-sm font-medium text-rose-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-explore">
                  Ringkasan
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <SummaryRow label="Nama" value={watchedName || "-"} />
                  <SummaryRow label="Email" value={watchedEmail || "-"} />
                  <SummaryRow label="Role" value={selectedRole === "ADMIN" ? "Admin" : "User"} />
                  <SummaryRow
                    label="Status"
                    value={selectedStatus === "active" ? "Aktif" : "Ditangguhkan"}
                  />
                  <SummaryRow label="Password" value={watchedPassword ? "Diubah" : "Tidak diubah"} />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                className="rounded-full bg-amber-500 text-white hover:bg-amber-600"
                onClick={nextStep}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-full bg-amber-500 text-white hover:bg-amber-600"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-black text-slate-950">{title}</h4>
      <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  tone,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  tone: "amber" | "blue" | "emerald" | "rose";
  onClick: () => void;
}) {
  const dotColor = {
    amber: "bg-amber-500 border-amber-500",
    blue: "bg-blue-500 border-blue-500",
    emerald: "bg-emerald-500 border-emerald-500",
    rose: "bg-rose-500 border-rose-500",
  }[tone];

  const borderColor = "border-emerald-500 bg-emerald-50";

  const ringColor = "focus:ring-emerald-500/30";

  const textColor = {
    amber: "text-emerald-600",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[7rem] rounded-xl border p-4 text-left transition focus:outline-none ${ringColor} ${
        selected ? borderColor : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${dotColor}`} />
          <span className={`font-black ${textColor}`}>{title}</span>
        </div>
        {selected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{description}</p>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[9rem] truncate text-right font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

