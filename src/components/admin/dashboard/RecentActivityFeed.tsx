'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, MessageSquareText, Globe, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityData {
  recent_scraping_jobs: any[];
  recent_scraped_reviews: any[];
  recent_user_reviews: any[];
  recent_registrations: any[];
}

interface RecentActivityFeedProps {
  activity: ActivityData;
}

export default function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  // Flatten and sort activities by date
  const allActivities = [
    ...activity.recent_scraping_jobs.map(job => ({
      type: 'job',
      id: `job-${job.id}`,
      title: `Scraping Job: ${job.destination?.name || 'Unknown'}`,
      description: `Status: ${job.status}. Found ${job.reviewsFound || 0} reviews.`,
      date: new Date(job.createdAt),
      status: job.status
    })),
    ...activity.recent_user_reviews.map(review => ({
      type: 'user_review',
      id: `urev-${review.id}`,
      title: `New Review by ${review.user?.name || 'User'}`,
      description: `Rated ${review.rating}/5 for ${review.destination?.name || 'Destination'}.`,
      date: new Date(review.createdAt),
      status: 'success'
    })),
    ...activity.recent_registrations.map(user => ({
      type: 'registration',
      id: `reg-${user.id}`,
      title: `New User Registration`,
      description: `${user.name} joined as ${user.role}.`,
      date: new Date(user.createdAt),
      status: 'success'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8); // top 8 recent

  const getIcon = (type: string, status: string) => {
    if (type === 'registration') return <UserPlus className="w-4 h-4 text-blue-600" />;
    if (type === 'user_review') return <MessageSquareText className="w-4 h-4 text-emerald-600" />;
    if (type === 'job') {
      if (status === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      if (status === 'FAILED') return <AlertCircle className="w-4 h-4 text-red-600" />;
      return <Globe className="w-4 h-4 text-purple-600" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getIconBg = (type: string, status: string) => {
    if (type === 'registration') return 'bg-blue-100';
    if (type === 'user_review') return 'bg-emerald-100';
    if (type === 'job') {
      if (status === 'COMPLETED') return 'bg-emerald-100';
      if (status === 'FAILED') return 'bg-red-100';
      return 'bg-purple-100';
    }
    return 'bg-slate-100';
  };

  return (
    <Card className="bg-white border-none shadow-sm rounded-[24px] overflow-hidden">
      <CardHeader className="pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <Clock className="w-3.5 h-3.5" />
          Today
        </div>
      </CardHeader>
      <CardContent>
        {allActivities.length > 0 ? (
          <div className="space-y-4">
            {allActivities.map((item, i) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group gap-4 sm:gap-0 border border-transparent hover:border-slate-100">
                
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getIconBg(item.type, item.status)}`}>
                    {getIcon(item.type, item.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </div>

                {/* Middle: Status Pill */}
                <div className="hidden md:flex items-center justify-center w-32">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'COMPLETED' || item.status === 'success' ? 'bg-emerald-500' :
                      item.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs font-medium text-slate-600 capitalize">
                      {item.status === 'success' ? 'Done' : item.status.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Right: Time & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDistanceToNow(item.date, { addSuffix: true })}
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">
            No recent activity found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
