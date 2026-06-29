'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAxiosError } from 'axios';
import { authService } from '@/features/auth/services/auth.service';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface ApiErrorResponse {
  message?: string | string[];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const payload = data;

      await authService.register(payload);

      toast.success('Pendaftaran berhasil! Silakan login untuk memulai.');
      router.push('/login');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Gagal mendaftar. Silakan coba lagi.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-white relative overflow-hidden">

      
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 pb-16">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center">
            <p className="text-slate-600 font-bold mb-2 text-lg">Bergabung dengan</p>
            <div className="flex flex-col items-center justify-center mb-4">
              <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={64} height={64} className="object-contain mb-2" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                RANAH<span className="text-primary">INSIGHT</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">
              Buat akun untuk mulai menjelajahi dan merencanakan wisata Sumatera Barat
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-2">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  className="input-minimal pl-11" 
                  placeholder="Masukkan nama lengkap" 
                  type="text"
                  autoFocus
                  autoComplete="name"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-red-500 ml-2">{errors.name.message}</p>
              )}
            </div>

            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  className="input-minimal pl-11" 
                  placeholder="Masukkan email Anda" 
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-red-500 ml-2">{errors.email.message}</p>
              )}
            </div>

            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  className="input-minimal pl-11 pr-12" 
                  placeholder="Masukkan password Anda" 
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-red-500 ml-2">{errors.password.message}</p>
              )}
            </div>

            
            <div className="pt-4">
              <button 
                className="btn-joy" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'MEMPROSES...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>

          
          <p className="text-slate-500 text-center font-semibold mt-8">
            Sudah punya akun? 
            <Link className="text-primary font-bold hover:underline ml-1" href="/login">Masuk di sini</Link>
          </p>
        </div>
      </section>

      
      <section className="hidden lg:block lg:w-1/2 relative z-10 pb-16 bg-slate-100">
        <div className="w-full h-full relative rounded-bl-[100px] overflow-hidden shadow-sm">
          <Image
            className="object-cover"
            alt="Ilustrasi Wisata Sumatera Barat"
            src="/images/auth-bg.jpg"
            fill
            sizes="50vw"
            priority
          />

          <div className="absolute top-10 right-10 z-20 flex items-center gap-3 px-6 py-3">
            <span className="text-white font-black tracking-tight text-xl drop-shadow-md">RanahInsight</span>
          </div>
        </div>
      </section>
    </main>
  );
}
