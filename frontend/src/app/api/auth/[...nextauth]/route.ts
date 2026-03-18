import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Error: Missing email or password');
                    return null;
                }

                try {
                    // Fetching user + restaurant from out new backend route
                    const res = await fetch(
                        `http://localhost:3001/api/users/by-email/${credentials.email}`,
                    );

                    if (!res.ok) {
                        return null;
                    }

                    const user = await res.json();

                    if (credentials.password !== user.password) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        restaurantId: user.restaurantId,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('❌ Critical Connection Error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        // Save restaurantId into the JWT token
        async jwt({ token, user }) {
            if (user) {
                token.restaurantId = (user as any).restaurantId;
                token.role = (user as any).role;
            }
            return token;
        },
        // Pass restaurantId from the token to the Session
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).restaurantId = token.restaurantId;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
});

export { handler as GET, handler as POST };
