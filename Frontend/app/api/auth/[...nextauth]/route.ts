import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ''

const githubClientId = process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || ''
const githubClientSecret = process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || ''

const providers: NextAuthOptions['providers'] = []

if (googleClientId && googleClientSecret) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  )
}

if (githubClientId && githubClientSecret) {
  providers.push(
    GitHubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      authorization: {
        params: {
          scope: 'read:user repo',
        },
      },
    })
  )
}

// Credentials provider for work email and local developer login
providers.push(
  CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      name: { label: 'Name', type: 'text' },
      image: { label: 'Image', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null
      const rawName = credentials.name || credentials.email.split('@')[0]
      const name = rawName
        .split(/[\._]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')

      return {
        id: `user-${Date.now()}`,
        name: name || 'Developer',
        email: credentials.email,
        image: credentials.image || null,
      }
    },
  })
)

export const authOptions: NextAuthOptions = {
  providers,
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
      if (token?.accessToken) {
        // @ts-ignore
        session.accessToken = token.accessToken
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        if (user.name) token.name = user.name
        if (user.email) token.email = user.email
        if (user.image) token.picture = user.image
      }
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
