import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react';

type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
};

export default function Insights() {
  const [shouldFetchInsights, setShouldFetchInsights] = useState(false);

  // Check authentication
  const { data: user } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: stats } = useQuery<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user,
  });

  const {
    data: insights,
    isLoading: insightsLoading,
    refetch: refetchInsights,
  } = useQuery<{
    insights: string[];
  }>({
    queryKey: ['/api/dashboard/insights'],
    enabled: shouldFetchInsights && !!user,
  });

  const handleGenerateInsights = () => {
    setShouldFetchInsights(true);
    refetchInsights();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary">Please log in to view insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          Get personalized recommendations based on your trivia event performance
        </p>
      </div>

      {/* Current Stats Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.totalEvents || 0}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {stats?.totalParticipants || 0}
              </div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats?.totalQuestions || 0}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-foreground">
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Insights */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Generate AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Click the button below to generate personalized insights based on your event data.
          </p>
          <Button
            onClick={handleGenerateInsights}
            disabled={insightsLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {insightsLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Insights Results */}
      {insights && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/20 border-primary/20">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-foreground flex items-center">
              <Lightbulb className="text-primary mr-2 h-5 w-5" />
              Your Personalized Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {insights.insights.map((insight: string, index: number) => (
                <div key={index} className="p-4 bg-background rounded-lg border border-primary/10">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      {index === 0 ? (
                        <Lightbulb className="text-primary h-4 w-4" />
                      ) : (
                        <TrendingUp className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {index === 0
                          ? 'Engagement Tip'
                          : index === 1
                            ? 'Performance Trend'
                            : 'Recommendation'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
