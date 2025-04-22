
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (amount == null) return 'N/A';
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: string | Date) {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function truncateText(text: string, maxLength: number = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

export function generateRandomString(length: number = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}

export function getStatusColor(status: string) {
  const statusMap: Record<string, string> = {
    'completed': 'bg-green-500',
    'pending': 'bg-yellow-500',
    'failed': 'bg-red-500',
    'cancelled': 'bg-gray-500',
    'available': 'bg-green-500',
    'sold': 'bg-blue-500',
    'upcoming': 'bg-purple-500',
    'ongoing': 'bg-blue-500',
    'past': 'bg-gray-500'
  };
  
  return statusMap[status.toLowerCase()] || 'bg-gray-500';
}
