import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/auth-context';
import { ModalProvider } from '@/contexts/modal-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WellnessHub - Employee Mental Health Platform',
  description: 'AI-powered employee mental health analytics and wellness tracking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ModalProvider>
            {children}
            <Toaster />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
