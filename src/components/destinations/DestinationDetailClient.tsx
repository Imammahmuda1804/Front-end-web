'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Sparkles, Navigation, ArrowLeft, Image as ImageIcon, MessageSquare, TrendingUp, ThumbsUp, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils';

dayjs.locale('id');

interface DestinationImage {
  id: number;
  imageUrl: string;
}

interface SentimentTrend {
  id: number;
  date: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positiveRatio: number;
}

interface DestinationTopic {
  id: number;
  topic: {
    id: number;
    topic_name: string;
    keywords: string[];
  };
}

interface UserReview {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
}

interface DestinationDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  thumbnailUrl: string;
  thumbnail_url?: string;
  googleRating: number | null;
  userRating: number | null;
  positiveRatio: number | null;
  recommendationScore: number | null;
  images: DestinationImage[];
  sentimentTrends: SentimentTrend[];
  destinationTopics: DestinationTopic[];
  userReviews: UserReview[];
  averageUserRating: number | null;
  totalUserReviews: number;
}

interface Props {
  destination: DestinationDetail;
}

export default function DestinationDetailClient({ destination }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'reviews'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, destination.id]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await api.get('/api/favorites?limit=100');
      const favorites = res.data.data;
      const found = favorites.some((f: any) => f.destination.id === destination.id);
      setIsFavorite(found);
    } catch (error) {
      console.error('Failed to check favorite status', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    setSavingFavorite(true);
    try {
      if (isFavorite) {
        await api.delete(`/api/favorites/${destination.id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/api/favorites/${destination.id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    } finally {
      setSavingFavorite(false);
    }
  };

  // Format tags
  const tags = destination.destinationTopics.map(dt => {
    if (dt.topic.keywords && dt.topic.keywords.length > 0) {
      return dt.topic.keywords.slice(0, 2).join(', ');
    }
    return dt.topic.topic_name.replace(/Topic \d+: /, '');
  });

  // Safe Image Array including Thumbnail
  const thumbUrl = destination.thumbnailUrl || destination.thumbnail_url ? getImageUrl(destination.thumbnailUrl || destination.thumbnail_url) : null;
  const allImages = React.useMemo(() => {
    const list = [...destination.images.map(img => getImageUrl(img.imageUrl))];
    if (thumbUrl && !list.includes(thumbUrl)) {
      list.unshift(thumbUrl);
    }
    return list;
  }, [destination.images, thumbUrl]);

  // Format Sentiment Data for Chart
  const chartData = destination.sentimentTrends.map(trend => ({
    date: dayjs(trend.date).format('DD MMM'),
    ratio: Number((trend.positiveRatio * 100).toFixed(0)),
    positive: trend.positiveCount,
    negative: trend.negativeCount
  }));

  // Stats
  const displayRating = destination.averageUserRating || destination.googleRating || destination.userRating || 0;
  const positivePercentage = destination.positiveRatio !== null ? (destination.positiveRatio * 100).toFixed(0) : 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 flex items-center justify-between"
        >
          <Link href="/search" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Pencarian
          </Link>
          
          <div className="flex gap-2">
            <button 
              onClick={toggleFavorite}
              disabled={savingFavorite}
              className={`p-2 rounded-full shadow-sm border transition-colors ${
                isFavorite 
                  ? 'bg-red-50 border-red-100 text-red-500' 
                  : 'bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
            </button>
            <button className="bg-white p-2 rounded-full shadow-sm border border-slate-100 hover:text-primary transition-colors">
              <Star className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative h-[60vh] min-h-[400px] rounded-3xl overflow-hidden shadow-2xl mb-8 group"
        >
          <Image 
            src={thumbUrl || '/images/auth-bg.jpg'} 
            alt={destination.name}
            fill
            priority
            sizes="100vw"
            className="object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
          
          {/* AI Match Badge */}
          {destination.recommendationScore !== null && (
            <div className="absolute top-6 left-6 bg-primary/90 px-4 py-2 rounded-full flex items-center shadow-lg">
              <Sparkles className="w-4 h-4 text-orange-300 mr-2" />
              <span className="text-white font-bold text-sm tracking-wide">
                AI MATCH SCORE <span className="ml-2 bg-white text-slate-900 px-2 py-0.5 rounded-full">{(destination.recommendationScore * 100).toFixed(0)}</span>
              </span>
            </div>
          )}

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight">
              {destination.name}
            </h1>
            <p className="flex items-center text-lg md:text-xl text-slate-200 font-medium">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              {destination.city}, {destination.province}
            </p>
          </div>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Rating</p>
              <div className="flex items-end">
                <span className="text-3xl font-black text-slate-900 mr-2">{displayRating.toFixed(1)}</span>
                <span className="text-sm font-medium text-slate-500 mb-1">/ 5.0</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Rasio Positif</p>
              <div className="flex items-end">
                <span className="text-3xl font-black text-emerald-500 mr-2">{positivePercentage}%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          <a href={destination.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Lokasi</p>
              <span className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">Buka Google Maps</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Navigation className="w-6 h-6 text-blue-500 group-hover:text-primary" />
            </div>
          </a>
        </motion.div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div role="tablist" className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar">
            <button 
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="panel-overview"
              onClick={() => setActiveTab('overview')}
              className={`flex-shrink-0 px-8 py-5 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Overview
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'gallery'}
              aria-controls="panel-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`flex-shrink-0 flex items-center px-8 py-5 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Galeri ({allImages.length})
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'reviews'}
              aria-controls="panel-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`flex-shrink-0 flex items-center px-8 py-5 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ulasan ({destination.totalUserReviews})
            </button>
          </div>

          <div className="p-8 md:p-12">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div id="panel-overview" role="tabpanel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Description */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Tentang Destinasi</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {destination.description || 'Deskripsi belum tersedia untuk destinasi ini. Kami terus memperbarui data untuk memberikan informasi terbaik bagi perjalanan Anda.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">Vibe & Suasana</h3>
                    <div className="flex flex-wrap gap-3">
                      {destination.destinationTopics.map(dt => (
                        <div key={dt.id} className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
                          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Topik</span>
                          <span className="text-slate-800 font-bold capitalize">
                            {dt.topic.keywords && dt.topic.keywords.length > 0 ? dt.topic.keywords.join(', ') : dt.topic.topic_name}
                          </span>
                        </div>
                      ))}
                      {destination.destinationTopics.length === 0 && (
                        <p className="text-slate-500 italic">Belum ada topik khusus yang teridentifikasi.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sentiment Trend Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">Tren Sentimen</h3>
                        <p className="text-xs text-slate-500 font-medium">30 Hari Terakhir</p>
                      </div>
                    </div>
                    
                    {chartData.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                              minTickGap={15}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                              domain={[0, 100]}
                              tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="ratio" 
                              name="Positif (%)" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorRatio)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-48 w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <p className="text-sm text-slate-400 font-medium">Data tren belum tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <motion.div id="panel-gallery" role="tabpanel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 grid-rows-[auto]">
                  {allImages.length > 0 ? allImages.map((img, idx) => (
                    <div key={idx} className={`relative rounded-2xl overflow-hidden group shadow-sm ${idx === 0 ? 'md:col-span-2 md:row-span-2 aspect-video' : 'aspect-square'}`}>
                      <Image 
                        src={img} 
                        alt={`${destination.name} ${idx + 1}`}
                        fill
                        sizes={idx === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Belum ada foto tambahan untuk destinasi ini.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <motion.div id="panel-reviews" role="tabpanel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900">Ulasan Wisatawan</h3>
                  <div className="bg-slate-100 px-4 py-2 rounded-full font-bold text-slate-700">
                    {destination.totalUserReviews} Ulasan
                  </div>
                </div>

                <div className="space-y-6">
                  {destination.userReviews.length > 0 ? destination.userReviews.map(review => (
                    <div key={review.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3 overflow-hidden">
                            {review.user.profilePicture ? (
                              <Image src={review.user.profilePicture} alt={review.user.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              review.user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{review.user.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{dayjs(review.createdAt).format('DD MMMM YYYY')}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-300 fill-slate-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  )) : (
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-slate-900 mb-2">Belum ada ulasan</h4>
                      <p className="text-slate-500 font-medium">Jadilah yang pertama mengulas destinasi ini!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
