import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { OAuthConfig } from 'next-auth/providers';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

interface YandexProfile {
  id: string;
  default_email: string;
  display_name: string;
  default_avatar_id: string;
}

const Yandex: OAuthConfig<YandexProfile> = {
  id: 'yandex',
  name: 'Yandex',
  type: 'oauth',
  authorization: 'https://oauth.yandex.ru/authorize',
  token: 'https://oauth.yandex.ru/token',
  userinfo: 'https://login.yandex.ru/info?format=json',
  clientId: process.env.AUTH_YANDEX_CLIENT_ID,
  clientSecret: process.env.AUTH_YANDEX_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      email: profile.default_email,
      name: profile.display_name,
      image: profile.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
        : null,
    };
  },
  allowDangerousEmailAccountLinking: true,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface JWT {
    id: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Yandex,
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      session.user.role = (token.role as string) || 'user';
      return session;
    },
  },
});
