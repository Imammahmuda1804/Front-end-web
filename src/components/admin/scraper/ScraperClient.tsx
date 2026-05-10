"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { adminScraperService, ScrapingJob } from "@/services/admin/scraper.service";
import { adminDestinationService } from "@/services/admin/destination.service";
import { toast } from "sonner";
import { 
  Database, 
  Play, 
  MapPin, 
  Link as LinkIcon, 
  Settings2, 
  Download, 
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  BrainCircuit,
  RefreshCw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function ScraperClient() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [inputType, setInputType] = useState<"destination" | "url">("destination");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [mapsUrl, setMapsUrl] = useState<string>("");
  const [maxReviews, setMaxReviews] = useState<number>(100);
  const [isStarting, setIsStarting] = useState(false);

  // Polling State
  const [activeJobs, setActiveJobs] = useState<Set<number>>(new Set());

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await adminDestinationService.getDestinations({ page: 1, limit: 100 });
      // Unpack response correctly
      const data = res.data?.data || res.data || res || [];
      setDestinations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await adminScraperService.getAllJobs(1, 50);
      // TransformInterceptor flattens { data, meta } → { status, data, meta }
      // So res.data is already the jobs array
      const jobsData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setJobs(jobsData);
      
      // Update active jobs tracking
      const newActiveJobs = new Set<number>();
      jobsData.forEach((job: ScrapingJob) => {
        if (job.status === 'pending' || job.status === 'scraping' || job.status === 'nlp_processing') {
          newActiveJobs.add(job.id);
        }
      });
      setActiveJobs(newActiveJobs);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
    fetchJobs();
  }, [fetchDestinations, fetchJobs]);

  // Polling Effect
  useEffect(() => {
    if (activeJobs.size === 0) return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeJobs.size, fetchJobs]);

  const handleStartScraping = async () => {
    if (inputType === "destination" && !selectedDestination) {
      toast.error("Silakan pilih destinasi");
      return;
    }
    if (inputType === "url" && (!mapsUrl || !selectedDestination)) {
      toast.error("Silakan pilih destinasi (untuk relasi data) dan masukkan link maps");
      return;
    }

    setIsStarting(true);
    try {
      const payload: any = {
        destination_id: parseInt(selectedDestination),
        max_reviews: maxReviews,
      };

      if (inputType === "url") {
        payload.maps_url = mapsUrl;
      }

      await adminScraperService.startScraping(payload);
      toast.success("Scraping job started successfully");
      fetchJobs();
      
      // Reset form
      setMapsUrl("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start scraping");
    } finally {
      setIsStarting(false);
    }
  };

  const handleDownloadCsv = async (jobId: number) => {
    try {
      const blob = await adminScraperService.downloadCsv(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scraping_job_${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download CSV");
    }
  };

  const handleProcessNlp = async (jobId: number) => {
    try {
      await adminScraperService.processNlp(jobId);
      toast.success("NLP Processing started");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start NLP processing");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case 'scraping':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scraping</span>;
      case 'nlp_processing':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20"><BrainCircuit className="w-3.5 h-3.5 animate-pulse" /> NLP Processing</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20"><XCircle className="w-3.5 h-3.5" /> Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20">{status}</span>;
    }
  };

  const getProgress = (job: ScrapingJob) => {
    if (!job.progress) return null;
    const { extracted, target } = job.progress;
    if (extracted === undefined || target === undefined) return null;
    
    const percentage = Math.min(Math.round((extracted / target) * 100), 100);
    
    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">{extracted} / {target} reviews</span>
          <span className="text-slate-500">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              job.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'
            }`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      {/* Control Panel */}
      <div className="space-y-6">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-800">
              <Database className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">New Scraping Job</CardTitle>
            </div>
            <CardDescription className="text-sm">Configure and trigger data extraction</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            <div className="space-y-3">
              <div className="flex bg-slate-100/80 p-1 rounded-lg">
                <button
                  onClick={() => setInputType("destination")}
                  className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${
                    inputType === "destination" 
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  By Destination
                </button>
                <button
                  onClick={() => setInputType("url")}
                  className={`flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-all ${
                    inputType === "url" 
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  By Map URL
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Destination ID
                  </Label>
                  <Select value={selectedDestination} onValueChange={(val) => setSelectedDestination(val || "")}>
                    <SelectTrigger className="w-full bg-slate-50">
                      <SelectValue placeholder="Select destination..." />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id.toString()}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {inputType === "url" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" /> Google Maps URL
                    </Label>
                    <Input 
                      placeholder="https://maps.google.com/..." 
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      className="bg-slate-50 font-mono text-xs"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" /> Limit Reviews
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      value={maxReviews}
                      onChange={(e) => setMaxReviews(parseInt(e.target.value) || 100)}
                      className="w-24 bg-slate-50"
                      min={1}
                      max={1000}
                    />
                    <span className="text-sm text-slate-500">Max reviews to extract</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-[0.98]"
              onClick={handleStartScraping}
              disabled={isStarting}
            >
              {isStarting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isStarting ? "Initializing..." : "Start Scraping Job"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Monitor & History Panel */}
      <Card className="border-slate-200/60 shadow-sm flex flex-col h-full overflow-hidden">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <Activity className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg">Job Monitor & History</CardTitle>
            </div>
            {activeJobs.size > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full ring-1 ring-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {activeJobs.size} active {activeJobs.size === 1 ? 'job' : 'jobs'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="min-w-max">
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] font-mono text-xs font-medium text-slate-500 uppercase">ID</TableHead>
                  <TableHead className="font-medium text-xs text-slate-500 uppercase">Destination</TableHead>
                  <TableHead className="w-[140px] font-medium text-xs text-slate-500 uppercase">Status</TableHead>
                  <TableHead className="w-[200px] font-medium text-xs text-slate-500 uppercase">Progress</TableHead>
                  <TableHead className="w-[140px] font-medium text-xs text-slate-500 uppercase">Started</TableHead>
                  <TableHead className="w-[120px] text-right font-medium text-xs text-slate-500 uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> Loading jobs...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Database className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-sm font-medium text-slate-600">No scraping jobs found</span>
                        <span className="text-xs text-slate-400">Start a new job to see it here</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-500">#{job.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 text-sm">{job.destination?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{job.destination?.city || ''}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{getProgress(job)}</TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(job.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {job.status === 'completed' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleDownloadCsv(job.id)}
                                title="Download CSV"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => handleProcessNlp(job.id)}
                                title="Trigger NLP Processing"
                              >
                                <BrainCircuit className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
