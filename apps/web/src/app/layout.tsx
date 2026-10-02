import type { Metadata } from "next";
import {
  Instrument_Serif,
  Inter,
  Noto_Serif_Tamil,
  Noto_Serif_Devanagari,
  Noto_Serif_Telugu,
  Noto_Serif_Malayalam,
  Noto_Serif_Kannada,
} from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
});

const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
});

const notoTelugu = Noto_Serif_Telugu({
  subsets: ["telugu"],
  variable: "--font-telugu",
  display: "swap",
});

const notoMalayalam = Noto_Serif_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  display: "swap",
});

const notoKannada = Noto_Serif_Kannada({
  subsets: ["kannada"],
  variable: "--font-kannada",
  display: "swap",
});

export const metadata: Metadata = {
  title: "What I Saw When I Was a Kid",
  description: "An endless book of childhood memories. Three pages each, written by a real person.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning on <html> and <body> absorbs the class/attribute
    // churn caused by browser extensions (Grammarly, Dark Reader, translation
    // tools) that mutate the DOM before React hydrates. It only silences that
    // one level deep and does not hide genuine hydration bugs.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${notoTamil.variable} ${notoDevanagari.variable} ${notoTelugu.variable} ${notoMalayalam.variable} ${notoKannada.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-canvas text-ink min-h-screen selection:bg-accent/35 selection:text-ink antialiased flex flex-col justify-between"
      >
        <AuthProvider>
          <NavBar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
