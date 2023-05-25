import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { User } from 'next-auth'

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',		// The name to display on the sign in form
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials, req) {
				const user: User = { id: '1' }

				if (process.env.BASIC_AUTH_USERNAME === credentials?.username && process.env.BASIC_AUTH_PASSWORD === credentials?.password) {
					return user
				}

				return null

			}
		})
	],
}

export default NextAuth(authOptions)