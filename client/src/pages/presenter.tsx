import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoEvent, demoQuestions, demoFunFacts } from "@/data/demoData";
// Custom progress component to avoid React hook issues
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-champagne-400 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
import { Play, Pause, SkipForward, RotateCcw, Trophy, Users, Clock, ChevronRight, Star, ChevronUp, ChevronDown, Shield } from "lucide-react";

export default function PresenterView() {
  const [, presenterParams] = useRoute("/presenter/:id");
  const [, demoParams] = useRoute("/demo/:id");
  const [, setLocation] = useLocation();
  
  // Check which route we're on and get the eventId accordingly
  const eventId = presenterParams?.id || demoParams?.id;
  const isDemoMode = !!demoParams;
  
  // Redirect to home if demo route is accessed without ID
  if (demoParams !== null && !demoParams.id) {
    setLocation("/");
    return null;
  }
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameState, setGameState] = useState<"waiting" | "rules" | "question" | "answer" | "leaderboard">("waiting");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  // Use demo data when in demo mode, otherwise use API data
  const { data: apiEvent } = useQuery<any>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId && !isDemoMode,
  });

  const { data: apiQuestions } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "questions"],
    enabled: !!eventId && !isDemoMode,
  });

  const { data: apiParticipants } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "participants"],
    enabled: !!eventId && !isDemoMode,
  });

  const { data: apiTeams } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "teams"],
    enabled: !!eventId && !isDemoMode,
  });

  const { data: apiFunFacts } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "fun-facts"],
    enabled: !!eventId && !isDemoMode,
  });

  // Use demo data or API data based on mode
  const event = isDemoMode ? demoEvent : apiEvent;
  const questions = isDemoMode ? demoQuestions : apiQuestions;
  const participants = isDemoMode ? [] : apiParticipants; // Demo mode has no live participants
  const teams = isDemoMode ? [] : apiTeams; // Demo mode has no live teams
  const funFacts = isDemoMode ? demoFunFacts : apiFunFacts;

  // Check if participants are allowed for this event
  const allowParticipants = event?.allowParticipants ?? false;

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const timerProgress = (timeLeft / 30) * 100;

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
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setGameState("question");
      setTimeLeft(30);
      setIsTimerActive(true);
    } else {
      setGameState("leaderboard");
      setIsTimerActive(false);
    }
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
    setShowAnswer(false);
    setGameState("waiting");
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  const handleStartGame = () => {
    setGameState("rules");
  };

  const handleStartQuestions = () => {
    setGameState("question");
    setTimeLeft(30);
    setIsTimerActive(true);
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
                  {isDemoMode ? "TriviaSpark Preview • Shareable Demo • No Login Required" : event.description}
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
                Question {currentQuestionIndex + 1} of {questions?.length || 0}
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
              {isDemoMode ? <Play className="h-8 w-8 sm:h-10 sm:w-10 lg:h-16 lg:w-16 text-white" /> : <Trophy className="h-8 w-8 sm:h-10 sm:w-10 lg:h-16 lg:w-16 text-white" />}
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 lg:mb-4 text-champagne-200">
              {isDemoMode ? "TriviaSpark Demo" : "Welcome to Trivia!"}
            </h2>
            <p className="text-base sm:text-lg lg:text-2xl xl:text-3xl text-white/80 mb-4 sm:mb-6 lg:mb-8">
              {isDemoMode ? "Experience our interactive trivia platform" : "Get ready for an amazing experience"}
            </p>
            <div className="text-sm sm:text-base lg:text-lg text-champagne-300">
              {isDemoMode ? "This is a shareable demo - no login required!" : 
               allowParticipants ? `${participants?.length || 0} participants ready to play` :
               "Content-focused trivia experience"}
            </div>
          </div>
        )}

        {gameState === "rules" && (
          <div className="text-center w-full max-w-6xl px-4" data-testid="view-rules">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-wine-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 text-champagne-200">
                  Contest Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="text-left max-w-4xl mx-auto space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">1</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      <strong>No internet searches!!!</strong> (Remember the 4-way test...)
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">2</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      <strong>20 seconds per question</strong> allowed for a team answer.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">3</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      Write your <strong>letter answer</strong> on your whiteboard.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">4</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      Keep your <strong>correct answer held high</strong> until scorekeeper has acknowledged it.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">5</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      <strong>Erase and repeat.</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">6</span>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                      Leave your <strong>marker, eraser and whiteboard</strong> on your table when we finish.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-wine-400 flex-shrink-0">7</span>
                    <p className="text-base sm:text-lg lg:text-xl text-champagne-300 leading-relaxed font-semibold">
                      <strong>Have fun!</strong> 🎉
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "question" && currentQuestion && (
          <div className="w-full h-full flex flex-col min-h-0" data-testid="view-question">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white flex-1 flex flex-col relative min-h-0 h-full">
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
                    Question {currentQuestionIndex + 1}
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
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-5 border border-white/20">
                      <h3 className={`font-bold leading-tight text-white break-words text-center ${
                        currentQuestion.question.length > 120 
                          ? 'text-sm sm:text-base lg:text-lg xl:text-xl' 
                          : currentQuestion.question.length > 80 
                          ? 'text-base sm:text-lg lg:text-xl xl:text-2xl'
                          : 'text-lg sm:text-xl lg:text-2xl xl:text-3xl'
                      }`} data-testid="text-current-question">
                        {currentQuestion.question}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Answer Options */}
                  {currentQuestion.options && (
                    <div className="flex-1 flex flex-col justify-center min-h-0">
                      <div className="w-full max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                          {currentQuestion.options.map((option: string, index: number) => (
                            <div
                              key={index}
                              className={`p-3 sm:p-4 lg:p-4 xl:p-5 rounded-lg border-2 min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[3.5rem] ${
                                showAnswer && option === currentQuestion.correctAnswer
                                  ? 'bg-green-600 border-green-400 text-white shadow-lg'
                                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white'
                              } transition-all duration-300`}
                              data-testid={`option-${index}`}
                            >
                              <div className="flex items-center h-full">
                                <div className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-champagne-200 text-champagne-900 font-bold flex items-center justify-center mr-2 sm:mr-3 lg:mr-4 text-xs sm:text-sm lg:text-base flex-shrink-0">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-white break-words flex-1 leading-tight">{option}</span>
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
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white flex-shrink-0">
              <CardContent className="py-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 lg:gap-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-500 rounded-full flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-300">Correct Answer</h3>
                  </div>
                  <div className="flex items-center justify-center text-center">
                    <p className="text-lg sm:text-xl lg:text-3xl xl:text-4xl font-bold text-white break-words" data-testid="text-correct-answer">
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
                    <p className="text-xs sm:text-sm lg:text-lg text-white/80 max-w-4xl mx-auto leading-relaxed break-words px-2">
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
                  <h4 className="text-base sm:text-lg lg:text-2xl font-bold mb-2 lg:mb-4 text-champagne-200">Fun Fact!</h4>
                  {(() => {
                    // Cycle through fun facts based on current question index
                    const funFact = funFacts[currentQuestionIndex % funFacts.length];
                    return (
                      <div className="overflow-auto">
                        <h5 className="text-sm sm:text-base lg:text-xl font-semibold mb-2 lg:mb-3 text-champagne-100 break-words">{funFact.title}</h5>
                        <p className="text-xs sm:text-sm lg:text-lg text-white/90 max-w-5xl mx-auto leading-relaxed break-words px-2">
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
                {isDemoMode ? "Start Demo" : "Start Game"}
              </Button>
            </>
          )}

          {gameState === "rules" && (
            <>
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
                disabled={!questions || currentQuestionIndex >= questions.length - 1}
                data-testid="button-next-question"
              >
                <ChevronRight className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {questions && currentQuestionIndex >= questions.length - 1 ? "Finish" : "Next"}
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
              {questions && currentQuestionIndex < questions.length - 1 ? (
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