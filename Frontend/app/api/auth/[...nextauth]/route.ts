import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const clientId = process.env.GOOGLE_CLIENT_ID || ''
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

if (!clientId || !clientSecret) {
  console.warn(
    '[NextAuth Warning] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set in Frontend/.env.local.'
  )
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
    }),
  ],
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'ai-engineering-assistant-development-secret-key-32-chars-long',
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

