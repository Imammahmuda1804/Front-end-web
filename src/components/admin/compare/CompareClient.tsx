'use client';

import { useState, useEffect } from 'react';
import { Download, Info, Heart, Star, MessageSquareText, ThumbsUp, TrendingUp, Tags, BarChart2, GitCompare } from 'lucide-react';
import { adminDestinationService } from '@/services/admin/destination.service';
import { adminAnalyticsService, CompareResult, TrendData, TopicData, DestinationAnalytics } from '@/services/admin/analytics.service';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';

interface DestinationOption {
  id: number;
  name: string;
}

export function CompareClient() {
  const [activeTab, setActiveTab] = useState<'single' | 'compare'>('single');
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destA, setDestA] = useState<number | ''>('');
  const [destB, setDestB] = useState<number | ''>('');
  
  const [singleData, setSingleData] = useState<DestinationAnalytics | null>(null);
  const [compareData, setCompareData] = useState<CompareResult | null>(null);
  const [trendDataA, setTrendDataA] = useState<TrendData[]>([]);
  const [trendDataB, setTrendDataB] = useState<TrendData[]>([]);
  const [topicsA, setTopicsA] = useState<TopicData[]>([]);
  const [topicsB, setTopicsB] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await adminDestinationService.getDestinations({ limit: 100 });
        setDestinations(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      }
    };
    fetchDestinations();
  }, []);

  // Set defaults
  useEffect(() => {
    if (destinations.length > 0 && !destA) {
      setDestA(destinations[0].id);
    }
    if (destinations.length > 1 && !destB) {
      setDestB(destinations[1].id);
    }
  }, [destinations, destA, destB]);

  // Fetch Data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'single') {
        if (!destA) return;
        setLoading(true);
        try {
          const [analytics, trends, topics] = await Promise.all([
            adminAnalyticsService.getDestinationAnalytics(Number(destA)),
            adminAnalyticsService.getDestinationTrends(Number(destA), 'monthly'),
            adminAnalyticsService.getDestinationTopics(Number(destA))
          ]);
          setSingleData(analytics);
          setTrendDataA(trends);
          setTopicsA(topics);
        } catch (error) {
          console.error("Failed to fetch single analytics:", error);
        } finally {
          setLoading(false);
        }
      } else {
        if (!destA || !destB || destA === destB) return;
        setLoading(true);
        try {
          const [comp, tA, tB, topA, topB] = await Promise.all([
            adminAnalyticsService.compareDestinations(Number(destA), Number(destB)),
            adminAnalyticsService.getDestinationTrends(Number(destA), 'monthly'),
            adminAnalyticsService.getDestinationTrends(Number(destB), 'monthly'),
            adminAnalyticsService.getDestinationTopics(Number(destA)),
            adminAnalyticsService.getDestinationTopics(Number(destB))
          ]);
          setCompareData(comp);
          setTrendDataA(tA);
          setTrendDataB(tB);
          setTopicsA(topA);
          setTopicsB(topB);
        } catch (error) {
          console.error("Failed to fetch comparison:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [destA, destB, activeTab]);

  const handleExport = () => {
    if (activeTab === 'single' && destA) {
      window.open(adminAnalyticsService.getExportCsvUrl(Number(destA)), '_blank');
    } else {
      if (destA) window.open(adminAnalyticsService.getExportCsvUrl(Number(destA)), '_blank');
      if (destB) setTimeout(() => window.open(adminAnalyticsService.getExportCsvUrl(Number(destB)), '_blank'), 500);
    }
  };

  // --- Prepare Compare Chart Data ---
  let radarData: any[] = [];
  let sentimentBarData: any[] = [];
  let mergedTrendData: any[] = [];
  let mergedTopicData: any[] = [];
  
  const dA = compareData?.destination1;
  const dB = compareData?.destination2;

  if (activeTab === 'compare' && dA && dB) {
    radarData = [
      { subject: 'Positive %', A: Math.round((dA.positive_ratio || 0) * 100), B: Math.round((dB.positive_ratio || 0) * 100), fullMark: 100 },
      { subject: 'User Rating', A: Math.round(((dA.rating.user || 0) / 5) * 100), B: Math.round(((dB.rating.user || 0) / 5) * 100), fullMark: 100 },
      { subject: 'Google Rating', A: Math.round(((dA.rating.google || 0) / 5) * 100), B: Math.round(((dB.rating.google || 0) / 5) * 100), fullMark: 100 },
      { subject: 'Rec. Score', A: Math.round((dA.recommendation_score || 0) * 100), B: Math.round((dB.recommendation_score || 0) * 100), fullMark: 100 },
    ];

    const totalA = (dA.sentiment.positive || 0) + (dA.sentiment.negative || 0) + (dA.sentiment.neutral || 0) || 1;
    const totalB = (dB.sentiment.positive || 0) + (dB.sentiment.negative || 0) + (dB.sentiment.neutral || 0) || 1;
    
    sentimentBarData = [
      { name: 'Positive', A: Math.round((dA.sentiment.positive / totalA) * 100), B: Math.round((dB.sentiment.positive / totalB) * 100) },
      { name: 'Neutral', A: Math.round((dA.sentiment.neutral / totalA) * 100), B: Math.round((dB.sentiment.neutral / totalB) * 100) },
      { name: 'Negative', A: Math.round((dA.sentiment.negative / totalA) * 100), B: Math.round((dB.sentiment.negative / totalB) * 100) },
    ];

    const trendMap = new Map();
    (trendDataA || []).forEach(t => trendMap.set(t.date, { name: new Date(t.date).toLocaleDateString('default', { month: 'short' }), A: Math.round((t.positive / ((t.positive + t.negative + t.neutral) || 1))*100) }));
    (trendDataB || []).forEach(t => {
      const existing = trendMap.get(t.date) || { name: new Date(t.date).toLocaleDateString('default', { month: 'short' }) };
      trendMap.set(t.date, { ...existing, B: Math.round((t.positive / ((t.positive + t.negative + t.neutral) || 1))*100) });
    });
    mergedTrendData = Array.from(trendMap.values());

    const topicMap = new Map();
    (topicsA || []).slice(0, 5).forEach(t => topicMap.set(t.topic_name, { name: t.topic_name, A: Math.round(t.percentage) }));
    (topicsB || []).slice(0, 5).forEach(t => {
      const existing = topicMap.get(t.topic_name) || { name: t.topic_name, A: 0 };
      topicMap.set(t.topic_name, { ...existing, B: Math.round(t.percentage) });
    });
    mergedTopicData = Array.from(topicMap.values()).map(item => ({
      ...item, B: item.B || 0 
    })).slice(0, 6);
  }

  // --- Prepare Single Chart Data ---
  let singlePieData: any[] = [];
  let singleTrendData: any[] = [];
  let singleTopicData: any[] = [];
  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  if (activeTab === 'single' && singleData) {
    const sentimentObj = (singleData as any).sentiment || (singleData as any).sentiment_distribution || {};
    singlePieData = [
      { name: 'Positive', value: sentimentObj.positive || 0 },
      { name: 'Neutral', value: sentimentObj.neutral || 0 },
      { name: 'Negative', value: sentimentObj.negative || 0 },
    ];
    
    singleTrendData = (trendDataA || []).map(t => ({
      name: new Date(t.date).toLocaleDateString('default', { month: 'short' }),
      Positive: t.positive,
      Neutral: t.neutral,
      Negative: t.negative,
      PosRate: Math.round((t.positive / ((t.positive + t.negative + t.neutral) || 1))*100)
    }));

    singleTopicData = (topicsA || []).slice(0, 6).map(t => ({
      name: t.topic_name,
      Percentage: Math.round(t.percentage)
    }));
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header & Tabs */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
            Destination Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
            {activeTab === 'single' 
              ? "Dive deep into the performance and sentiment metrics of a single destination."
              : "Analyze and compare sentiment trends, review volume, and key performance metrics across multiple destinations."
            }
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-end">
          <button 
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'single' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <BarChart2 className="w-4 h-4" /> Single Analysis
          </button>
          <button 
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'compare' ? 'bg-white dark:bg-slate-800 text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <GitCompare className="w-4 h-4" /> Compare Mode
          </button>
        </div>
      </header>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        <div className="relative">
          <label className="text-[10px] font-bold tracking-widest text-primary absolute -top-2 left-3 bg-slate-50 dark:bg-slate-900 px-1 uppercase">
            {activeTab === 'single' ? "SELECT DESTINATION" : "DESTINATION A"}
          </label>
          <select 
            value={destA} 
            onChange={e => setDestA(Number(e.target.value))}
            className="appearance-none bg-white dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer w-48 shadow-sm"
          >
            <option value="" disabled>Select...</option>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        {activeTab === 'compare' && (
          <>
            <div className="text-slate-400 font-bold text-xs italic">VS</div>
            <div className="relative">
              <label className="text-[10px] font-bold tracking-widest text-secondary absolute -top-2 left-3 bg-slate-50 dark:bg-slate-900 px-1 uppercase">DESTINATION B</label>
              <select 
                value={destB} 
                onChange={e => setDestB(Number(e.target.value))}
                className="appearance-none bg-white dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-secondary/20 outline-none cursor-pointer w-48 shadow-sm"
              >
                <option value="" disabled>Select...</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : activeTab === 'single' ? (
        // ================= SINGLE ANALYSIS VIEW =================
        !singleData ? (
          <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            Select a destination to analyze
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2 text-slate-500">
                  <Heart className="w-5 h-5 text-rose-500" /> <span className="font-semibold text-sm">Positive Ratio</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(((singleData as any).positive_ratio || 0) * 100)}%</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2 text-slate-500">
                  <Star className="w-5 h-5 text-amber-500" /> <span className="font-semibold text-sm">Avg User Rating</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{((singleData as any).average_rating || (singleData as any).rating?.user || 0).toFixed(1)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2 text-slate-500">
                  <ThumbsUp className="w-5 h-5 text-emerald-500" /> <span className="font-semibold text-sm">Rec. Score</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{((singleData as any).recommendation_score || 0).toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                <button 
                  onClick={handleExport}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-5 h-5" /> Export Data
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sentiment Pie */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500"/> Overall Sentiment</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={singlePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {singlePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Topic Distribution */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Tags className="w-5 h-5 text-amber-500"/> Top Topics</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={singleTopicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="Percentage" fill="#FF7B54" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 6-Month Trend */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-3">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500"/> 6-Month Sentiment Trend</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={singleTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="PosRate" name="Positive %" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPos)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )
      ) : (
        // ================= COMPARE ANALYSIS VIEW =================
        !compareData ? (
          <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            Select two distinct destinations to compare
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Radar Chart Card */}
            <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Performance Radar
                </h3>
                <button className="text-slate-400 hover:text-primary transition-colors">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              
              <div className="h-[280px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={dA?.name} dataKey="A" stroke="#FF7B54" fill="#FF7B54" fillOpacity={0.3} />
                    <Radar name={dB?.name} dataKey="B" stroke="#2D82B5" fill="#2D82B5" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-sm" /> {dA?.name}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="w-3 h-3 rounded-full bg-secondary shadow-sm" /> {dB?.name}
                </div>
              </div>
            </div>

            {/* Center Column: Bar Chart & Trend */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Top row: Sentiment Dist & Topics */}
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Sentiment Distribution */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" /> Sentiment Distribution
                      </h3>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="A" name={dA?.name} fill="#FF7B54" radius={[6, 6, 0, 0]} barSize={24} />
                          <Bar dataKey="B" name={dB?.name} fill="#2D82B5" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Topics Performance (Improvisation) */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Tags className="w-5 h-5 text-amber-500" /> Top Topics Sentiment
                      </h3>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={mergedTopicData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} width={70} />
                          <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.5 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="A" name={dA?.name} fill="#FF7B54" radius={[0, 4, 4, 0]} barSize={8} />
                          <Bar dataKey="B" name={dB?.name} fill="#2D82B5" radius={[0, 4, 4, 0]} barSize={8} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 6-Month Trend */}
              <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" /> Sentiment Trend (Positivity %)
                    </h3>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mergedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF7B54" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FF7B54" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2D82B5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2D82B5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="A" name={dA?.name} stroke="#FF7B54" strokeWidth={3} fillOpacity={1} fill="url(#colorA)" />
                        <Area type="monotone" dataKey="B" name={dB?.name} stroke="#2D82B5" strokeWidth={3} fillOpacity={1} fill="url(#colorB)" />
                      </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Comparative Data Table */}
            <div className="col-span-12 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow mb-8">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-indigo-500" /> Detailed Metrics Comparison
                </h3>
                <button 
                  onClick={handleExport}
                  className="text-primary hover:text-white hover:bg-primary px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-primary/20 bg-primary/5"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4">Metric</th>
                      <th className="p-4 text-primary">{dA?.name}</th>
                      <th className="p-4 text-secondary">{dB?.name}</th>
                      <th className="p-4 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800/50">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-lg text-rose-500"><Heart className="w-4 h-4" /></div> Positive Ratio
                      </td>
                      <td className="p-4 font-bold">{Math.round((dA?.positive_ratio || 0) * 100)}%</td>
                      <td className="p-4 font-bold">{Math.round((dB?.positive_ratio || 0) * 100)}%</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {((dA?.positive_ratio || 0) - (dB?.positive_ratio || 0)) > 0 ? '+' : ''}{Math.round(((dA?.positive_ratio || 0) - (dB?.positive_ratio || 0)) * 100)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg text-amber-500"><Star className="w-4 h-4" /></div> User Rating
                      </td>
                      <td className="p-4 font-bold">{dA?.rating.user?.toFixed(1) || '0.0'}</td>
                      <td className="p-4 font-bold">{dB?.rating.user?.toFixed(1) || '0.0'}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {((dA?.rating.user || 0) - (dB?.rating.user || 0)) > 0 ? '+' : ''}{((dA?.rating.user || 0) - (dB?.rating.user || 0)).toFixed(1)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-500"><ThumbsUp className="w-4 h-4" /></div> Google Rating
                      </td>
                      <td className="p-4 font-bold">{dA?.rating.google?.toFixed(1) || '0.0'}</td>
                      <td className="p-4 font-bold">{dB?.rating.google?.toFixed(1) || '0.0'}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {((dA?.rating.google || 0) - (dB?.rating.google || 0)) > 0 ? '+' : ''}{((dA?.rating.google || 0) - (dB?.rating.google || 0)).toFixed(1)}
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg text-indigo-500"><TrendingUp className="w-4 h-4" /></div> Rec. Score
                      </td>
                      <td className="p-4 font-bold">{dA?.recommendation_score?.toFixed(2) || '0.00'}</td>
                      <td className="p-4 font-bold">{dB?.recommendation_score?.toFixed(2) || '0.00'}</td>
                      <td className="p-4 text-right font-black text-slate-900 dark:text-white">
                        {compareData?.comparison?.score_difference! > 0 ? '+' : ''}{compareData?.comparison?.score_difference?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )
      )}
    </div>
  );
}
