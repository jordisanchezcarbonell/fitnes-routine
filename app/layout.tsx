import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitness Tracker",
  keywords: ["fitness", "tracker", "workout", "exercise", "health"],
  authors: [{ name: "JSANCHEZ" }],
  description:
    "A simple fitness tracker application to log workouts and exercises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
