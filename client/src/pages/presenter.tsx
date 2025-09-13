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
import { Play, Pause, RotateCcw, Trophy, ChevronRight, Star, ChevronUp, ChevronDown, ArrowLeft, Maximize, Minimize } from "lucide-react";
// Seed event fallback data
import { demoEvent, demoQuestions, demoFunFacts } from "@/data/demoData";

export default function PresenterView() {
  const [, presenterParams] = useRoute("/presenter/:id");
  const [, setLocation] = useLocation();
  
  // Check which route we're on and get the eventId accordingly
  const eventId = presenterParams?.id;
  
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
  const [gameState, setGameState] = useState<"waiting" | "rules" | "training" | "game-start" | "question" | "answer" | "tie-check" | "tie-breaker" | "wrap-up">("waiting");
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds per question
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use single hydrated API endpoint that returns event with all child attributes
  const { data: hydratedEvent } = useQuery<any>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId, // Always make API call for presenter routes
  });

  // Extract data from hydrated response or fallback to seed data for the seed event
  const event = hydratedEvent ?? (demoEvent.id === eventId ? demoEvent : undefined);
  const questions = hydratedEvent?.questions ?? (demoEvent.id === eventId ? demoQuestions : undefined);
  const funFacts = hydratedEvent?.funFacts ?? (demoEvent.id === eventId ? demoFunFacts : undefined);

  // Check if this is the seed event (for seed data purposes)
  const isSeedEvent = eventId === demoEvent.id;

  // Filter questions by type and normalize API response format
  const getQuestionsByType = (type: "training" | "game" | "tie-breaker") => {
    if (!questions) return [];
    return questions
      .filter((q: any) => (q.questionType || 'game') === type)
      .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((q: any) => ({
        ...q,
        // Normalize API response format to match seed data format
        question: q.questionText || q.question,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
      }));
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

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      // Sync header collapse state with fullscreen state
      setIsHeaderCollapsed(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        // Hide header when entering fullscreen
        setIsHeaderCollapsed(true);
      } else {
        await document.exitFullscreen();
        // Show header when exiting fullscreen
        setIsHeaderCollapsed(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setCurrentQuestionType("training");
    setPracticeComplete(false);
    setShowAnswer(false);
    setGameState("waiting");
    setTimeLeft(20);
    setIsTimerActive(false);
  };

  const handleStartGame = () => {
    setGameState("rules");
  };

  const handleStartQuestions = () => {
    // Always show training questions first if they exist
    if (trainingQuestions.length > 0) {
      setGameState("training");
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
      case "training":
        setGameState("rules");
        break;
      case "game-start":
        if (trainingQuestions.length > 0 && practiceComplete) {
          setGameState("training");
        } else {
          setGameState("rules");
        }
        break;
      case "question":
      case "answer":
        if (currentQuestionType === "training") {
          setGameState("training");
        } else if (currentQuestionType === "game") {
          setGameState("tie-check");
        } else if (currentQuestionType === "tie-breaker") {
          setGameState("wrap-up");
        }
        setIsTimerActive(false);
        break;
      case "tie-check":
        setGameState("answer");
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
      <div className={`flex-shrink-0 border-b border-white/20 transition-all duration-300 ${isHeaderCollapsed ? 'p-2' : 'p-4'}`}>
        {/* Collapsed Header - Only show when collapsed */}
        {isHeaderCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-champagne-200 truncate">
              {event.title}
            </h1>
            <Button
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Full Header Content - Show when not collapsed */}
        {!isHeaderCollapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-bold text-champagne-200 truncate sm:hidden">
                {event.title}
              </h1>
              <Button
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="hidden sm:block text-2xl lg:text-4xl font-bold text-champagne-200 truncate" data-testid="text-event-title">
                  {event.title}
                </h1>
                <p className="hidden sm:block text-sm lg:text-lg text-white/80 truncate" data-testid="text-event-description">
                  {isSeedEvent ? "TriviaSpark Game" : event.description}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-right flex-shrink-0">
                <div className="text-center">
                  <div className="text-lg font-bold text-champagne-300">{questions?.length || 0}</div>
                  <div className="text-xs text-white/60">Questions</div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Progress</span>
                <span className="text-sm text-champagne-300">
                  {gameState === "question" ? (
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
      <div className="flex-1 flex items-center justify-center p-4 pb-20 min-h-0">
        {gameState === "waiting" && (
          <div className="text-center w-full max-w-4xl px-4" data-testid="view-waiting">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4 text-champagne-200">
              {isSeedEvent ? "TriviaSpark Game" : "Welcome to Trivia!"}
            </h2>
            <p className="text-lg lg:text-2xl text-white/80 mb-6">
              {isSeedEvent ? "Experience our interactive trivia platform" : "Get ready for an amazing experience"}
            </p>
            <div className="text-base text-champagne-300">
              {isSeedEvent ? "" : "Content-focused trivia experience"}
            </div>
          </div>
        )}

        {gameState === "training" && (
          <div className="w-full max-w-6xl px-4" data-testid="view-training">
            <Card className="bg-blue-900/90 backdrop-blur-sm border-blue-400 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
                  🎓 Training
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="text-center space-y-6">
                  <div className="bg-blue-600 px-6 py-4 rounded-lg border border-blue-300">
                    <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold">
                      🎯 Practice Round - Get Ready!
                    </p>
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed max-w-4xl mx-auto">
                    Time for a quick practice round! These training questions will help you warm up and 
                    get comfortable with the trivia format before the main game begins.
                  </p>
                </div>
                <div className="bg-green-700/80 rounded-lg p-6 border border-green-400 max-w-5xl mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-2xl lg:text-3xl">🎯</span>
                    <h4 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Training Goals</h4>
                    <span className="text-2xl lg:text-3xl">🎯</span>
                  </div>
                  <p className="text-base md:text-lg lg:text-xl text-white text-center leading-relaxed">
                    Use these questions to practice the format, timing, and mechanics before the real game starts. 
                    No points will be scored - this is just to help everyone get comfortable!
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
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <CardTitle className="text-3xl lg:text-5xl font-bold mb-4 text-green-200">
                  Ready to Play!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  {practiceComplete && (
                    <p className="text-lg lg:text-xl text-green-200 font-semibold">
                      ✅ Training complete!
                    </p>
                  )}
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    Time for the main trivia game
                  </p>
                  <p className="text-base lg:text-lg text-green-200">
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
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <CardTitle className="text-3xl lg:text-5xl font-bold mb-4 text-yellow-200">
                  Game Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    Check the scores manually
                  </p>
                  <p className="text-base lg:text-lg text-yellow-200">
                    Do you need tie-breaker questions?
                  </p>
                  {tieBreakerQuestions.length > 0 && (
                    <p className="text-sm lg:text-base text-white/80">
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
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-wine-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 lg:h-12 lg:w-12 text-yellow-400" />
                </div>
                <CardTitle className="text-3xl lg:text-5xl font-bold mb-4 text-wine-200">
                  Thank You!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                    {event?.thankYouMessage || "Thanks for playing our trivia event!"}
                  </p>
                  <p className="text-base lg:text-lg text-wine-200">
                    Hope you had a great time! 🎉
                  </p>
                  {event?.sponsoringOrganization && (
                    <p className="text-sm lg:text-base text-white/80">
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
            <Card className="bg-gradient-to-br from-wine-800/60 via-wine-700/40 to-wine-900/70 backdrop-blur-lg border-0 text-white shadow-2xl w-full h-full overflow-hidden flex flex-col">
              <CardHeader className="pb-2 text-center flex-shrink-0">
                <CardTitle className="text-2xl lg:text-3xl font-bold mb-1 text-champagne-200 drop-shadow-lg">
                  Contest Rules
                </CardTitle>
                <p className="text-base lg:text-lg text-champagne-300/80 font-medium">
                  Follow these guidelines for a fair and fun experience
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="text-left max-w-4xl mx-auto space-y-3 h-full flex flex-col justify-center">
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      1
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      <strong className="text-champagne-300">No internet searches!!!</strong> <span className="text-white/80">(Remember the 4-way test...)</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      2
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      <strong className="text-champagne-300">20 seconds per question</strong> <span className="text-white/80">allowed for a team answer.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      3
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      Write your <strong className="text-champagne-300">letter answer</strong> <span className="text-white/80">on your whiteboard.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      4
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      Keep your <strong className="text-champagne-300">correct answer held high</strong> <span className="text-white/80">until scorekeeper has acknowledged it.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      5
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      <strong className="text-champagne-300">Erase and repeat.</strong>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 lg:p-4 rounded-xl bg-wine-700/30 hover:bg-wine-600/40 transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-300 via-champagne-400 to-champagne-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-200/50">
                      6
                    </div>
                    <p className="text-base lg:text-lg text-white leading-tight mt-1">
                      Leave your <strong className="text-champagne-300">marker, eraser and whiteboard</strong> <span className="text-white/80">on your table when we finish.</span>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-champagne-600/25 to-champagne-500/20 transform hover:scale-[1.01] transition-all duration-300">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-champagne-200 via-champagne-300 to-champagne-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl font-bold text-wine-900 text-base lg:text-lg ring-2 ring-champagne-100/60">
                      7
                    </div>
                    <p className="text-lg lg:text-xl text-champagne-200 leading-tight font-bold mt-1 drop-shadow-sm">
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
                  style={{ backgroundImage: `url(${currentQuestion.backgroundImageUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/75"></div>
                </div>
              )}
              <CardHeader className="relative z-10 flex-shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-xl lg:text-3xl text-white drop-shadow-lg">
                    {currentQuestionType === "training" ? `Training Question ${currentQuestionIndex + 1}` :
                     currentQuestionType === "tie-breaker" ? `Tie-breaker ${currentQuestionIndex + 1}` :
                     `Question ${currentQuestionIndex + 1}`}
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${
                        timeLeft <= 10 ? 'text-red-400 animate-pulse' : 
                        timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400'
                      }`} data-testid="text-timer">
                        {timeLeft}s
                      </div>
                      <div className="w-24">
                        <SimpleProgress 
                          value={timerProgress} 
                          className={`h-2 ${
                            timeLeft <= 10 ? 'bg-red-200' : 
                            timeLeft <= 20 ? 'bg-yellow-200' : 'bg-green-200'
                          }`} 
                        />
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-champagne-200 text-champagne-900 text-lg px-4 py-2">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col relative z-10 min-h-0 p-4 lg:p-6">
                <div className="flex flex-col h-full min-h-0 gap-4 lg:gap-6">
                  {/* Question Text */}
                  <div className="flex-shrink-0">
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 border border-white/20">
                      <h3 className={`font-bold leading-tight text-white break-words text-center ${
                        currentQuestion.question.length > 120 
                          ? 'text-2xl lg:text-4xl' 
                          : currentQuestion.question.length > 80 
                          ? 'text-3xl lg:text-5xl'
                          : 'text-4xl lg:text-6xl'
                      }`} data-testid="text-current-question">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Answer Options */}
                  {currentQuestion.options && (
                    <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
                      <div className="w-full max-w-6xl mx-auto h-full flex items-center">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                          {currentQuestion.options.map((option: string, index: number) => (
                            <div
                              key={index}
                              className={`p-6 lg:p-8 rounded-xl border-2 min-h-[5rem] lg:min-h-[8rem] ${
                                showAnswer && option === currentQuestion.correctAnswer
                                  ? 'bg-green-600 border-green-400 text-white shadow-xl'
                                  : 'bg-gray-800/90 border-gray-600 hover:bg-gray-700/90 text-white'
                              } transition-all duration-300 flex items-center`}
                              data-testid={`option-${index}`}
                            >
                              <div className="flex items-center w-full gap-4 lg:gap-6">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-champagne-200 text-champagne-900 font-bold flex items-center justify-center text-2xl lg:text-4xl flex-shrink-0 shadow-lg">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <span className="text-2xl lg:text-4xl font-medium text-white break-words flex-1 leading-tight">
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
          <div className="w-full max-w-7xl h-full flex flex-col gap-6 overflow-auto" data-testid="view-answer">
            {/* Answer Section at Top */}
            <Card className="bg-white/20 backdrop-blur-sm border-white/40 text-white">
              <CardContent className="py-6">
                <div className="flex flex-col gap-6">
                  <div className="text-center">
                    <h3 className="text-xl lg:text-3xl font-bold text-green-300">Correct Answer</h3>
                  </div>
                  <div className="text-center flex items-center justify-center w-full">
                    <div className="w-full max-w-6xl">
                      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white break-words leading-tight px-4" data-testid="text-correct-answer">
                        {(() => {
                          const correctIndex = currentQuestion.options?.indexOf(currentQuestion.correctAnswer) ?? -1;
                          const answerLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '';
                          const questionNumber = currentQuestionIndex + 1;
                          return answerLetter ? `${questionNumber}.${answerLetter} ${currentQuestion.correctAnswer}` : currentQuestion.correctAnswer;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
                {currentQuestion.explanation && (
                  <div className="mt-8 text-center">
                    <p className="text-xl lg:text-2xl xl:text-3xl text-white/80 max-w-6xl mx-auto leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fun Fact Section at Bottom */}
            {funFacts && funFacts.length > 0 && (
              <Card className="bg-champagne-600/20 backdrop-blur-sm border-champagne-400/30 text-white flex-1">
                <CardContent className="text-center py-4 lg:py-8 h-full flex flex-col justify-center">
                  {(() => {
                    const funFact = funFacts[currentQuestionIndex % funFacts.length];
                    return (
                      <div className="space-y-2 lg:space-y-4">
                        <h4 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-champagne-200">
                          Fun Fact: <span className="text-champagne-100">{funFact.title}</span>
                        </h4>
                        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed px-4">
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
      </div>

      {/* Control Panel - Fixed bottom with better mobile responsiveness */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-2 lg:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between space-x-2 lg:space-x-4 overflow-x-auto">
          {/* Left side - Back buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {(gameState === "rules" || gameState === "training" || gameState === "game-start" || gameState === "question") && (
              <Button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-semibold flex-shrink-0"
                data-testid={`button-back-${gameState}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          {/* Center - Main action buttons */}
          <div className="flex items-center justify-center space-x-2 lg:space-x-4 flex-1">
            {gameState === "waiting" && (
              <Button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-game"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            )}

            {gameState === "rules" && (
              <Button
                onClick={handleStartQuestions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-questions"
              >
                <Play className="mr-2 h-5 w-5" />
                Let's Play!
              </Button>
            )}

            {gameState === "training" && (
              <Button
                onClick={handleStartPractice}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 lg:px-12 py-3 lg:py-5 text-lg lg:text-xl font-bold flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-blue-400/30"
                data-testid="button-start-training"
              >
                <Star className="mr-3 h-6 w-6 animate-pulse" />
                🎯 Start Training
              </Button>
            )}

            {gameState === "game-start" && (
              <Button
                onClick={handleStartMainGame}
                className="bg-green-600 hover:bg-green-700 text-white px-6 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-start-main-game"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Main Game
              </Button>
            )}

            {gameState === "tie-check" && (
              <>
                {tieBreakerQuestions.length > 0 && (
                  <Button
                    onClick={handleStartTieBreaker}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                    data-testid="button-start-tie-breaker"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Tie-breakers
                  </Button>
                )}
                <Button
                  onClick={handleSkipTieBreaker}
                  className="bg-wine-600 hover:bg-wine-700 text-white px-6 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                  data-testid="button-skip-tie-breaker"
                >
                  <ChevronRight className="mr-2 h-5 w-5" />
                  No Ties - Finish
                </Button>
              </>
            )}

            {gameState === "wrap-up" && (
              <Button
                onClick={handleRestart}
                className="bg-wine-600 hover:bg-wine-700 text-white px-6 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold flex-shrink-0"
                data-testid="button-finish-event"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                New Event
              </Button>
            )}

            {gameState === "question" && (
              <>
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className={`text-2xl font-bold ${
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
                    {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={handleShowAnswer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg flex-shrink-0"
                  data-testid="button-show-answer"
                >
                  Show Answer
                </Button>
              </>
            )}

            {gameState === "answer" && (
              <>
                <Button
                  onClick={handleNextQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold flex-shrink-0"
                  data-testid="button-next-question"
                >
                  <ChevronRight className="mr-2 h-5 w-5" />
                  {currentQuestions && currentQuestionIndex >= currentQuestions.length - 1 ? (
                    currentQuestionType === "training" ? "Start Game" :
                    currentQuestionType === "tie-breaker" ? "Finish" :
                    "Check Ties"
                  ) : "Next"}
                </Button>
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
          </div>

          {/* Right side - Utility buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              onClick={handleRestart}
              size="sm"
              className="bg-red-700 hover:bg-red-600 text-white border border-red-500 p-2"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              size="sm"
              className="bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 p-2"
              data-testid="button-fullscreen"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}