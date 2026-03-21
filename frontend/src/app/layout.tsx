import './globals.css';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import Navigation from '@/app/Navigation';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-slate-50" suppressHydrationWarning>
                <NextAuthProvider>
                    <div className="flex flex-col lg:flex-row min-h-screen">
                        <Navigation />
                        <div className="flex-1 flex flex-col min-w-0">
                            <Header />
                            <main className="flex-1">{children}</main>
                        </div>
                    </div>
                    <Toaster position="bottom-right" />
                </NextAuthProvider>
            </body>
        </html>
    );
}
