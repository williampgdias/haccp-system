import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/users/by-email/${credentials.email}`,
                        { cache: 'no-store' },
                    );

                    if (!res.ok) return null;

                    const user = await res.json();

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password,
                    );

                    if (!isPasswordCorrect) {
                        console.warn('[AUTH] Password mismatch');
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        restaurantId: user.restaurantId,
                        restaurantName: user.restaurant?.name || 'My Kitchen',
                        role: user.role,
                    };
                } catch (error) {
                    console.error('[AUTH] Connection Error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.restaurantId = user.restaurantId;
                token.restaurantName = user.restaurantName;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.restaurantId = token.restaurantId;
                session.user.restaurantName = token.restaurantName;
                session.user.role = token.role;
            }

            // Generate a JWT that the backend can verify
            // This is the token sent in Authorization header
            const secret = process.env.NEXTAUTH_SECRET;
            if (secret) {
                session.accessToken = jwt.sign(
                    {
                        sub: token.sub,
                        email: token.email,
                        restaurantId: token.restaurantId,
                        role: token.role,
                    },
                    secret,
                    { expiresIn: '8h' },
                );
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
