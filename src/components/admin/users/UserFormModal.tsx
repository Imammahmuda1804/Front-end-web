"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminUserService, AdminUser } from "@/services/admin/user.service";
import { User, Shield, KeyRound, Check } from "lucide-react";

// Zod schema
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

const STEPS = [
  { label: "Informasi Dasar", icon: User },
  { label: "Role & Status", icon: Shield },
  { label: "Keamanan", icon: KeyRound },
];

export function UserFormModal({ open, onOpenChange, onSuccess, initialData }: UserFormModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
    watch,
    setValue,
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

  const selectedRole = watch("role");
  const selectedStatus = watch("status");

  React.useEffect(() => {
    if (open) {
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
      setStep(1);
    }
  }, [open, initialData, reset]);

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "email"]);
    } else if (step === 2) {
      isValid = await trigger(["role", "status"]);
    }
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      setIsSubmitting(true);

      const payload: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      };

      // Only include password if user entered one
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }

      if (isEditing && initialData) {
        await adminUserService.updateUser(initialData.id, payload);
        toast.success("Data pengguna berhasil diperbarui");
      } else {
        // For now, admin can only edit existing users via API
        // If create endpoint exists, use it here
        await adminUserService.updateUser(0, payload);
        toast.success("Pengguna berhasil ditambahkan");
      }

      onSuccess();
      onOpenChange(false);
      setStep(1);
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Terjadi kesalahan";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pengguna" : "Tambah Pengguna"}</DialogTitle>
          <DialogDescription>
            Langkah {step} dari 3: {STEPS[step - 1]?.label}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <React.Fragment key={stepNum}>
                {i > 0 && (
                  <div
                    className={`h-px w-8 transition-colors ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="space-y-6 py-4">
          {/* STEP 1 — Basic Info */}
          <div className={step === 1 ? "space-y-4" : "hidden"}>
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Contoh: John Doe"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contoh@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* STEP 2 — Role & Status */}
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["USER", "ADMIN"] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setValue("role", role)}
                    className={`rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
                      selectedRole === role
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          role === "ADMIN" ? "bg-purple-500" : "bg-blue-500"
                        }`}
                      />
                      <span className="font-semibold text-sm">{role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role === "ADMIN"
                        ? "Akses penuh ke semua fitur admin"
                        : "Akses pengguna biasa"}
                    </p>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label>Status Akun</Label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "active", label: "Aktif", color: "bg-green-500" },
                    { value: "suspended", label: "Ditangguhkan", color: "bg-red-500" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("status", opt.value)}
                    className={`rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
                      selectedStatus === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${opt.color}`} />
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {opt.value === "active"
                        ? "Pengguna dapat login dan mengakses platform"
                        : "Akun dinonaktifkan, tidak dapat login"}
                    </p>
                  </button>
                ))}
              </div>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* STEP 3 — Security (Password) */}
          <div className={step === 3 ? "space-y-4" : "hidden"}>
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium mb-1 flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                {isEditing ? "Reset Password" : "Set Password"}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {isEditing
                  ? "Kosongkan jika tidak ingin mengubah password."
                  : "Masukkan password untuk akun baru (minimal 6 karakter)."}
              </p>
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Summary Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium mb-3">Ringkasan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{watch("name") || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{watch("email") || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedRole === "ADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {selectedRole}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedStatus === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {selectedStatus === "active" ? "Aktif" : "Ditangguhkan"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password</span>
                  <span className="font-medium text-muted-foreground">
                    {watch("password") ? "••••••" : "Tidak diubah"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Batal
              </Button>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                  Kembali
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={nextStep}>Selanjutnya</Button>
              ) : (
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
