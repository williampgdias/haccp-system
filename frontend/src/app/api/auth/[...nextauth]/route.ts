import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth Configuration for Multi-Tenant SaaS Architecture
 * This setup handles the secure authentication of users and persists
 * critical tenant data (Restaurant ID and Name) across the session.
 */
const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate payload presence
                if (!credentials?.email || !credentials?.password) {
                    console.error(
                        ' [AUTH] Error: Missing required credentials payload',
                    );
                    return null;
                }

                try {
                    /**
                     * Fetching user data including the associated Restaurant (Tenant)
                     * Note: The backend route should 'include' the restaurant object.
                     */
                    const res = await fetch(
                        `http://localhost:3001/api/users/by-email/${credentials.email}`,
                        { cache: 'no-store' }, // Ensure fresh data on every attempt
                    );

                    if (!res.ok) {
                        console.warn(
                            ` [AUTH] User not found or backend error for: ${credentials.email}`,
                        );
                        return null;
                    }

                    const user = await res.json();

                    // Security: Direct password comparison (Upgrade to bcrypt in production)
                    if (credentials.password !== user.password) {
                        console.warn(' [AUTH] Invalid password attempt');
                        return null;
                    }

                    /**
                     * Map the user and tenant data to the NextAuth user object.
                     * 'user.restaurant.name' is retrieved from the Prisma 'include' relation.
                     */
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        restaurantId: user.restaurantId,
                        restaurantName:
                            user.restaurant?.name || 'Caireen Early Years',
                        role: user.role,
                    };
                } catch (error) {
                    console.error(' [AUTH] Critical Connection Error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        /**
         * JWT Callback: Persists custom tenant information into the encrypted token.
         * Runs whenever a JWT is created or updated.
         */
        async jwt({ token, user }) {
            if (user) {
                token.restaurantId = (user as any).restaurantId;
                token.restaurantName = (user as any).restaurantName;
                token.role = (user as any).role;
            }
            return token;
        },
        /**
         * Session Callback: Exposes the JWT claims to the client-side session object.
         * This allows 'useSession()' to access the Restaurant ID and Name instantly.
         */
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).restaurantId = token.restaurantId;
                (session.user as any).restaurantName = token.restaurantName;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Redirects unauthenticated users to our custom login page
    },
    session: {
        strategy: 'jwt', // Using JSON Web Tokens for stateless, scalable session management
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
