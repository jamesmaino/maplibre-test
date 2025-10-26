
import NextAuth, { type User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const users = [
          { id: "1", name: "user1", password: "pass1", group: "admin" },
          { id: "2", name: "user2", password: "pass2", group: "user" }
        ]

        const user = users.find(user => user.name === credentials?.username && user.password === credentials?.password)

        if (user) {
          return user
        } else {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.group = (user as any).group
      }
      return token
    },
    async session({ session, token }) {
      session.user.group = token.group as string
      return session
    }
  }
})

export { handler as GET, handler as POST }
