/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            restaurantId: string;
            restaurantName: string;
            role: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        restaurantId: string;
        restaurantName: string;
        role: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        restaurantId: string;
        restaurantName: string;
        role: string;
    }
}
