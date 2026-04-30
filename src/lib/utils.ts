import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  return `${getBaseUrl()}${path}`;
}

export function hexToHslValues(hex: string): string {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, "");

  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  format?: "symbol amount" | "amount symbol";
}

export const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "PKR",
  symbol: "PKR Rs.",
  format: "symbol amount",
};

export function formatCurrency(amount: number, config: CurrencyConfig = DEFAULT_CURRENCY): string {
  const formattedAmount = Math.round(amount).toLocaleString();

  return config.format === "amount symbol"
    ? `${formattedAmount} ${config.symbol}`
    : `${config.symbol} ${formattedAmount}`;
}


export const COLOR_MAP: Record<string, string> = {
  "Black": "#000000",
  "White": "#FFFFFF",
  "Navy": "#000080",
  "Red": "#EF4444",
  "Blue": "#3B82F6",
  "Grey": "#808080",
  "Gray": "#808080",
  "Heather Grey": "#9AA2AE",
  "Charcoal": "#36454F",
  "Beige": "#F5F5DC",
  "Green": "#22C55E",
  "Olive": "#808000",
  "Maroon": "#800000",
  "Burgundy": "#800020",
  "Pink": "#EC4899",
  "Purple": "#A855F7",
  "Yellow": "#EAB308",
  "Orange": "#F97316",
  "Teal": "#14B8A6",
  "Cyan": "#06B6D4",
  "Brown": "#78350F",
};

export function getColorValue(colorName: string): string {
  // Check exact match
  if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];

  // Check case-insensitive
  const lowerName = colorName.toLowerCase();
  const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === lowerName);
  if (key) return COLOR_MAP[key];

  // Return original if likely a valid CSS color, otherwise gray
  return colorName;
}
