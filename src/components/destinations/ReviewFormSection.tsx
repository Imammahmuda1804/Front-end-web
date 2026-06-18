'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle, LogIn } from 'lucide-react';
import Link from 'next/link';

import { api } from '@/lib/axios';

interface Props {
  destinationId: number;
  isAuthenticated: boolean;
  onSuccess?: () => void;
}

function getSubmitErrorMessage(error: unknown) {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
    && typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return 'Gagal mengirim ulasan. Coba lagi.';
}

export default function ReviewFormSection({ destinationId, isAuthenticated, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Pilih rating terlebih dahulu');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/api/user-reviews', {
        destination_id: destinationId,
        rating,
        review_text: reviewText.trim() || undefined,
      });
      setSubmitted(true);
      setRating(0);
      setReviewText('');
      onSuccess?.();
      // Sembunyikan pesan sukses otomatis.
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      setError(getSubmitErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-10 rounded-lg border border-orange-100 bg-orange-50/60 p-8 text-center">
        <LogIn className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h4 className="mb-2 text-lg font-black text-slate-900">Bagikan Pengalaman Anda</h4>
        <p className="mb-5 text-sm font-semibold text-slate-500">Login untuk memberikan ulasan dan rating destinasi ini.</p>
        <Link
          href="/login"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          <LogIn className="h-4 w-4" />
          Login untuk Mengulas
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        className="mt-10 rounded-lg border border-emerald-100 bg-emerald-50 p-8 text-center"
      >
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-500" />
        <h4 className="mb-1 text-lg font-black text-emerald-800">Ulasan terkirim</h4>
        <p className="text-sm font-semibold text-emerald-600">Terima kasih telah berbagi pengalaman Anda.</p>
      </motion.div>
    );
  }

  return (
    <div className="mt-10 rounded-lg border border-orange-100 bg-slate-50/80 p-6 sm:p-8">
      <h4 className="mb-1 text-lg font-black text-slate-900">Tulis ulasan</h4>
      <p className="mb-5 text-sm font-semibold text-slate-500">Bagikan pengalaman Anda mengunjungi destinasi ini.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600">Rating</label>
          <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Pilih rating destinasi">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Beri rating ${star} dari 5`}
                aria-checked={rating === star}
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                <Star
                  className={`h-8 w-8 transition-colors duration-150 ${
                    star <= (hoveredRating || rating)
                      ? 'text-orange-400 fill-orange-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center text-sm font-black text-slate-600">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="review-text" className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600">
            Ulasan (opsional)
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            placeholder="Ceritakan pengalaman Anda..."
            className="w-full resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-[background-color,transform] duration-150 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Kirim Ulasan
            </>
          )}
        </button>
      </form>
    </div>
  );
}


