import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Custom progress component to avoid React hook issues
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-champagne-400 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import { Play, Pause, SkipForward, RotateCcw, Trophy, Users, Clock, ChevronRight, Star, ChevronUp, ChevronDown, Shield, ArrowLeft } from "lucide-react";
// Demo fallback data
import { demoEvent, demoQuestions, demoFunFacts } from "@/data/demoData";

export default function PresenterView() {
  const [, presenterParams] = useRoute("/presenter/:id");
  const [, demoParams] = useRoute("/demo/:id");
  const [, setLocation] = useLocation();
  
  // Check which route we're on and get the eventId accordingly
  const eventId = presenterParams?.id || demoParams?.id;
  
  // Redirect to home if no event ID is provided
  if (!eventId) {
    setLocation("/");
    return null;
  }

  // Add presenter-page class to body to override background
  useEffect(() => {
    document.body.classList.add('presenter-page');
    return () => {
      document.body.classList.remove('presenter-page');
    };
  }, []);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionType, setCurrentQuestionType] = useState<"training" | "game" | "tie-breaker">("training");
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameState, setGameState] = useState<"waiting" | "rules" | "practice" | "game-start" | "question" | "answer" | "leaderboard" | "tie-check" | "tie-breaker" | "wrap-up">("waiting");
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds per question
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  // Use public presenter API endpoints (no authentication required)
  const { data: apiEvent } = useQuery<any>({
    queryKey: ["/api/presenter/events", eventId],
    enabled: !!eventId,
  });

  const { data: apiQuestions } = useQuery<any[]>({
    queryKey: ["/api/presenter/events", eventId, "questions"],
    enabled: !!eventId,
  });

  const { data: apiParticipants } = useQuery<any[]>({
    queryKey: ["/api/presenter/events", eventId, "participants"],
    enabled: !!eventId,
  });

  const { data: apiTeams } = useQuery<any[]>({
    queryKey: ["/api/presenter/events", eventId, "teams"],
    enabled: !!eventId,
  });

  const { data: apiFunFacts } = useQuery<any[]>({
    queryKey: ["/api/presenter/events", eventId, "fun-facts"],
    enabled: !!eventId,
  });

  // Determine if we are on a demo route
  const isDemoRoute = !!demoParams?.id;

  // Fallback to embedded demo data if API returns nothing (e.g., static build or offline demo)
  const event = apiEvent ?? (isDemoRoute && demoEvent.id === eventId ? demoEvent : undefined);
  const questions = apiQuestions ?? (isDemoRoute && demoEvent.id === eventId ? demoQuestions : undefined);
  const participants = apiParticipants || [];
  const teams = apiTeams || [];
  const funFacts = apiFunFacts ?? (isDemoRoute && demoEvent.id === eventId ? demoFunFacts : undefined);

  // Check if participants are allowed for this event
  const allowParticipants = event?.allowParticipants ?? false;

  // Filter questions by type
  const getQuestionsByType = (type: "training" | "game" | "tie-breaker") => {
    if (!questions) return [];
    return questions
      .filter((q: any) => (q.questionType || 'game') === type)
      .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
  };

  const trainingQuestions = getQuestionsByType("training");
  const gameQuestions = getQuestionsByType("game");
  const tieBreakerQuestions = getQuestionsByType("tie-breaker");

  // Get current question set based on current question type
  const getCurrentQuestions = () => {
    switch (currentQuestionType) {
      case "training": return trainingQuestions;
      case "game": return gameQuestions;
      case "tie-breaker": return tieBreakerQuestions;
      default: return gameQuestions;
    }
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions?.[currentQuestionIndex];
  const progress = currentQuestions?.length ? ((currentQuestionIndex + 1) / currentQuestions.length) * 100 : 0;
  const timerProgress = (timeLeft / 20) * 100;

  // DEBUG: Log training questions
  console.log('Training Questions Debug:', {
    questionsLength: questions?.length,
    trainingQuestionsLength: trainingQuestions.length,
    trainingQuestions: trainingQuestions,
    currentQuestionType,
    currentQuestionIndex,
    gameState,
    currentQuestions: getCurrentQuestions(),
    currentQuestion: getCurrentQuestions()?.[currentQuestionIndex]
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (autoAdvance && gameState === "question") {
              // Auto-advance to answer when timer expires
              setTimeout(() => handleShowAnswer(), 500);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, autoAdvance, gameState]);

  // Mock leaderboard data - would be real in production
  const leaderboard = [
    { name: "SaraTeam", score: 450, rank: 1 },
    { name: "JohnTeam", score: 380, rank: 2 },
    { name: "Individual Players", score: 320, rank: 3 },
  ];

  const handleNextQuestion = () => {
    if (currentQuestions && currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setGameState("question");
      setTimeLeft(20);
      setIsTimerActive(true);
    } else {
      // End of current question set - determine next state
      if (currentQuestionType === "training") {
        // Practice complete, move to game start
        setPracticeComplete(true);
        setGameState("game-start");
        setIsTimerActive(false);
      } else if (currentQuestionType === "game") {
        // Game complete - always go to tie-check first for consistent flow
        setGameState("tie-check");
        setIsTimerActive(false);
      } else if (currentQuestionType === "tie-breaker") {
        // Tie-breakers complete, wrap up
        setGameState("wrap-up");
        setIsTimerActive(false);
      }
    }
  };

  const handleStartPractice = () => {
    if (trainingQuestions.length > 0) {
      setCurrentQuestionType("training");
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setGameState("question");
      setTimeLeft(20);
      setIsTimerActive(true);
    } else {
      // No training questions, skip to game start
      setGameState("game-start");
    }
  };

  const handleStartMainGame = () => {
    setCurrentQuestionType("game");
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setGameState("question");
    setTimeLeft(20);
    setIsTimerActive(true);
  };

  const handleStartTieBreaker = () => {
    setCurrentQuestionType("tie-breaker");
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setGameState("question");
    setTimeLeft(20);
    setIsTimerActive(true);
  };

  const handleSkipTieBreaker = () => {
    setGameState("wrap-up");
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setGameState("answer");
    setIsTimerActive(false);
  };

  const handleShowLeaderboard = () => {
    setGameState("leaderboard");
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setCurrentQuestionType("training");
    setPracticeComplete(false);
    setShowAnswer(false);
    setGameState("waiting");
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  const handleStartGame = () => {
    setGameState("rules");
  };

  const handleStartQuestions = () => {
    // Always show training questions first if they exist (regardless of completion status)
    if (trainingQuestions.length > 0) {
      setGameState("practice");
    } else {
      // No training questions, skip directly to game start
      setGameState("game-start");
    }
  };

  const handleGoBack = () => {
    switch (gameState) {
      case "rules":
        setGameState("waiting");
        break;
      case "practice":
        setGameState("rules");
        break;
      case "game-start":
        if (trainingQuestions.length > 0 && practiceComplete) {
          setGameState("practice");
        } else {
          setGameState("rules");
        }
        break;
      case "question":
      case "answer":
        if (currentQuestionType === "training") {
          setGameState("practice");
        } else if (currentQuestionType === "game") {
          setGameState("game-start");
        } else if (currentQuestionType === "tie-breaker") {
          setGameState("tie-check");
        }
        setIsTimerActive(false);
        break;
      case "leaderboard":
        if (currentQuestions && currentQuestionIndex < currentQuestions.length - 1) {
          setGameState("answer");
        } else {
          if (currentQuestionType === "training") {
            setGameState("game-start");
          } else {
            setGameState("tie-check");
          }
        }
        break;
      case "tie-check":
        setGameState("leaderboard");
        break;
      case "wrap-up":
        setGameState("tie-check");
        break;
      default:
        setGameState("waiting");
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-900 to-champagne-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <p className="text-xl">The presenter view could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-wine-900 to-champagne-900 text-white overflow-hidden">
      {/* Header - Collapsible on mobile */}
      <div className={`flex-shrink-0 border-b border-white/20 transition-all duration-300 ${isHeaderCollapsed ? 'p-2' : 'p-4 lg:p-6'}`}>
        {/* Collapsed Header - Only show when collapsed */}
        {isHeaderCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-champagne-200 truncate">
                {event.title}
              </h1>
            </div>
            <Button
              onClick={() => {
                console.log('Header collapse button clicked, current state:', isHeaderCollapsed);
                setIsHeaderCollapsed(!isHeaderCollapsed);
              }}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 p-1"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Full Header Content - Show when not collapsed */}
        {!isHeaderCollapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-champagne-200 truncate sm:hidden">
                  {event.title}
                </h1>
              </div>
              <Button
                onClick={() => {
                  console.log('Header collapse button clicked, current state:', isHeaderCollapsed);
                  setIsHeaderCollapsed(!isHeaderCollapsed);
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 p-1"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="hidden sm:block text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-champagne-200 truncate" data-testid="text-event-title">
                  {event.title}
                </h1>
                <p className="hidden sm:block text-xs sm:text-sm lg:text-xl text-white/80 truncate" data-testid="text-event-description">
                  {isDemoRoute ? "TriviaSpark Game" : event.description}
                </p>
              </div>
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 text-right flex-shrink-0">
              {allowParticipants && (
                <>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold text-champagne-300">{participants?.length || 0}</div>
                    <div className="text-xs text-white/60">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg lg:text-2xl font-bold text-champagne-300">{teams?.length || 0}</div>
                    <div className="text-xs text-white/60">Teams</div>
                  </div>
                </>
              )}
              <div className="text-center">
                <div className="text-sm sm:text-lg lg:text-2xl font-bold text-champagne-300">{questions?.length || 0}</div>
                <div className="text-xs text-white/60">Questions</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 lg:mt-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-white/60">Progress</span>
              <span className="text-xs sm:text-sm text-champagne-300">
                {gameState === "practice" || gameState === "question" ? (
                  currentQuestionType === "training" ? `Training Question ${currentQuestionIndex + 1} of ${currentQuestions?.length || 0}` :
                  currentQuestionType === "tie-breaker" ? `Tie-breaker ${currentQuestionIndex + 1} of ${currentQuestions?.length || 0}` :
                  `Question ${currentQuestionIndex + 1} of ${currentQuestions?.length || 0}`
                ) : (
                  `${questions?.length || 0} Total Questions`
                )}
              </span>
            </div>
            <SimpleProgress value={progress} className="h-2 bg-white/20" data-testid="progress-game" />
          </div>
          </>
        )}
      </div>

      {/* Main Content - Flexible height with better mobile responsiveness */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 pb-16 sm:pb-20 lg:pb-24 min-h-0">
        {gameState === "waiting" && (
          <div className="text-center w-full max-w-4xl px-4" data-testid="view-waiting">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 wine-gradient rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8">
              <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-16 lg:w-16 text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 lg:mb-4 text-champagne-200">
              {isDemoRoute ? "TriviaSpark Game" : "Welcome to Trivia!"}
            </h2>
            <p className="text-base sm:text-lg lg:text-2xl xl:text-3xl text-white/80 mb-4 sm:mb-6 lg:mb-8">
              {isDemoRoute ? "Experience our interactive trivia platform" : "Get ready for an amazing experience"}
            </p>
            <div className="text-sm sm:text-base lg:text-lg text-champagne-300">
              {isDemoRoute ? "" :
               allowParticipants ? `${participants?.length || 0} participants ready to play` :
               "Content-focused trivia experience"}
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" onClick={handleStartGame} className="bg-champagne-500 text-wine-800 hover:bg-champagne-400" data-testid="btn-start-game">
                Start
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              {trainingQuestions.length > 0 && (
                <Button variant="outline" size="lg" onClick={handleStartQuestions} className="border-champagne-300 text-champagne-200 hover:bg-white/10" data-testid="btn-practice">
                  Practice
                </Button>
              )}
            </div>
          </div>
        )}

        {gameState === "practice" && (
          <div className="text-center w-full max-w-6xl px-4" data-testid="view-practice">
            <Card className="bg-gradient-to-br from-blue-600/30 via-indigo-600/30 to-purple-600/30 backdrop-blur-sm border-blue-400/50 text-white overflow-hidden relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/10 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 -left-4 w-16 h-16 bg-purple-400/10 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute bottom-4 right-1/3 w-20 h-20 bg-indigo-400/10 rounded-full animate-pulse delay-2000"></div>
              </div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Star className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-yellow-900">🎯</span>
                    </div>
                  </div>
                </div>
                <CardTitle className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  🚀 Training Academy
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6 sm:space-y-8 relative z-10">
                {/* Welcome Message */}
                <div className="text-center space-y-4">
                  <div className="inline-block bg-blue-500/20 px-6 py-3 rounded-full border border-blue-400/30">
                    <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 font-medium">
                      🎓 Welcome to Trivia Training!
                    </p>
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                    Before we dive into the main event, let's get you comfortable with our trivia format. 
                    These interactive training questions will teach you everything you need to know!
                  </p>
                </div>

                {/* Training Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-300 mb-2">{trainingQuestions.length}</div>
                    <div className="text-sm sm:text-base text-cyan-100">Training Questions</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl p-4 border border-indigo-400/30">
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-300 mb-2">20s</div>
                    <div className="text-sm sm:text-base text-indigo-100">Per Question</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl p-4 border border-purple-400/30">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">0</div>
                    <div className="text-sm sm:text-base text-purple-100">Points (Practice)</div>
                  </div>
                </div>

                {/* Training Objectives */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-blue-400/30 max-w-4xl mx-auto">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-400/30">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-200 flex items-center">
                        🎯 What You'll Learn
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-green-400 text-sm">✓</span>
                      </div>
                      <div>
                        <div className="font-semibold text-green-200 mb-1">Question Format</div>
                        <div className="text-sm text-green-100/80">How questions appear and how to read them effectively</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-blue-400 text-sm">⏱</span>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-200 mb-1">Timing System</div>
                        <div className="text-sm text-blue-100/80">Master the 30-second countdown and pacing</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-purple-400 text-sm">💡</span>
                      </div>
                      <div>
                        <div className="font-semibold text-purple-200 mb-1">Answer Explanations</div>
                        <div className="text-sm text-purple-100/80">Learn from detailed explanations after each question</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-orange-400 text-sm">🎮</span>
                      </div>
                      <div>
                        <div className="font-semibold text-orange-200 mb-1">Interface Navigation</div>
                        <div className="text-sm text-orange-100/80">Get comfortable with buttons and controls</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Encouragement Message */}
                <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 rounded-xl p-4 sm:p-6 border border-green-400/30 max-w-3xl mx-auto">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <span className="text-2xl">🌟</span>
                    <h4 className="text-lg sm:text-xl font-bold text-green-200">Ready to Become a Trivia Pro?</h4>
                    <span className="text-2xl">🌟</span>
                  </div>
                  <p className="text-sm sm:text-base text-green-100/90 text-center leading-relaxed">
                    Don't worry if you're new to trivia! These training questions are designed to be fun and educational. 
                    Take your time, read carefully, and remember - this is just practice!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "game-start" && (
          <div className="text-center w-full max-w-4xl px-4" data-testid="view-game-start">
            <Card className="bg-green-600/30 backdrop-blur-sm border-green-400/50 text-white">
              <CardHeader>
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 text-green-200">
                  Ready to Play!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  {practiceComplete && (
                    <p className="text-base sm:text-lg lg:text-xl text-green-200 font-semibold">
                      ✅ Training complete!
                    </p>
                  )}
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                    Time for the main trivia game
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-green-200">
                    {gameQuestions.length} questions • Scoring begins now!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "tie-check" && (
          <div className="text-center w-full max-w-4xl px-4" data-testid="view-tie-check">
            <Card className="bg-yellow-600/30 backdrop-blur-sm border-yellow-400/50 text-white">
              <CardHeader>
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 text-yellow-200">
                  Game Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                    Check the scores manually
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-yellow-200">
                    Do you need tie-breaker questions?
                  </p>
                  {tieBreakerQuestions.length > 0 && (
                    <p className="text-xs sm:text-sm lg:text-base text-white/80">
                      {tieBreakerQuestions.length} tie-breaker questions available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "wrap-up" && (
          <div className="text-center w-full max-w-4xl px-4" data-testid="view-wrap-up">
            <Card className="bg-wine-600/30 backdrop-blur-sm border-wine-400/50 text-white">
              <CardHeader>
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-wine-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-yellow-400" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 text-wine-200">
                  Thank You!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                    {event?.thankYouMessage || "Thanks for playing our trivia event!"}
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg text-wine-200">
                    Hope you had a great time! 🎉
                  </p>
                  {event?.sponsoringOrganization && (
                    <p className="text-xs sm:text-sm lg:text-base text-white/80">
                      Presented by {event.sponsoringOrganization}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "rules" && (
          <div className="flex-1 flex items-center justify-center w-full max-w-6xl px-4 py-2 min-h-0" data-testid="view-rules">
            <Card className="bg-gradient-to-br from-wine-800/60 via-wine-700/40 to-wine-900/70 backdrop-blur-lg border-0 text-white shadow-2xl w-full h-full max-h-full overflow-hidden flex flex-col">
              <CardHeader className="pb-2 text-center flex-shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-champagne-400 to-champagne-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Shield className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-wine-900" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 text-champagne-200 drop-shadow-lg">
                  Contest Rules
                </CardTitle>
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-champagne-300/80 font-medium">
                  Follow these guidelines for a fair and fun experience
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pb-4">
                <div className="text-left max-w-4xl mx-auto space-y-2 sm:space-y-3 lg:space-y-4 h-full flex flex-col justify-center">
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      1
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      <strong className="text-champagne-300">No internet searches!!!</strong> <span className="text-white/80">(Remember the 4-way test...)</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      2
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      <strong className="text-champagne-300">20 seconds per question</strong> <span className="text-white/80">allowed for a team answer.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      3
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      Write your <strong className="text-champagne-300">letter answer</strong> <span className="text-white/80">on your whiteboard.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      4
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      Keep your <strong className="text-champagne-300">correct answer held high</strong> <span className="text-white/80">until scorekeeper has acknowledged it.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      5
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      <strong className="text-champagne-300">Erase and repeat.</strong>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-5 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-200/50">
                      6
                    </div>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-white leading-tight mt-0.5 lg:mt-1">
                      Leave your <strong className="text-champagne-300">marker, eraser and whiteboard</strong> <span className="text-white/80">on your table when we finish.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-5 lg:p-6 rounded-xl bg-gradient-to-r from-champagne-600/25 to-champagne-500/20 transform hover:scale-[1.01] transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-champagne-200 via-champagne-300 to-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl font-bold text-wine-900 text-lg sm:text-xl lg:text-2xl ring-2 ring-champagne-100/60">
                      7
                    </div>
                    <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-champagne-200 leading-tight font-bold mt-0.5 lg:mt-1 drop-shadow-sm">
                      Have fun! 🎉✨
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "question" && currentQuestion && (
          <div className="w-full h-full flex flex-col min-h-0" data-testid="view-question">
            <Card className="bg-white/20 backdrop-blur-sm border-white/40 text-white flex-1 flex flex-col relative min-h-0 h-full">
              {currentQuestion.backgroundImageUrl && (
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${currentQuestion.backgroundImageUrl})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/75"></div>
                </div>
              )}
              <CardHeader className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg sm:text-xl lg:text-3xl text-white drop-shadow-lg">
                    {currentQuestionType === "training" ? `Training Question ${currentQuestionIndex + 1}` :
                     currentQuestionType === "tie-breaker" ? `Tie-breaker ${currentQuestionIndex + 1}` :
                     `Question ${currentQuestionIndex + 1}`}
                  </CardTitle>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="text-right">
                      <div className={`text-2xl sm:text-4xl font-bold ${
                        timeLeft <= 10 ? 'text-red-400 animate-pulse' : 
                        timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400'
                      }`} data-testid="text-timer">
                        {timeLeft}s
                      </div>
                      <div className="w-16 sm:w-24">
                        <SimpleProgress 
                          value={timerProgress} 
                          className={`h-2 ${
                            timeLeft <= 10 ? 'bg-red-200' : 
                            timeLeft <= 20 ? 'bg-yellow-200' : 'bg-green-200'
                          }`} 
                        />
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-champagne-200 text-champagne-900 text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col relative z-10 min-h-0 p-2 sm:p-4 lg:p-6">
                <div className="flex flex-col h-full min-h-0 gap-3 sm:gap-4 lg:gap-6">
                  {/* Question Text */}
                  <div className="flex-shrink-0">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 lg:p-6 xl:p-8 border border-white/20">
                      <h3 className={`font-bold leading-tight text-white break-words text-center ${
                        currentQuestion.question.length > 120 
                          ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl' 
                          : currentQuestion.question.length > 80 
                          ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'
                          : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
                      }`} data-testid="text-current-question">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Answer Options */}
                  {currentQuestion.options && (
                    <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
                      <div className="w-full max-w-6xl mx-auto h-full flex items-center">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
                          {currentQuestion.options.map((option: string, index: number) => (
                            <div
                              key={index}
                              className={`p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 rounded-xl border-2 min-h-[4rem] sm:min-h-[5rem] md:min-h-[6rem] lg:min-h-[7rem] xl:min-h-[8rem] ${
                                showAnswer && option === currentQuestion.correctAnswer
                                  ? 'bg-green-600 border-green-400 text-white shadow-xl'
                                  : 'bg-gray-800/90 border-gray-600 hover:bg-gray-700/90 text-white'
                              } transition-all duration-300 flex items-center`}
                              data-testid={`option-${index}`}
                            >
                              <div className="flex items-center w-full gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full bg-champagne-200 text-champagne-900 font-bold flex items-center justify-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0 shadow-lg">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-medium text-white break-words flex-1 leading-tight">
                                  {option}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "answer" && currentQuestion && (
          <div className="w-full max-w-7xl h-full flex flex-col space-y-2 sm:space-y-4 lg:space-y-8 overflow-auto min-h-0" data-testid="view-answer">
            {/* Answer Section at Top */}
            <Card className="bg-white/20 backdrop-blur-sm border-white/40 text-white flex-shrink-0">
              <CardContent className="py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 lg:gap-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-500 rounded-full flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-green-300">Correct Answer</h3>
                  </div>
                  <div className="flex items-center justify-center text-center">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white break-words" data-testid="text-correct-answer">
                      {(() => {
                        // Find the index of the correct answer in the options array
                        const correctIndex = currentQuestion.options?.indexOf(currentQuestion.correctAnswer) ?? -1;
                        const answerLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '';
                        return answerLetter ? `${answerLetter}. ${currentQuestion.correctAnswer}` : currentQuestion.correctAnswer;
                      })()}
                    </p>
                  </div>
                </div>
                {currentQuestion.explanation && (
                  <div className="mt-3 sm:mt-4 lg:mt-6 text-center">
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed break-words px-2">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fun Fact Section at Bottom */}
            {funFacts && funFacts.length > 0 && (
              <Card className="bg-champagne-600/20 backdrop-blur-sm border-champagne-400/30 text-white flex-1 min-h-0">
                <CardContent className="text-center py-3 sm:py-4 lg:py-8 h-full flex flex-col justify-center overflow-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-champagne-500 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-4">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-champagne-900" />
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 lg:mb-4 text-champagne-200">Fun Fact!</h4>
                  {(() => {
                    // Cycle through fun facts based on current question index
                    const funFact = funFacts[currentQuestionIndex % funFacts.length];
                    return (
                      <div className="overflow-auto">
                        <h5 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-champagne-100 break-words">{funFact.title}</h5>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-white/90 max-w-5xl mx-auto leading-relaxed break-words px-2">
                          {funFact.content}
                        </p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {gameState === "leaderboard" && allowParticipants && (
          <div className="w-full max-w-5xl h-full flex flex-col px-2 sm:px-4" data-testid="view-leaderboard">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl sm:text-2xl lg:text-4xl text-center flex items-center justify-center">
                  <Trophy className="mr-2 lg:mr-4 h-5 w-5 sm:h-6 sm:w-6 lg:h-10 lg:w-10 text-yellow-400" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center overflow-auto min-h-0">
                <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.name}
                      className={`flex items-center justify-between p-2 sm:p-4 lg:p-6 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-400' :
                        index === 1 ? 'bg-gray-300/20 border-2 border-gray-400' :
                        index === 2 ? 'bg-amber-600/20 border-2 border-amber-600' :
                        'bg-white/5 border border-white/20'
                      }`}
                      data-testid={`leaderboard-entry-${index}`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg lg:text-xl mr-2 sm:mr-3 lg:mr-4 flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-amber-100' :
                          'bg-white/20 text-white'
                        }`}>
                          {entry.rank}
                        </div>
                        <span className="text-sm sm:text-lg lg:text-2xl font-semibold truncate">{entry.name}</span>
                      </div>
                      <span className="text-lg sm:text-xl lg:text-3xl font-bold text-champagne-300 flex-shrink-0">
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "leaderboard" && !allowParticipants && (
          <div className="w-full max-w-4xl text-center px-4" data-testid="view-game-complete">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl lg:text-5xl text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-yellow-400 sm:mr-2 lg:mr-4" />
                  Game Complete!
                </CardTitle>
                <div className="text-base sm:text-lg lg:text-xl text-champagne-300 mt-4 break-words">
                  Thanks for playing! Great job on completing the trivia questions.
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>

      {/* Control Panel - Fixed bottom with better mobile responsiveness */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-1 sm:p-2 lg:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto">
          {gameState === "waiting" && (
            <>
              <Button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-game"
              >
                <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Game
              </Button>
            </>
          )}

          {gameState === "rules" && (
            <>
              <Button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-back-rules"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </Button>
              <Button
                onClick={handleStartQuestions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-questions"
              >
                <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Let's Play!
              </Button>
            </>
          )}

          {gameState === "practice" && (
            <>
              <Button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-back-practice"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </Button>
              <Button
                onClick={handleStartPractice}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 lg:px-12 py-3 lg:py-5 text-base sm:text-lg lg:text-xl font-bold flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-blue-400/30"
                data-testid="button-start-practice"
              >
                <Star className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                🚀 Begin Training Academy
              </Button>
            </>
          )}

          {gameState === "game-start" && (
            <>
              <Button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-back-game-start"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </Button>
              <Button
                onClick={handleStartMainGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-main-game"
              >
                <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Start Main Game
              </Button>
            </>
          )}

          {gameState === "tie-check" && (
            <>
              {tieBreakerQuestions.length > 0 && (
                <Button
                  onClick={handleStartTieBreaker}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                  data-testid="button-start-tie-breaker"
                >
                  <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Tie-breakers
                </Button>
              )}
              <Button
                onClick={handleSkipTieBreaker}
                className="bg-wine-600 hover:bg-wine-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-skip-tie-breaker"
              >
                <ChevronRight className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                No Ties - Finish
              </Button>
            </>
          )}

          {gameState === "wrap-up" && (
            <>
              <Button
                onClick={handleRestart}
                className="bg-wine-600 hover:bg-wine-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-finish-event"
              >
                <RotateCcw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                New Event
              </Button>
            </>
          )}

          {gameState === "question" && (
            <>
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className={`text-lg sm:text-2xl font-bold ${
                  timeLeft <= 10 ? 'text-red-400' : 
                  timeLeft <= 20 ? 'text-yellow-400' : 'text-white'
                }`}>
                  <span className="hidden sm:inline">Time: </span>{timeLeft}s
                </div>
                <Button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 border p-2"
                  data-testid="button-toggle-timer"
                >
                  {isTimerActive ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg flex-shrink-0"
                data-testid="button-back-question"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Back
              </Button>
              <Button
                onClick={handleShowAnswer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg flex-shrink-0"
                data-testid="button-show-answer"
              >
                Show Answer
              </Button>
              {allowParticipants && (
                <Button
                  onClick={handleShowLeaderboard}
                  className="bg-wine-700 hover:bg-wine-600 text-white border border-wine-500 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base flex-shrink-0"
                  data-testid="button-show-leaderboard"
                >
                  <Trophy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Show </span>Leaderboard
                </Button>
              )}
            </>
          )}

          {gameState === "answer" && (
            <>
              <Button
                onClick={handleNextQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg font-semibold flex-shrink-0"
                data-testid="button-next-question"
              >
                <ChevronRight className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {currentQuestions && currentQuestionIndex >= currentQuestions.length - 1 ? (
                  currentQuestionType === "training" ? "Start Game" :
                  currentQuestionType === "tie-breaker" ? "Finish" :
                  allowParticipants ? "View Results" : "Check Ties"
                ) : "Next"}
              </Button>
              {allowParticipants && (
                <Button
                  onClick={handleShowLeaderboard}
                  className="bg-wine-700 hover:bg-wine-600 text-white border border-wine-500 px-2 sm:px-6 py-2 sm:py-3 text-xs sm:text-base flex-shrink-0"
                  data-testid="button-show-leaderboard-from-answer"
                >
                  <Trophy className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Show </span>Leaderboard
                </Button>
              )}
              <Button
                onClick={() => setAutoAdvance(!autoAdvance)}
                size="sm"
                className="bg-champagne-700 hover:bg-champagne-600 text-white border border-champagne-500 px-2 py-1 text-xs flex-shrink-0"
                data-testid="button-toggle-auto"
              >
                Auto: {autoAdvance ? "ON" : "OFF"}
              </Button>
            </>
          )}

          {gameState === "leaderboard" && (
            <>
              {currentQuestions && currentQuestionIndex < currentQuestions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg font-semibold border border-blue-500 flex-shrink-0"
                  data-testid="button-continue-from-leaderboard"
                >
                  <ChevronRight className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  className="bg-wine-600 hover:bg-wine-700 text-white px-4 sm:px-8 py-2 sm:py-4 text-sm sm:text-lg font-semibold border border-wine-500 flex-shrink-0"
                  data-testid="button-restart-game"
                >
                  <RotateCcw className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Complete
                </Button>
              )}
            </>
          )}

          {/* Always available controls - Responsive */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-8 flex-shrink-0">
            <Button
              onClick={handleRestart}
              size="sm"
              className="bg-red-700 hover:bg-red-600 text-white border border-red-500 p-1 sm:p-2"
              data-testid="button-reset"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              onClick={handleShowLeaderboard}
              size="sm"
              className="bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-500 p-1 sm:p-2"
              data-testid="button-leaderboard"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}