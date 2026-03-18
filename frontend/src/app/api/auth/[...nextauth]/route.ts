import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

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
                    console.log(
                        `🔍 1. Fetching user from backend: ${credentials.email}`,
                    );
                    const res = await fetch(
                        `http://localhost:3001/api/users/by-email/${credentials.email}`,
                    );

                    if (!res.ok) {
                        return null;
                    }

                    const user = await res.json();

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password,
                    );

                    if (!isPasswordValid) {
                        return null;
                    }
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('❌ Critical Connection Error:', error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = (user as any).role;
            return token;
        },
        async session({ session, token }) {
            if (session.user) (session.user as any).role = token.role;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
