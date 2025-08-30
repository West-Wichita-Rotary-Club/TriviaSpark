import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// CST timezone utilities
export const CST_TIMEZONE = "America/Chicago";

export function formatDateInCST(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return dateObj.toLocaleDateString("en-US", {
    timeZone: CST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTimeInCST(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return dateObj.toLocaleString("en-US", {
    timeZone: CST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeInCST(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return dateObj.toLocaleTimeString("en-US", {
    timeZone: CST_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getDateForInputInCST(date: Date | string | number): string {
  const dateObj =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  // Get the date in CST and format for HTML date input (YYYY-MM-DD)
  const cstDate = new Date(
    dateObj.toLocaleString("en-US", { timeZone: CST_TIMEZONE })
  );
  return cstDate.toISOString().split("T")[0];
}

export function createDateInCST(dateString: string, timeString?: string): Date {
  // Create a date assuming the input is in CST
  // Parse the date string (YYYY-MM-DD format from HTML date input)
  const [year, month, day] = dateString.split("-").map(Number);

  // If time is provided, parse it (e.g., "6:30 PM")
  let hours = 18; // Default to 6 PM
  let minutes = 30; // Default to 30 minutes

  if (timeString) {
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();

      if (ampm === "PM" && hours !== 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }
    }
  }

  // Create date in CST by specifying the timezone offset
  // CST is UTC-6, CDT is UTC-5. For consistency, we'll use the offset for September (CDT)
  const date = new Date();
  date.setFullYear(year, month - 1, day); // month is 0-indexed
  date.setHours(hours, minutes, 0, 0);

  // Adjust for timezone - September 2025 would be CDT (UTC-5)
  const utcDate = new Date(date.getTime() + 5 * 60 * 60 * 1000); // Add 5 hours to convert CDT to UTC

  return utcDate;
}
