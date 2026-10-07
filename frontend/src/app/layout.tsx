import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider, themeBootScript } from "@/lib/theme";
import { UserProvider } from "@/lib/user-context";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Duolingo Clone - Learn Spanish",
  description: "A gamified language-learning app: learning path, lessons, XP, streaks and hearts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#58cc02",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <ThemeProvider>
          <UserProvider>
            <ToastProvider>{children}</ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
