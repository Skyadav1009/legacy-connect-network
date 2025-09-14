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
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  Star,
  Share,
  Info
} from "lucide-react";
import { format } from "date-fns";

interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  category: string;
  startDate: string;
  endDate: string;
  venue: string;
  visibility: string;
  registrationRequired: boolean;
  registrationDeadline?: string;
  maxAttendees?: number;
  currentAttendees: number;
  isRegistered: boolean;
  organizer: {
    firstName: string;
    lastName: string;
    role: string;
  };
  contactEmail: string;
  targetAudience: string[];
  createdAt: string;
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "networking",
    category: "alumni",
    startDate: "",
    endDate: "",
    venue: "",
    visibility: "public",
    registrationRequired: true,
    registrationDeadline: "",
    maxAttendees: "",
    contactEmail: user?.email || "",
    targetAudience: ["students", "alumni"]
  });

  useEffect(() => {
    loadEvents();
  }, [categoryFilter, upcomingOnly]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 20,
        upcoming: upcomingOnly
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.getEvents(params);
      if (response.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
        targetAudience: newEvent.targetAudience,
        startDate: new Date(newEvent.startDate).toISOString(),
        endDate: new Date(newEvent.endDate).toISOString(),
        registrationDeadline: newEvent.registrationDeadline 
          ? new Date(newEvent.registrationDeadline).toISOString() 
          : undefined
      };

      const response = await api.createEvent(eventData);
      if (response.success) {
        setCreateEventOpen(false);
        setNewEvent({
          title: "",
          description: "",
          eventType: "networking",
          category: "alumni",
          startDate: "",
          endDate: "",
          venue: "",
          visibility: "public",
          registrationRequired: true,
          registrationDeadline: "",
          maxAttendees: "",
          contactEmail: user?.email || "",
          targetAudience: ["students", "alumni"]
        });
        loadEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRegisterEvent = async (eventId: string, isRegistered: boolean) => {
    try {
      if (isRegistered) {
        await api.unregisterFromEvent(eventId);
      } else {
        await api.registerForEvent(eventId);
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event._id === eventId 
          ? {
              ...event,
              isRegistered: !isRegistered,
              currentAttendees: isRegistered 
                ? event.currentAttendees - 1 
                : event.currentAttendees + 1
            }
          : event
      ));
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'networking': return 'bg-primary';
      case 'workshop': return 'bg-accent';
      case 'seminar': return 'bg-success';
      case 'career_fair': return 'bg-warning';
      case 'social': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const canCreateEvents = user?.role === 'admin' || user?.role === 'faculty';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and participate in community events</p>
        </div>

        {canCreateEvents && (
          <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="career_fair">Career Fair</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newEvent.category} onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={newEvent.visibility} onValueChange={(value) => setNewEvent(prev => ({ ...prev, visibility: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={newEvent.registrationDeadline}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={newEvent.maxAttendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={newEvent.contactEmail}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Event</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && loadEvents()}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="alumni">Alumni</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={upcomingOnly ? "default" : "outline"}
          onClick={() => setUpcomingOnly(!upcomingOnly)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {upcomingOnly ? "Upcoming" : "All Events"}
        </Button>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                    <div className="h-8 bg-muted rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {canCreateEvents 
                  ? "Create the first event for your community!"
                  : "Check back later for upcoming events."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event._id} className="hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge 
                          className={`text-white ${getEventTypeColor(event.eventType)}`}
                        >
                          {event.eventType.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardDescription className="text-sm">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.currentAttendees} attendees
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="text-sm text-muted-foreground border-t pt-3">
                    <span>Organized by </span>
                    <span className="font-medium">
                      {event.organizer.firstName} {event.organizer.lastName}
                    </span>
                    <span className="capitalize"> ({event.organizer.role})</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    {event.registrationRequired && (
                      <Button
                        onClick={() => handleRegisterEvent(event._id, event.isRegistered)}
                        variant={event.isRegistered ? "outline" : "default"}
                        className="flex-1"
                        disabled={
                          !event.isRegistered && 
                          event.maxAttendees && 
                          event.currentAttendees >= event.maxAttendees
                        }
                      >
                        {event.isRegistered ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unregister
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            {event.maxAttendees && event.currentAttendees >= event.maxAttendees
                              ? "Full"
                              : "Register"
                            }
                          </>
                        )}
                      </Button>
                    )}

                    <Button variant="ghost" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>

                  {event.registrationDeadline && (
                    <div className="text-xs text-muted-foreground">
                      Registration deadline: {format(new Date(event.registrationDeadline), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {events.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadEvents}>
            Load More Events
          </Button>
        </div>
      )}
    </div>
  );
}