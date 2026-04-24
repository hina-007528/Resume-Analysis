import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { GSAPProvider } from "@/components/gsap/GSAPProvider";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { PageTransition } from "@/components/layout/PageTransition";


export const metadata: Metadata = {
  title: "AI Resume Analyzer",
  description: "Neural semantic matching for next-gen talent. Bridge the gap between your skills and your dream job with precision AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <div className="bg-mesh" />
        <GSAPProvider>
          <Navbar />
          <div id="root-content" className="transition-all duration-500">
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
          </div>
        </GSAPProvider>


      </body>
    </html>
  );
}

