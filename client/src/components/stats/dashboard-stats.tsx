import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Brain, Star } from "lucide-react";

interface DashboardStatsProps {
  stats?: {
    totalEvents: number;
    totalParticipants: number;
    totalQuestions: number;
    averageRating: number;
  };
  isLoading?: boolean;
}

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="trivia-card animate-pulse" data-testid={`stat-loading-${i}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Events Hosted",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      iconColor: "bg-wine-100 text-wine-700",
      testId: "stat-events",
    },
    {
      title: "Total Participants",
      value: stats?.totalParticipants || 0,
      icon: Users,
      iconColor: "bg-champagne-100 text-champagne-600",
      testId: "stat-participants",
    },
    {
      title: "AI Questions Generated",
      value: stats?.totalQuestions || 0,
      icon: Brain,
      iconColor: "bg-emerald-100 text-emerald-600",
      testId: "stat-questions",
    },
    {
      title: "Avg. Rating",
      value: stats?.averageRating || 0,
      icon: Star,
      iconColor: "bg-coral-100 text-coral-500",
      testId: "stat-rating",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={index} className="trivia-card" data-testid={stat.testId}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.iconColor} rounded-lg flex items-center justify-center mr-4`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-wine-900" data-testid={`${stat.testId}-value`}>
                    {stat.title === "Avg. Rating" ? stat.value.toFixed(1) : stat.value}
                  </p>
                  <p className="text-wine-700 text-sm" data-testid={`${stat.testId}-label`}>
                    {stat.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
