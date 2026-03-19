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
        <html lang="en">
            <body className="bg-slate-50">
                <NextAuthProvider>
                    <div className="flex flex-col lg:flex-row min-h-screen">
                        {/* Nav sempre dentro do Provider */}
                        <Navigation />

                        <div className="flex-1 flex flex-col min-w-0">
                            <Header />
                            <main className="flex-1">{children}</main>
                        </div>
                    </div>
                    <Toaster position="top-right" />
                </NextAuthProvider>
            </body>
        </html>
    );
}
