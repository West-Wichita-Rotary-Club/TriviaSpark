import { useState, useEffect } from "react";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { WebSocketStatus } from "../components/WebSocketStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Clock, CheckCircle } from "lucide-react";

interface ParticipantJoinPageProps {
  eventId: string;
  eventTitle?: string;
}

export function ParticipantJoinPage({ eventId, eventTitle }: ParticipantJoinPageProps) {
  const [participantName, setParticipantName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finalCountdown, setFinalCountdown] = useState(0);
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number }>>([]);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'between' | 'ended'>('waiting');

  const { isConnected, sendMessage, connect: wsConnect, messages } = useWebSocketContext();

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const latestMessage = messages[messages.length - 1];
    
    switch (latestMessage.type) {
      case 'connection_confirmed':
        console.log('Connected to trivia event!');
        break;
        
      case 'question_started':
        setCurrentQuestion(latestMessage.data?.question);
        setSelectedAnswer(null);
        setAnswerLocked(false);
        setTimeLeft(latestMessage.data?.timeLimit || 30);
        setGameStatus('active');
        break;
        
      case 'timer_update':
        setTimeLeft(latestMessage.data?.timeLeft || 0);
        setFinalCountdown(latestMessage.data?.finalCountdown || 0);
        break;
        
      case 'answer_revealed':
        setGameStatus('between');
        break;
        
      case 'leaderboard_updated':
        setLeaderboard(latestMessage.data?.leaderboard || []);
        break;
        
      case 'event_ended':
        setGameStatus('ended');
        setLeaderboard(latestMessage.data?.finalResults || []);
        break;
        
      case 'event_status_changed':
        // Handle other event status changes if needed
        break;
    }
  }, [messages]);

  const handleJoinEvent = () => {
    if (!participantName.trim()) return;
    
    const participantId = `participant_${Date.now()}`;
    wsConnect(eventId, 'participant', 'participant-user-id', participantId);
    
    // Send join message
    sendMessage({
      type: 'join_event',
      eventId,
      data: {
        participantId,
        participantName: participantName.trim()
      }
    });
    
    setIsJoined(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (answerLocked) return;
    
    setSelectedAnswer(answer);
    
    sendMessage({
      type: 'participant_answer',
      eventId,
      data: {
        questionId: currentQuestion?.id,
        selectedAnswer: answer
      }
    });
  };

  const handleLockAnswer = () => {
    if (!selectedAnswer || answerLocked) return;
    
    setAnswerLocked(true);
    
    sendMessage({
      type: 'lock_answer',
      eventId,
      data: {
        questionId: currentQuestion?.id,
        selectedAnswer,
        timeRemaining: timeLeft
      }
    });
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-champagne-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-wine-800">
              Join Trivia Event
            </CardTitle>
            {eventTitle && (
              <p className="text-wine-600 mt-2">{eventTitle}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinEvent()}
                className="text-center"
                data-testid="input-participant-name"
              />
            </div>
            <Button 
              onClick={handleJoinEvent}
              disabled={!participantName.trim()}
              className="w-full bg-wine-600 hover:bg-wine-700"
              data-testid="button-join-event"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Event
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-champagne-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-wine-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-wine-800">
                Welcome, {participantName}!
              </h1>
              {eventTitle && (
                <p className="text-wine-600">{eventTitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-wine-100 text-wine-800 border-wine-300">
                <Trophy className="w-3 h-3 mr-1" />
                Score: {score}
              </Badge>
              <WebSocketStatus />
            </div>
          </div>
        </div>

        {/* Game Content */}
        {gameStatus === 'waiting' && (
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Waiting for trivia to start...
              </h2>
              <p className="text-gray-600">
                The host will begin the questions shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {gameStatus === 'active' && currentQuestion && (
          <div className="space-y-6">
            {/* Timer */}
            <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-wine-200 text-center">
              <div className="flex items-center justify-center gap-4">
                <Clock className="w-5 h-5 text-wine-600" />
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-wine-800'}`}>
                  {timeLeft}s
                </div>
              </div>
              {finalCountdown > 0 && (
                <div className="text-4xl font-bold text-red-600 mt-2 animate-pulse">
                  {finalCountdown}
                </div>
              )}
            </div>

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-wine-800">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options?.map((option: string, index: number) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    variant={selectedAnswer === option ? "default" : "outline"}
                    disabled={answerLocked}
                    className={`w-full justify-start text-left p-4 h-auto ${
                      selectedAnswer === option 
                        ? 'bg-wine-600 hover:bg-wine-700 text-white' 
                        : 'border-wine-200 hover:bg-wine-50'
                    }`}
                    data-testid={`option-${index}`}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
                
                {selectedAnswer && !answerLocked && (
                  <Button
                    onClick={handleLockAnswer}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                    data-testid="button-lock-answer"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Lock Answer: {selectedAnswer}
                  </Button>
                )}
                
                {answerLocked && (
                  <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Answer Locked!</p>
                    <p className="text-green-600">Your answer: {selectedAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {gameStatus === 'ended' && (
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-2xl font-bold text-wine-800 mb-6">
                🎉 Trivia Complete! 🎉
              </h2>
              
              {leaderboard.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-wine-700">Final Results</h3>
                  <div className="space-y-2">
                    {leaderboard.map((participant, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                        participant.name === participantName ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                          </span>
                          <span className="font-semibold">{participant.name}</span>
                        </div>
                        <span className="font-bold text-wine-800">{participant.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 mt-6">
                Thanks for playing! Your final score: <strong>{score}</strong>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}