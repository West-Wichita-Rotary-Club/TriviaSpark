export function generateQRCodeUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function generateEventJoinUrl(qrCode: string): string {
  return `${window.location.origin}/join/${qrCode}`;
}

export function isValidQRCode(qrCode: string): boolean {
  return /^trivia-[a-f0-9]{8}$/.test(qrCode);
}
