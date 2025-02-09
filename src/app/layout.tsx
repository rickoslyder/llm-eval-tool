import "./globals.css";
import { Inter } from "next/font/google";
import NavigationBar from "@/components/NavigationBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TRPCReactProvider } from "@/lib/trpc/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LLM Eval Tool",
  description: "A tool for evaluating LLM performance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCReactProvider>
          <NavigationBar />
          {children}
          <ToastContainer />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
