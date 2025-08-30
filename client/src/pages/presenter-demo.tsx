import { useEffect, useState, useCallback } from "react";
import { useRoute } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Play, ArrowRight, RotateCcw, Pause, SkipForward, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// SimpleProgress component will be inline
const SimpleProgress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-champagne-400 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

type GameState = "waiting" | "question" | "answer" | "complete";

interface PresenterDemoProps {
  defaultEventId?: string;
}

export default function PresenterDemo({ defaultEventId }: PresenterDemoProps = {}) {
  const [, params] = useRoute("/presenter-demo/:id");
  const eventId = params?.id || defaultEventId;
  
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Fetch event data
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery<any>({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch questions
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'questions'],
    enabled: !!eventId,
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch fun facts
  const { data: funFacts, isLoading: funFactsLoading, error: funFactsError } = useQuery<any[]>({
    queryKey: ['/api/events', eventId, 'fun-facts'],
    enabled: !!eventId,
    retry: 3,
    retryDelay: 1000,
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const timerProgress = (timeLeft / 30) * 100;

  const handleStartGame = () => {
    setGameState("question");
    setTimeLeft(30);
    setIsTimerActive(true);
    setShowAnswer(false);
  };

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
    setGameState("answer");
    setIsTimerActive(false);
  }, []);

  // Timer logic
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
  }, [isTimerActive, timeLeft, autoAdvance, gameState, handleShowAnswer]);

  const handleNextQuestion = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setGameState("question");
      setTimeLeft(30);
      setIsTimerActive(true);
    } else {
      setGameState("complete");
      setIsTimerActive(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setGameState("waiting");
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleSkipForward = () => {
    if (gameState === "question") {
      handleShowAnswer();
    } else if (gameState === "answer") {
      handleNextQuestion();
    }
  };

  // Show loading state while any critical data is loading
  if (eventLoading || questionsLoading || funFactsLoading || !event || !questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wine-900 to-champagne-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-champagne-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
            <Play className="h-8 w-8 text-champagne-900" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Demo Presenter</h1>
          <p className="text-xl">Loading trivia preview...</p>
          {eventError && <p className="text-red-400 mt-2">Error loading event data</p>}
          {questionsError && <p className="text-red-400 mt-2">Error loading questions</p>}
          {funFactsError && <p className="text-red-400 mt-2">Error loading fun facts</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-wine-900 to-champagne-900 text-white overflow-hidden">
      {/* Header - Simplified for demo */}
      <div className="flex-shrink-0 p-4 lg:p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-champagne-500/20 border-champagne-400 text-champagne-200">
                ✨ DEMO
              </Badge>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-champagne-200 truncate">
                {event?.title || 'Demo Event'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm lg:text-lg text-white/80 truncate">
              TriviaSpark Preview • Shareable Demo • No Login Required
            </p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-lg lg:text-xl font-bold text-champagne-300">{questions?.length || 0}</div>
              <div className="text-xs sm:text-sm text-white/60">Questions</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 lg:mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-white/60">Progress</span>
            <span className="text-xs sm:text-sm text-champagne-300">
              Question {currentQuestionIndex + 1} of {questions?.length || 0}
            </span>
          </div>
          <SimpleProgress value={progress} className="bg-white/20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
        
        {gameState === "waiting" && (
          <div className="text-center max-w-4xl">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-champagne-500 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
              <Play className="h-10 w-10 lg:h-12 lg:w-12 text-champagne-900" />
            </div>
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 text-champagne-200">TriviaSpark Demo</h2>
            <p className="text-lg lg:text-2xl xl:text-3xl text-white/80 mb-4">
              Experience our interactive trivia platform
            </p>
            <p className="text-sm lg:text-lg text-champagne-300 mb-8">
              This is a shareable demo - no login required!
            </p>
            <Button 
              onClick={handleStartGame}
              size="lg"
              className="bg-champagne-500 hover:bg-champagne-400 text-champagne-900 font-bold text-xl px-8 py-4"
            >
              <Play className="mr-2 h-6 w-6" />
              Start Demo
            </Button>
          </div>
        )}

        {gameState === "question" && currentQuestion && (
          <div className="w-full max-w-7xl h-full flex flex-col">
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
                      }`}>
                        {timeLeft}s
                      </div>
                      <div className="w-24">
                        <SimpleProgress 
                          value={timerProgress} 
                          className={`${
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
                    }`}>
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
          <div className="w-full max-w-7xl h-full flex flex-col space-y-4 lg:space-y-8">
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
                    <p className="text-xl lg:text-3xl xl:text-4xl font-bold text-white">
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
                  {funFacts && funFacts.length > 0 && (() => {
                    const funFact = funFacts[currentQuestionIndex % funFacts.length];
                    return funFact ? (
                      <div>
                        <h5 className="text-base lg:text-xl font-semibold mb-2 lg:mb-3 text-champagne-100">{funFact.title}</h5>
                        <p className="text-sm lg:text-lg text-white/90 max-w-5xl mx-auto leading-relaxed">
                          {funFact.content}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {gameState === "complete" && (
          <div className="text-center max-w-4xl">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
              <Trophy className="h-10 w-10 lg:h-12 lg:w-12 text-yellow-900" />
            </div>
            <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 text-champagne-200">Demo Complete!</h2>
            <p className="text-lg lg:text-2xl xl:text-3xl text-white/80 mb-4">
              Experience the full power of TriviaSpark for your events
            </p>
            <p className="text-sm lg:text-lg text-champagne-300 mb-8">
              Create engaging trivia experiences with real-time scoring, team management, and more!
            </p>
            <Button 
              onClick={handleRestart}
              size="lg"
              className="bg-champagne-500 hover:bg-champagne-400 text-champagne-900 font-bold text-xl px-8 py-4"
            >
              <RotateCcw className="mr-2 h-6 w-6" />
              Restart Demo
            </Button>
          </div>
        )}
      </div>

      {/* Control Panel - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/20 p-2 lg:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 lg:space-x-4">
          {gameState === "waiting" && (
            <>
              <Button
                onClick={handleStartGame}
                className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-8 py-2 lg:py-4 text-base lg:text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Demo
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
                >
                  {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                onClick={handleShowAnswer}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
              >
                Show Answer
              </Button>
              <Button
                onClick={handleSkipForward}
                className="bg-champagne-600 hover:bg-champagne-700 text-white px-6 py-3"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
              </Button>
            </>
          )}

          {gameState === "answer" && (
            <>
              <Button
                onClick={handleNextQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
                disabled={!questions || currentQuestionIndex >= questions.length - 1}
              >
                <ChevronRight className="mr-2 h-5 w-5" />
                {questions && currentQuestionIndex >= questions.length - 1 ? "Finish Demo" : "Next Question"}
              </Button>
              <Button
                onClick={() => setAutoAdvance(!autoAdvance)}
                size="sm"
                className="bg-champagne-700 hover:bg-champagne-600 text-white border border-champagne-500"
              >
                {autoAdvance ? "Auto: ON" : "Auto: OFF"}
              </Button>
            </>
          )}

          {/* Always available controls */}
          <div className="flex items-center space-x-2 ml-8">
            <Button
              onClick={handleRestart}
              size="sm"
              className="bg-red-700 hover:bg-red-600 text-white border border-red-500"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}