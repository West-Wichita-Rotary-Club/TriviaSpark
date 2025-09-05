import { useState, useEffect } from "react";
import { useRoute } from "wouter";
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
import { Play, Pause, SkipForward, RotateCcw, Trophy, Users, Clock, ChevronRight, Star } from "lucide-react";

export default function PresenterView() {
  const [, params] = useRoute("/presenter/:id");
  const [, demoRoute] = useRoute("/demo");
  const eventId = params?.id;
  const isDemoMode = demoRoute || !eventId;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameState, setGameState] = useState<"waiting" | "question" | "answer" | "leaderboard">("waiting");
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
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
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-white/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            {isDemoMode && (
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-champagne-500/20 border-champagne-400 text-champagne-200">
                  ✨ DEMO
                </Badge>
              </div>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-champagne-200 truncate" data-testid="text-event-title">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-xl text-white/80 truncate" data-testid="text-event-description">
              {isDemoMode ? "TriviaSpark Preview • Shareable Demo • No Login Required" : event.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 text-right flex-shrink-0">
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-champagne-300">{participants?.length || 0}</div>
              <div className="text-xs sm:text-sm text-white/60">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-champagne-300">{teams?.length || 0}</div>
              <div className="text-xs sm:text-sm text-white/60">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-champagne-300">{questions?.length || 0}</div>
              <div className="text-xs sm:text-sm text-white/60">Questions</div>
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
      </div>

      {/* Main Content - Flexible height */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 pb-20 lg:pb-24 overflow-hidden">
        {gameState === "waiting" && (
          <div className="text-center w-full max-w-4xl" data-testid="view-waiting">
            <div className="w-20 h-20 lg:w-32 lg:h-32 wine-gradient rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
              {isDemoMode ? <Play className="h-10 w-10 lg:h-16 lg:w-16 text-white" /> : <Trophy className="h-10 w-10 lg:h-16 lg:w-16 text-white" />}
            </div>
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 lg:mb-4 text-champagne-200">
              {isDemoMode ? "TriviaSpark Demo" : "Welcome to Trivia!"}
            </h2>
            <p className="text-lg lg:text-2xl xl:text-3xl text-white/80 mb-6 lg:mb-8">
              {isDemoMode ? "Experience our interactive trivia platform" : "Get ready for an amazing experience"}
            </p>
            <div className="text-base lg:text-lg text-champagne-300">
              {isDemoMode ? "This is a shareable demo - no login required!" : `${participants?.length || 0} participants ready to play`}
            </div>
          </div>
        )}

        {gameState === "question" && currentQuestion && (
          <div className="w-full max-w-7xl h-full flex flex-col" data-testid="view-question">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white flex-1 flex flex-col relative overflow-hidden">
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
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl lg:text-3xl text-white drop-shadow-lg">
                    Question {currentQuestionIndex + 1}
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
              <CardContent className="flex-1 flex flex-col justify-center relative z-10">
                <div className="text-center">
                  <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 mb-4 lg:mb-8 border border-white/20">
                    <h3 className={`font-bold leading-tight text-white ${
                      currentQuestion.question.length > 120 
                        ? 'text-lg lg:text-2xl xl:text-3xl' 
                        : currentQuestion.question.length > 80 
                        ? 'text-xl lg:text-3xl xl:text-4xl'
                        : 'text-2xl lg:text-4xl xl:text-5xl'
                    }`} data-testid="text-current-question">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  
                  {currentQuestion.options && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 max-w-6xl mx-auto">
                      {currentQuestion.options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className={`p-3 lg:p-6 rounded-lg border-2 ${
                            showAnswer && option === currentQuestion.correctAnswer
                              ? 'bg-green-600 border-green-400 text-white shadow-lg'
                              : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white'
                          } transition-all duration-300`}
                          data-testid={`option-${index}`}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-champagne-200 text-champagne-900 font-bold flex items-center justify-center mr-4">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-base lg:text-xl font-medium text-white">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "answer" && currentQuestion && (
          <div className="w-full max-w-7xl h-full flex flex-col space-y-4 lg:space-y-8" data-testid="view-answer">
            {/* Answer Section at Top */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="py-6 lg:py-8 h-full flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4 lg:gap-8 h-full">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-500 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                      <Star className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-green-300">Correct Answer</h3>
                  </div>
                  <div className="flex items-center justify-center text-center">
                    <p className="text-xl lg:text-3xl xl:text-4xl font-bold text-white" data-testid="text-correct-answer">
                      {currentQuestion.correctAnswer}
                    </p>
                  </div>
                </div>
                {currentQuestion.explanation && (
                  <div className="mt-4 lg:mt-6 text-center">
                    <p className="text-sm lg:text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
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
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-champagne-500 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-4">
                    <Star className="h-6 w-6 lg:h-8 lg:w-8 text-champagne-900" />
                  </div>
                  <h4 className="text-lg lg:text-2xl font-bold mb-2 lg:mb-4 text-champagne-200">Fun Fact!</h4>
                  {(() => {
                    // Cycle through fun facts based on current question index
                    const funFact = funFacts[currentQuestionIndex % funFacts.length];
                    return (
                      <div>
                        <h5 className="text-base lg:text-xl font-semibold mb-2 lg:mb-3 text-champagne-100">{funFact.title}</h5>
                        <p className="text-sm lg:text-lg text-white/90 max-w-5xl mx-auto leading-relaxed">
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

        {gameState === "leaderboard" && (
          <div className="w-full max-w-5xl h-full flex flex-col" data-testid="view-leaderboard">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white flex-1 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-2xl lg:text-4xl text-center flex items-center justify-center">
                  <Trophy className="mr-2 lg:mr-4 h-6 w-6 lg:h-10 lg:w-10 text-yellow-400" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="space-y-3 lg:space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.name}
                      className={`flex items-center justify-between p-4 lg:p-6 rounded-lg ${
                        index === 0 ? 'bg-yellow-500/20 border-2 border-yellow-400' :
                        index === 1 ? 'bg-gray-300/20 border-2 border-gray-400' :
                        index === 2 ? 'bg-amber-600/20 border-2 border-amber-600' :
                        'bg-white/5 border border-white/20'
                      }`}
                      data-testid={`leaderboard-entry-${index}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-lg lg:text-xl mr-3 lg:mr-4 ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-amber-100' :
                          'bg-white/20 text-white'
                        }`}>
                          {entry.rank}
                        </div>
                        <span className="text-lg lg:text-2xl font-semibold">{entry.name}</span>
                      </div>
                      <span className="text-xl lg:text-3xl font-bold text-champagne-300">
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Control Panel - Fixed bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-2 lg:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 lg:space-x-4">
          {gameState === "waiting" && (
            <>
              <Button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold"
                data-testid="button-start-game"
              >
                <Play className="mr-2 h-5 w-5" />
                {isDemoMode ? "Start Demo" : "Start Game"}
              </Button>
            </>
          )}

          {gameState === "question" && (
            <>
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${
                  timeLeft <= 10 ? 'text-red-400' : 
                  timeLeft <= 20 ? 'text-yellow-400' : 'text-white'
                }`}>
                  Time: {timeLeft}s
                </div>
                <Button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 border"
                  data-testid="button-toggle-timer"
                >
                  {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleShowAnswer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                data-testid="button-show-answer"
              >
                Show Answer
              </Button>
              <Button
                onClick={handleShowLeaderboard}
                className="bg-wine-700 hover:bg-wine-600 text-white border border-wine-500 px-6 py-3"
                data-testid="button-show-leaderboard"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Show Leaderboard
              </Button>
            </>
          )}

          {gameState === "answer" && (
            <>
              <Button
                onClick={handleNextQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                disabled={!questions || currentQuestionIndex >= questions.length - 1}
                data-testid="button-next-question"
              >
                <ChevronRight className="mr-2 h-5 w-5" />
                {questions && currentQuestionIndex >= questions.length - 1 ? "Finish Game" : "Next Question"}
              </Button>
              <Button
                onClick={handleShowLeaderboard}
                className="bg-wine-700 hover:bg-wine-600 text-white border border-wine-500 px-6 py-3"
                data-testid="button-show-leaderboard-from-answer"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Show Leaderboard
              </Button>
              <Button
                onClick={() => setAutoAdvance(!autoAdvance)}
                size="sm"
                className="bg-champagne-700 hover:bg-champagne-600 text-white border border-champagne-500"
                data-testid="button-toggle-auto"
              >
                {autoAdvance ? "Auto: ON" : "Auto: OFF"}
              </Button>
            </>
          )}

          {gameState === "leaderboard" && (
            <>
              {questions && currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold border border-blue-500"
                  data-testid="button-continue-from-leaderboard"
                >
                  <ChevronRight className="mr-2 h-5 w-5" />
                  Continue Game
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  className="bg-wine-600 hover:bg-wine-700 text-white px-8 py-4 text-lg font-semibold border border-wine-500"
                  data-testid="button-restart-game"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Game Complete
                </Button>
              )}
            </>
          )}

          {/* Always available controls */}
          <div className="flex items-center space-x-2 ml-8">
            <Button
              onClick={handleRestart}
              size="sm"
              className="bg-red-700 hover:bg-red-600 text-white border border-red-500"
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleShowLeaderboard}
              size="sm"
              className="bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-500"
              data-testid="button-leaderboard"
            >
              <Trophy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}