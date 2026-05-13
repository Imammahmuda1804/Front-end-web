'use client';

import { Users, MapPin, MessageSquare, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SummaryCardsProps {
  totalUsers: number;
  totalDestinations: number;
  totalReviews: number;
  totalJobs: number;
  destinationsBreakdown: { active: number; deleted: number };
  reviewsBreakdown: { scraped: number; user_submitted: number };
}

export default function SummaryCards({
  totalUsers,
  totalDestinations,
  totalReviews,
  totalJobs,
  destinationsBreakdown,
  reviewsBreakdown,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Total Users - Yellow */}
      <div className="bg-[#FEF08A] rounded-[24px] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-900" />
            <h3 className="font-semibold text-yellow-950">Total Users</h3>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-yellow-950">{totalUsers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-sm text-yellow-900/80">Registered accounts</p>
            <Link href="/admin/users" className="bg-white/80 hover:bg-white text-yellow-950 text-xs font-medium px-3 py-1.5 rounded-full flex items-center transition-colors">
              See Details <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Destinations - Pink */}
      <div className="bg-[#FECDD3] rounded-[24px] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-900" />
            <h3 className="font-semibold text-rose-950">Destinations</h3>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-rose-950">{totalDestinations.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-sm text-rose-900/80">{destinationsBreakdown.active} active</p>
            <Link href="/admin/destinations" className="bg-white/80 hover:bg-white text-rose-950 text-xs font-medium px-3 py-1.5 rounded-full flex items-center transition-colors">
              See Details <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews - Purple */}
      <div className="bg-[#E9D5FF] rounded-[24px] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-900" />
            <h3 className="font-semibold text-purple-950">Total Reviews</h3>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-purple-950">{totalReviews.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-sm text-purple-900/80">{reviewsBreakdown.scraped.toLocaleString()} scraped</p>
            <Link href="/admin/scraper" className="bg-white/80 hover:bg-white text-purple-950 text-xs font-medium px-3 py-1.5 rounded-full flex items-center transition-colors">
              See Details <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Jobs - Blue/Cyan */}
      <div className="bg-[#BAE6FD] rounded-[24px] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-900" />
            <h3 className="font-semibold text-sky-950">Scraping Jobs</h3>
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-sky-950">{totalJobs.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-sm text-sky-900/80">Tasks processed</p>
            <Link href="/admin/scraper" className="bg-white/80 hover:bg-white text-sky-950 text-xs font-medium px-3 py-1.5 rounded-full flex items-center transition-colors">
              See Details <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
