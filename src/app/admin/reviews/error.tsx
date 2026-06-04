"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[420px] items-center justify-center">
            <div className="max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                    Halaman review gagal dimuat
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Coba muat ulang halaman. Jika masih gagal, cek sesi admin atau koneksi API.
                </p>
                <Button className="mt-5 rounded-full" onClick={unstable_retry}>
                    <RefreshCw className="h-4 w-4" />
                    Muat ulang
                </Button>
            </div>
        </div>
    );
}

