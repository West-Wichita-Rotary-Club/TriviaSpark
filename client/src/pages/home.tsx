import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Tree-shake individual icons instead of importing all
import { 
  Brain, 
  Users, 
  QrCode, 
  Sparkles, 
  Trophy, 
  Clock, 
  Shield 
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Play } from "lucide-react"; // additional icons

// Local Event type (aligns with events page but trimmed for homepage use)
interface EventSummary {
  id: string;
  title: string;
  description: string;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  status: string;
  difficulty?: string;
}

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="wine-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Brain className="text-champagne-300 h-10 w-10" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
                TriviaSpark
              </h1>
              <p className="text-xl md:text-2xl text-champagne-200 mb-4" data-testid="text-hero-subtitle">
                Where Every Event Becomes Unforgettable
              </p>
              <p className="text-lg text-champagne-100 mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
                Create intelligent, immersive trivia experiences that transform any gathering into lasting memories. 
                From wine dinners to corporate events, our AI-powered platform makes every moment count.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => setLocation("/login")}
                  className="bg-white text-wine-700 hover:bg-champagne-50 px-8 py-3 text-lg"
                  data-testid="button-get-started"
                >
                  Get Started
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-wine-700 hover:border-white px-8 py-3 text-lg font-medium"
                  data-testid="button-learn-more"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events + Demo Section */}
      <div id="upcoming" className="py-20 bg-gray-50" data-testid="section-upcoming-events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold wine-text mb-3" data-testid="text-upcoming-title">
                Upcoming Events
              </h2>
              <p className="text-gray-600 max-w-xl" data-testid="text-upcoming-subtitle">
                Preview real events on the platform and launch a live demo presenter view instantly.
              </p>
            </div>
          </div>

          <UpcomingEvents onLaunchDemo={(id) => setLocation(`/demo/${id}`)} />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold wine-text mb-4" data-testid="text-features-title">
              Powered by Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-subtitle">
              Our AI-driven platform creates personalized trivia experiences that engage, educate, and entertain your guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="trivia-card hover:shadow-lg transition-shadow" data-testid="card-ai-powered">
              <CardHeader className="text-center">
                <div className="w-16 h-16 wine-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-champagne-400 h-8 w-8" />
                </div>
                <CardTitle className="text-xl wine-text">AI-Powered Content</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Generate intelligent questions tailored to your event theme, audience level, and specific topics using advanced AI.
                </p>
                <Badge variant="secondary" className="bg-wine-100 text-wine-800">Smart Generation</Badge>
              </CardContent>
            </Card>

            <Card className="trivia-card hover:shadow-lg transition-shadow" data-testid="card-instant-joining">
              <CardHeader className="text-center">
                <div className="w-16 h-16 wine-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                  <QrCode className="text-champagne-400 h-8 w-8" />
                </div>
                <CardTitle className="text-xl wine-text">Instant Joining</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Participants join seamlessly by scanning QR codes. No apps to download, no complex setup required.
                </p>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Effortless</Badge>
              </CardContent>
            </Card>

            <Card className="trivia-card hover:shadow-lg transition-shadow" data-testid="card-live-engagement">
              <CardHeader className="text-center">
                <div className="w-16 h-16 wine-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-champagne-400 h-8 w-8" />
                </div>
                <CardTitle className="text-xl wine-text">Live Engagement</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Real-time scoring, leaderboards, and interactive features keep everyone engaged throughout the event.
                </p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Interactive</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold wine-text mb-4" data-testid="text-use-cases-title">
              Perfect for Every Occasion
            </h2>
            <p className="text-xl text-gray-600" data-testid="text-use-cases-subtitle">
              Transform any gathering into an memorable experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="trivia-card text-center p-6" data-testid="card-wine-dinners">
              <Users className="text-wine-600 h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-wine-800 mb-2">Wine Dinners</h3>
              <p className="text-sm text-gray-600">Sophisticated tastings with wine knowledge and pairings</p>
            </Card>

            <Card className="trivia-card text-center p-6" data-testid="card-corporate-events">
              <Shield className="text-wine-600 h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-wine-800 mb-2">Corporate Events</h3>
              <p className="text-sm text-gray-600">Team building activities and company culture engagement</p>
            </Card>

            <Card className="trivia-card text-center p-6" data-testid="card-parties">
              <Sparkles className="text-wine-600 h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-wine-800 mb-2">Parties</h3>
              <p className="text-sm text-gray-600">Fun, social entertainment for celebrations and gatherings</p>
            </Card>

            <Card className="trivia-card text-center p-6" data-testid="card-educational">
              <Brain className="text-wine-600 h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-wine-800 mb-2">Educational</h3>
              <p className="text-sm text-gray-600">Learning experiences with interactive knowledge sharing</p>
            </Card>

            <Card className="trivia-card text-center p-6" data-testid="card-fundraisers">
              <Trophy className="text-wine-600 h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-wine-800 mb-2">Fundraisers</h3>
              <p className="text-sm text-gray-600">Engaging activities that support your cause and community</p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="wine-gradient py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" data-testid="text-cta-title">
            Ready to Spark Something Amazing?
          </h2>
          <p className="text-xl text-champagne-200 mb-8" data-testid="text-cta-subtitle">
            Join event hosts who are creating unforgettable experiences with TriviaSpark
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/register")}
              className="bg-white text-wine-700 hover:bg-champagne-50 px-12 py-4 text-xl"
              data-testid="button-get-started"
            >
              Get Started Free
              <Clock className="ml-3 h-6 w-6" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/login")}
              className="border-white text-white hover:bg-white/10 px-12 py-4 text-xl"
              data-testid="button-sign-in"
            >
              Sign In
            </Button>
          </div>
          <p className="text-champagne-300 mt-4" data-testid="text-cta-footer">
            A WebSpark Solution by Mark Hazleton
          </p>
        </div>
      </div>
    </div>
  );
}

