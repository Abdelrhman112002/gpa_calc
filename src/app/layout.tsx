import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPA Calculator",
  description: "GPA Calculator - Calculate your Grade Point Average easily",
  keywords: "GPA, calculator, grade point average, academic",
  icons: {
    icon: "/gpa.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
