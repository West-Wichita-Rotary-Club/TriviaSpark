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
          <Button 
            size="lg"
            onClick={() => setLocation("/login")}
            className="bg-white text-wine-700 hover:bg-champagne-50 px-12 py-4 text-xl"
            data-testid="button-start-creating"
          >
            Start Creating
            <Clock className="ml-3 h-6 w-6" />
          </Button>
          <p className="text-champagne-300 mt-4" data-testid="text-cta-footer">
            A WebSpark Solution by Mark Hazleton
          </p>
        </div>
      </div>
    </div>
  );
}