// ----------------- Helper Components -----------------

interface UpcomingEventsProps {
  onLaunchDemo: (eventId: string) => void;
}

function UpcomingEvents({ onLaunchDemo }: UpcomingEventsProps) {
  const { data: events, isLoading, error } = useQuery<EventSummary[]>({
    queryKey: ["/api/events/home"],
    queryFn: async () => {
      const res = await fetch("/api/events/home");
      if (!res.ok) throw new Error("Failed to load public events");
      return res.json();
    },
    retry: false,
  });

  // Filter for events that are scheduled/active and in the future (or no date but active)
  const upcoming = (events || [])
    .filter(e => {
      if (!e) return false;
      const future = e.eventDate ? (new Date(e.eventDate).getTime() >= Date.now() - 1000 * 60 * 60 * 3) : true; // allow recent ones
      const statusOk = ["active", "scheduled", "draft"].includes(e.status?.toLowerCase());
      return future && statusOk;
    })
    .slice(0, 4);

  return (
    <div>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="loading-upcoming">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-48 rounded-xl bg-gradient-to-br from-wine-100/40 to-champagne-100/40 border border-wine-100/50" />
          ))}
        </div>
      )}
      {!isLoading && error && (
        <div className="p-6 border rounded-xl bg-white shadow-sm max-w-xl" data-testid="error-upcoming">
          <p className="text-sm text-gray-600 mb-3">Unable to load events right now.</p>
          <Button size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}
      {!isLoading && !error && upcoming.length === 0 && (
        <div className="p-8 border rounded-xl bg-white text-center shadow-sm" data-testid="empty-upcoming">
          <Brain className="mx-auto h-10 w-10 text-wine-400 mb-4" />
            <p className="text-gray-600 mb-4">No upcoming events to show yet.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => onLaunchDemo("seed-event-coast-to-cascades")}>Launch Demo</Button>
              <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Create One</Button>
            </div>
        </div>
      )}
      {!isLoading && !error && upcoming.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="grid-upcoming">
          {upcoming.map(ev => (
            <Card key={ev.id} className="trivia-card flex flex-col" data-testid={`home-event-card-${ev.id}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2" title={ev.title}>{ev.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-gray-600 mb-3 line-clamp-3" data-testid={`home-event-desc-${ev.id}`}>{ev.description}</p>
                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  {(ev.eventDate || ev.eventTime) && (
                    <div className="flex items-center gap-1" data-testid={`home-event-datetime-${ev.id}`}>
                      <Calendar className="h-3 w-3" />
                      <span>
                        {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                        {ev.eventTime ? ` • ${ev.eventTime}` : ''}
                      </span>
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-1" data-testid={`home-event-location-${ev.id}`}>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  )}
                  {ev.difficulty && (
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide" data-testid={`home-event-diff-${ev.id}`}>
                      <span className="px-1.5 py-0.5 rounded bg-wine-100 text-wine-700 font-medium">{ev.difficulty}</span>
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <Button 
                    size="sm"
                    className="w-full trivia-button-primary"
                    onClick={() => onLaunchDemo(ev.id)}
                    data-testid={`button-demo-${ev.id}`}
                  >
                    <Play className="mr-2 h-4 w-4" /> Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}