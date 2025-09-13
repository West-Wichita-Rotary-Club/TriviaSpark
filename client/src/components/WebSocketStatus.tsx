import { Badge } from "@/components/ui/badge";
import { useWebSocketContext } from "../contexts/WebSocketContext";
import { Wifi, WifiOff } from "lucide-react";

interface WebSocketStatusProps {
  className?: string;
}

export function WebSocketStatus({ className }: WebSocketStatusProps) {
  const { isConnected, connectionStatus } = useWebSocketContext();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-600 dark:bg-green-500';
      case 'connecting':
        return 'bg-yellow-600 dark:bg-yellow-500';
      case 'disconnected':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  if (connectionStatus === 'disconnected') {
    return null; // Don't show when not attempting to connect
  }

  return (
    <Badge 
      variant="outline" 
      className={`${className} flex items-center gap-1 ${getStatusColor()} text-white border-none`}
    >
      {isConnected ? (
        <Wifi className="w-3 h-3" />
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      <span className="text-xs font-medium">{getStatusText()}</span>
    </Badge>
  );
}