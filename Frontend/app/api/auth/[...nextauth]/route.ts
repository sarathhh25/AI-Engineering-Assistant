import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim()

const githubClientId = (process.env.GITHUB_ID || process.env.GITHUB_CLIENT_ID || '').trim()
const githubClientSecret = (process.env.GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || '').trim()

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

// Credentials provider backed by FastAPI backend with bcrypt password verification
providers.push(
  CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      try {
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        })
        if (!res.ok) return null // wrong password / unknown user -> reject

        const data = await res.json()
        return {
          id: String(data.user.id),
          name: data.user.full_name,
          email: data.user.email,
          // carry the backend session token through the JWT so API calls can use it
          backendToken: data.token,
        } as any
      } catch {
        return null
      }
    },
  })
)

const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
if (!secret) {
  throw new Error('NEXTAUTH_SECRET (or AUTH_SECRET) must be set - no insecure default is allowed.')
}

export const authOptions: NextAuthOptions = {
  providers,
  secret,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        const u = session.user as any
        if (token?.id || token?.sub) {
          u.id = token.id || token.sub
        }
        if (token?.backendToken) {
          const s = session as any
          s.backendToken = token.backendToken
          u.backendToken = token.backendToken
        }
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
        if ((user as any).backendToken) {
          token.backendToken = (user as any).backendToken
        } else if (user.email) {
          // Synchronize OAuth SSO user with FastAPI backend to issue session token
          const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
          const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || ''
          try {
            const res = await fetch(`${backendUrl}/api/auth/sso-sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Internal-Secret': secret,
              },
              body: JSON.stringify({
                email: user.email,
                full_name: user.name || user.email.split('@')[0],
                auth_provider: account?.provider || 'oauth',
                avatar_url: user.image || null,
                github_access_token: account?.provider === 'github' ? account.access_token : undefined,
              }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.token) {
                token.backendToken = data.token
                token.id = String(data.user.id)
              }
            }
          } catch (err) {
            console.error('Failed to sync OAuth user with backend:', err)
          }
        }
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
