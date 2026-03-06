import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create NextAuth instance
const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export handlers for the API route
export const { GET, POST } = handlers;

// Export auth functions for use in other parts of the app
export { auth, signIn, signOut };
