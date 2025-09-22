import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema_ } from "./lib/formValidationSchemas";
import { userSignIn } from "./lib/auth-helpers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
        let signInResult  = null;

        const parsedCredentials = signInSchema_.safeParse(credentials);
        if (!parsedCredentials.success) {
          // console.error("Invalid credentials:", parsedCredentials.error.errors);
          return null;
        }

        const { username, password } = parsedCredentials.data;
        signInResult  = await userSignIn({ username, password });

        if (!signInResult) {
          // console.log("Invalid credentials");
          return null
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.surname = user.surname;
        token.status = user.status;
        token.login_fail = user.login_fail;
        token.birthday = user.birthday;
        token.position_id = user.position_id;
        token.email = user.email;
        token.image = user.image;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.surname = token.surname as string;
      session.user.status = token.status as string;
      session.user.login_fail = token.login_fail as number;
      session.user.birthday = token.birthday as Date;
      session.user.position_id = token.birthday as number;
      session.user.image = token.image as string;
      session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
