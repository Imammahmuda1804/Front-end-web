'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAxiosError } from 'axios';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await api.post('/api/auth/login', data);
      
      const { user, access_token, refresh_token } = response.data.data;
      
      setAuth(user, access_token, refresh_token);
      
      toast.success('Login berhasil! Selamat datang.');
      
      setTimeout(() => {
        router.push(callbackUrl);
      }, 500);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Gagal login. Periksa email dan password Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-white flex-row-reverse relative overflow-hidden">

      {/* Kanan: Form Section */}
      <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 pb-16">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center">
            <p className="text-slate-600 font-bold mb-2 text-lg">Selamat Datang di</p>
            <div className="flex flex-col items-center justify-center mb-4">
              <Image src="/images/logo-icon.png" alt="RanahInsight Logo" width={64} height={64} className="object-contain mb-2" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                RANAH<span className="text-primary">INSIGHT</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed">
              Temukan dan jelajahi wisata terbaik Sumatera Barat dengan AI & Data Insight
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
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
                  autoFocus
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-red-500 ml-2">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
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
                  autoComplete="current-password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span className="text-sm font-semibold text-slate-600">Ingat saya</span>
              </label>
              {/* Link disabled until /forgot-password is implemented */}
              <span className="text-sm font-bold text-slate-400 cursor-not-allowed">Lupa password?</span>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button 
                className="btn-joy" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'MEMPROSES...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <p className="text-slate-500 text-center font-semibold mt-8">
            Belum punya akun? 
            <Link className="text-primary font-bold hover:underline ml-1" href="/register">Daftar sekarang</Link>
          </p>
        </div>
      </section>

      {/* Kiri: Image Section */}
      <section className="hidden lg:block lg:w-1/2 relative z-10 pb-16">
        <div className="w-full h-full relative rounded-br-[100px] overflow-hidden shadow-2xl">
          <Image
            className="object-cover"
            alt="Ilustrasi Wisata Sumatera Barat"
            src="/images/auth-bg.jpg"
            fill
            sizes="50vw"
            priority
          />
          
          {/* Overlay Logo */}
          <div className="absolute top-10 left-10 z-20 flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-200 shadow-lg">
            <Image src="/images/logo-icon.png" alt="RanahInsight" width={40} height={40} className="object-contain drop-shadow-sm" />
            <span className="text-slate-900 font-black tracking-tight text-xl">RANAHINSIGHT</span>
          </div>

          {/* AI Info Cards */}
          <div className="absolute bottom-24 left-10 z-20 bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Contoh Sentimen</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent flex items-center justify-center bg-white shadow-sm">
                 <span className="text-primary font-bold text-sm">85%</span>
              </div>
              <p className="text-slate-700 font-medium text-sm max-w-25 leading-tight">Wisatawan sangat puas</p>
            </div>
          </div>
          
          <div className="absolute top-1/3 right-10 z-20 bg-white border border-slate-200 p-5 rounded-2xl shadow-xl text-right">
             <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Contoh Topik</p>
             <p className="text-slate-900 font-black text-xl mb-1">Alam & Budaya</p>
             <p className="text-slate-600 font-medium text-sm">Rekomendasi AI teratas</p>
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 via-primary/10 to-transparent pointer-events-none z-10"></div>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
