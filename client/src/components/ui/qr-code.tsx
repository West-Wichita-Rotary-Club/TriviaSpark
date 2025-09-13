import { useState } from "react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Using a QR code API service for simplicity
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };
  
  if (hasError) {
    return (
      <div 
        className="flex items-center justify-center border rounded-lg bg-muted w-48 h-48" 
        data-testid="qr-code-fallback"
      >
        <div className="text-center p-4">
          <div className="text-sm font-medium text-foreground mb-2">QR Code</div>
          <div className="text-xs text-muted-foreground break-all">{value}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center" data-testid="qr-code-container">
      {isLoading && (
        <div 
          className="flex items-center justify-center border rounded-lg bg-muted animate-pulse w-48 h-48"
          data-testid="qr-code-loading"
        >
          <div className="text-sm text-muted-foreground">Loading QR...</div>
        </div>
      )}
      <img
        src={qrCodeUrl}
        alt="QR Code"
        className={`border rounded-lg ${isLoading ? 'hidden' : ''}`}
        width={size}
        height={size}
        onLoad={handleImageLoad}
        onError={handleImageError}
        data-testid="qr-code-image"
      />
    </div>
  );
}
