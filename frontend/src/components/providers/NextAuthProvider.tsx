'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface NextAuthProviderProps {
    children: ReactNode;
}

/**
 * NextAuthProvider
 * Centrally manages the NextAuth session context for the entire application.
 * Must wrap the application in layout.tsx.
 */
export default function NextAuthProvider({ children }: NextAuthProviderProps) {
    return (
        // Wraps everything in the NextAuth context so useSession works everywhere
        <SessionProvider>{children}</SessionProvider>
    );
}
