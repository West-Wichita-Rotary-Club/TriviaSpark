import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardStats from '@/components/stats/dashboard-stats';
import EventGenerator from '@/components/ai/event-generator';
import QuestionGenerator from '@/components/ai/question-generator';
import ActiveEvents from '@/components/events/active-events';
import RecentEvents from '@/components/events/recent-events';
import PastEvents from '@/components/events/past-events';
import UpcomingEvents from '@/components/events/upcoming-events';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, QrCode, Copy, Calendar, Database, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to change password');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'New password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Password Change Banner */}
        {user?.passwordChangeRequired && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Password change required
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  You are using a default password. Please change it to secure your account.
                </p>
              </div>
              {!showPasswordForm && (
                <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
                  Change Password
                </Button>
              )}
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-4 space-y-3 max-w-md">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? 'Changing...' : 'Update Password'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="welcome-heading">
              Welcome to TriviaSpark!
            </h2>
            <p className="text-muted-foreground" data-testid="welcome-description">
              Create unforgettable trivia experiences with AI-powered content generation
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <DashboardStats stats={stats} isLoading={statsLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Creation */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Event Generator */}
            <EventGenerator />

            {/* Question Generator */}
            <QuestionGenerator />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                data-testid="card-qr-event"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <QrCode className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h4
                        className="text-lg font-semibold text-foreground"
                        data-testid="text-qr-title"
                      >
                        Quick QR Event
                      </h4>
                      <p
                        className="text-muted-foreground text-sm"
                        data-testid="text-qr-description"
                      >
                        Start instant trivia
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                    data-testid="button-create-qr"
                  >
                    Create QR Code
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                data-testid="card-clone-event"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mr-4">
                      <Copy className="text-secondary-foreground h-6 w-6" />
                    </div>
                    <div>
                      <h4
                        className="text-lg font-semibold text-foreground"
                        data-testid="text-clone-title"
                      >
                        Clone Event
                      </h4>
                      <p
                        className="text-muted-foreground text-sm"
                        data-testid="text-clone-description"
                      >
                        Reuse successful events
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-secondary/50 text-secondary-foreground hover:bg-secondary/70"
                    data-testid="button-browse-templates"
                  >
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                data-testid="card-database-analyzer"
                onClick={() => setLocation('/database-analyzer')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mr-4">
                      <Database className="text-accent-foreground h-6 w-6" />
                    </div>
                    <div>
                      <h4
                        className="text-lg font-semibold text-foreground"
                        data-testid="text-db-analyzer-title"
                      >
                        Database Analyzer
                      </h4>
                      <p
                        className="text-muted-foreground text-sm"
                        data-testid="text-db-analyzer-description"
                      >
                        Explore database tables
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/80"
                    data-testid="button-analyze-db"
                  >
                    Analyze Database
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Event Management */}
          <div className="space-y-6">
            {/* Active Events */}
            <ActiveEvents />

            {/* Upcoming Events */}
            <UpcomingEvents />

            {/* Past Events */}
            <PastEvents />

            {/* Recent Events */}
            <RecentEvents />
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl"
            data-testid="button-mobile-fab"
          >
            <Calendar className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
