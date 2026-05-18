import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { ProfileAvatarProvider } from "@/context/profile-avatar-context";
import { WorkoutLogProvider } from "@/context/workout-log-context";
import { WeeklyMuscleProvider } from "@/context/weekly-muscle-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LiftTrack — Workout Log",
  description: "Track workouts, sets, and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <WeeklyMuscleProvider>
          <WorkoutLogProvider>
            <ProfileAvatarProvider>
              <AppHeader />
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </ProfileAvatarProvider>
          </WorkoutLogProvider>
        </WeeklyMuscleProvider>
      </body>
    </html>
  );
}
