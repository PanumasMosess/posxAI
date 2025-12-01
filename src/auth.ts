import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { signInSchema_ } from "./lib/formValidationSchemas";
import { userSignIn } from "./lib/auth-helpers";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        username: {
          label: "USERNAME",
          type: "text",
          placeholder: "username ผู้ใช้งาน",
        },
        password: {
          label: "PASSWORD",
          type: "password",
          placeholder: "รหัสผ่าน ผู้ใช้งาน",
        },
      },
      async authorize(credentials) {
        let signInResult = null;

        const parsedCredentials = signInSchema_.safeParse(credentials);
        if (!parsedCredentials.success) {
          // console.error("Invalid credentials:", parsedCredentials.error.errors);
          return null;
        }

        const { username, password } = parsedCredentials.data;
        signInResult = await userSignIn({ username, password });

        if (!signInResult) {
          // console.log("Invalid credentials");
          return null;
        }

        return signInResult;
      },
    }),
  ],
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isProtectedRoute =
        pathname.startsWith("/home") || pathname.startsWith("/stock");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.employees.findFirst({
            where: { id_google: profile?.sub },
          });

          if (!existingUser) {
            await prisma.employees.create({
              data: {
                name: user.name ?? "",
                surname: "",
                email: user.email,
                img: user.image,
                id_google: profile?.sub,
                username: user.email!,
                password: "password_google",
                status: "ON",
                position_id: 2,
                login_fail: 0,
                created_by: "Google Sign-In",
                organizationId: 0,
                birthday: new Date(),
              },
            });
          }
        } catch (error) {
          // console.error("Error creating user from Google OAuth:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (account?.provider === "google") {
        if (user) {
          const dbUser = await prisma.employees.findFirst({
            where: { id_google: profile?.sub },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.name = dbUser.name;
            token.surname = dbUser.surname;
            token.status = dbUser.status;
            token.login_fail = dbUser.login_fail;
            token.birthday = dbUser.birthday;
            token.position_id = dbUser.position_id;
            token.email = dbUser.email;
            token.image = dbUser.img;
            token.organizationId = dbUser.organizationId;
          }
        }
        return token;
      } else {
        if (user) {
          token.id = user.id;
          token.surname = user.surname;
          token.status = user.status;
          token.login_fail = user.login_fail;
          token.birthday = user.birthday;
          token.position_id = user.position_id;
          token.email = user.email;
          token.image = user.image;
          token.organizationId = user.organizationId;
        }
        if (trigger === "update" && session) {
          token = { ...token, ...session };
        }
        return token;
      }
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.surname = token.surname as string;
      session.user.status = token.status as string;
      session.user.login_fail = token.login_fail as number;
      session.user.birthday = token.birthday as Date;
      session.user.position_id = token.position_id as number;
      session.user.image = token.image as string | null;
      session.user.email = token.email as string;
      session.user.organizationId = token.organizationId as number | 1;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
