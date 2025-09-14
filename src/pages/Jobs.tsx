import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Plus,
  Search,
  Filter,
  Building2,
  Users,
  Calendar,
  Send,
  ExternalLink,
  Star,
  Bookmark
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Job {
  _id: string;
  title: string;
  description: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'internship';
  workMode: 'remote' | 'onsite' | 'hybrid';
  experienceLevel: 'entry_level' | 'mid_level' | 'senior_level';
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: number;
  maximumExperience: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  benefits: string[];
  applicationMethod: 'internal' | 'external';
  applicationDeadline: string;
  category: string;
  department: string;
  responsibilities: string[];
  employer: {
    _id: string;
    firstName: string;
    lastName: string;
    profile: {
      companyName: string;
      companyWebsite?: string;
      industry?: string;
    };
  };
  applications: number;
  isBookmarked: boolean;
  hasApplied: boolean;
  createdAt: string;
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [applyJobOpen, setApplyJobOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    jobType: "all",
    workMode: "all",
    experienceLevel: "all",
    location: ""
  });
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    jobType: "full_time",
    workMode: "hybrid",
    experienceLevel: "mid_level",
    requiredSkills: "",
    preferredSkills: "",
    minimumExperience: "0",
    maximumExperience: "5",
    city: "",
    state: "",
    country: "IN",
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    period: "yearly",
    benefits: "",
    applicationDeadline: "",
    category: "engineering",
    department: "Technology",
    responsibilities: ""
  });
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resumeUrl: "",
    additionalNotes: ""
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] && filters[key as keyof typeof filters] !== 'all') {
          params[key] = filters[key as keyof typeof filters];
        }
      });

      const response = await api.getJobs(params);
      if (response.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        jobType: newJob.jobType,
        workMode: newJob.workMode,
        experienceLevel: newJob.experienceLevel,
        requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        preferredSkills: newJob.preferredSkills.split(',').map(s => s.trim()).filter(s => s),
        minimumExperience: parseInt(newJob.minimumExperience),
        maximumExperience: parseInt(newJob.maximumExperience),
        location: {
          city: newJob.city,
          state: newJob.state,
          country: newJob.country
        },
        salary: newJob.salaryMin && newJob.salaryMax ? {
          min: parseInt(newJob.salaryMin),
          max: parseInt(newJob.salaryMax),
          currency: newJob.currency,
          period: newJob.period
        } : undefined,
        benefits: newJob.benefits.split(',').map(s => s.trim()).filter(s => s),
        applicationMethod: 'internal',
        applicationDeadline: new Date(newJob.applicationDeadline).toISOString(),
        category: newJob.category,
        department: newJob.department,
        responsibilities: newJob.responsibilities.split('\n').map(s => s.trim()).filter(s => s)
      };

      const response = await api.createJob(jobData);
      if (response.success) {
        setCreateJobOpen(false);
        setNewJob({
          title: "",
          description: "",
          jobType: "full_time",
          workMode: "hybrid",
          experienceLevel: "mid_level",
          requiredSkills: "",
          preferredSkills: "",
          minimumExperience: "0",
          maximumExperience: "5",
          city: "",
          state: "",
          country: "IN",
          salaryMin: "",
          salaryMax: "",
          currency: "INR",
          period: "yearly",
          benefits: "",
          applicationDeadline: "",
          category: "engineering",
          department: "Technology",
          responsibilities: ""
        });
        loadJobs();
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJobOpen) return;

    try {
      const response = await api.applyToJob(applyJobOpen, {
        coverLetter: applicationData.coverLetter,
        resume: {
          url: applicationData.resumeUrl,
          filename: "resume.pdf"
        },
        additionalDocuments: []
      });

      if (response.success) {
        setApplyJobOpen(null);
        setApplicationData({ coverLetter: "", resumeUrl: "", additionalNotes: "" });
        
        // Update job to show as applied
        setJobs(prev => prev.map(job => 
          job._id === applyJobOpen 
            ? { ...job, hasApplied: true, applications: job.applications + 1 }
            : job
        ));
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-primary';
      case 'part_time': return 'bg-accent';
      case 'contract': return 'bg-warning';
      case 'internship': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getWorkModeIcon = (mode: string) => {
    switch (mode) {
      case 'remote': return '🏠';
      case 'onsite': return '🏢';
      case 'hybrid': return '🔄';
      default: return '📍';
    }
  };

  const canPostJobs = user?.role === 'employer' || user?.role === 'admin';
  const canApplyJobs = user?.role === 'student' || user?.role === 'alumni';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Portal</h1>
          <p className="text-muted-foreground">Discover career opportunities in our network</p>
        </div>

        {canPostJobs && (
          <Dialog open={createJobOpen} onOpenChange={setCreateJobOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newJob.department}
                      onChange={(e) => setNewJob(prev => ({ ...prev, department: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="responsibilities">Key Responsibilities (one per line)</Label>
                  <Textarea
                    id="responsibilities"
                    rows={3}
                    value={newJob.responsibilities}
                    onChange={(e) => setNewJob(prev => ({ ...prev, responsibilities: e.target.value }))}
                    placeholder="Develop and maintain web applications&#10;Collaborate with cross-functional teams&#10;Write clean, maintainable code"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select value={newJob.jobType} onValueChange={(value) => setNewJob(prev => ({ ...prev, jobType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workMode">Work Mode</Label>
                    <Select value={newJob.workMode} onValueChange={(value) => setNewJob(prev => ({ ...prev, workMode: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={newJob.experienceLevel} onValueChange={(value) => setNewJob(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry_level">Entry Level</SelectItem>
                        <SelectItem value="mid_level">Mid Level</SelectItem>
                        <SelectItem value="senior_level">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newJob.city}
                      onChange={(e) => setNewJob(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newJob.state}
                      onChange={(e) => setNewJob(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={newJob.applicationDeadline}
                      onChange={(e) => setNewJob(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requiredSkills">Required Skills (comma separated)</Label>
                    <Input
                      id="requiredSkills"
                      value={newJob.requiredSkills}
                      onChange={(e) => setNewJob(prev => ({ ...prev, requiredSkills: e.target.value }))}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredSkills">Preferred Skills (comma separated)</Label>
                    <Input
                      id="preferredSkills"
                      value={newJob.preferredSkills}
                      onChange={(e) => setNewJob(prev => ({ ...prev, preferredSkills: e.target.value }))}
                      placeholder="AWS, Docker, TypeScript"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={newJob.salaryMin}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salaryMin: e.target.value }))}
                      placeholder="600000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="salaryMax">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={newJob.salaryMax}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salaryMax: e.target.value }))}
                      placeholder="1200000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newJob.currency} onValueChange={(value) => setNewJob(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select value={newJob.period} onValueChange={(value) => setNewJob(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits (comma separated)</Label>
                  <Input
                    id="benefits"
                    value={newJob.benefits}
                    onChange={(e) => setNewJob(prev => ({ ...prev, benefits: e.target.value }))}
                    placeholder="Health insurance, Flexible hours, Remote work"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateJobOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Post Job</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, skills, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select value={filters.jobType} onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.workMode} onValueChange={(value) => setFilters(prev => ({ ...prev, workMode: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.experienceLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, experienceLevel: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="entry_level">Entry Level</SelectItem>
              <SelectItem value="mid_level">Mid Level</SelectItem>
              <SelectItem value="senior_level">Senior Level</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-6 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                      </div>
                      <div className="h-10 bg-muted rounded w-24" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-4/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {canPostJobs 
                  ? "Be the first to post a job opportunity!"
                  : "Check back later for new job postings."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-card transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{job.employer.profile.companyName}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{job.employer.profile.industry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {job.location.city}, {job.location.state}
                        </span>
                        <span className="text-lg ml-1">{getWorkModeIcon(job.workMode)}</span>
                      </div>

                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} / {job.salary.period}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={`text-white ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {job.workMode}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {job.experienceLevel.replace('_', ' ')}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.requiredSkills.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Required Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.requiredSkills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.requiredSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{job.applications} applications</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {canApplyJobs && (
                      <>
                        {job.hasApplied ? (
                          <Button disabled variant="outline" className="gap-2">
                            Applied ✓
                          </Button>
                        ) : (
                          <Dialog open={applyJobOpen === job._id} onOpenChange={(open) => setApplyJobOpen(open ? job._id : null)}>
                            <DialogTrigger asChild>
                              <Button className="gap-2">
                                <Send className="h-4 w-4" />
                                Apply Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Apply for {job.title}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleApplyJob} className="space-y-4">
                                <div>
                                  <Label htmlFor="coverLetter">Cover Letter</Label>
                                  <Textarea
                                    id="coverLetter"
                                    rows={6}
                                    value={applicationData.coverLetter}
                                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                                    placeholder="Explain why you're a great fit for this role..."
                                    required
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="resumeUrl">Resume URL</Label>
                                  <Input
                                    id="resumeUrl"
                                    type="url"
                                    value={applicationData.resumeUrl}
                                    onChange={(e) => setApplicationData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                                    placeholder="https://example.com/your-resume.pdf"
                                    required
                                  />
                                </div>

                                <div className="flex justify-end gap-3">
                                  <Button type="button" variant="outline" onClick={() => setApplyJobOpen(null)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit">Submit Application</Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </>
                    )}

                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>

                    {job.employer.profile.companyWebsite && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={job.employer.profile.companyWebsite} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {jobs.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadJobs}>
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  );
}