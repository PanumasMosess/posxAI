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
        if (!parsedCredentials.success) return null;

        const { username, password } = parsedCredentials.data;
        signInResult = await userSignIn({ username, password });

        if (!signInResult) return null;
        return signInResult;
      },
    }),
  ],
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isProtectedRoute =
        pathname.startsWith("/home") ||
        pathname.startsWith("/stock") ||
        pathname.startsWith("/menu") ||
        pathname.startsWith("/menu") ||
        pathname.startsWith("/payments") ||
        pathname.startsWith("/settings");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          let existingUser = await prisma.employees.findFirst({
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
                status: "INACTIVE",
                position_id: 2,
                login_fail: 0,
                created_by: "Google Sign-In",
                organizationId: 0,
                birthday: new Date(),
              },
            });

            throw new Error(
              "บัญชีถูกสร้างเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติ (Wait for Admin Approval)"
            );
          }

          if (existingUser.status !== "ACTIVE") {
            throw new Error(
              "บัญชีของคุณยังไม่ได้รับการอนุมัติ หรือถูกระงับการใช้งาน (Contact Admin)"
            );
          }

          return true;
        } catch (error) {
          let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          throw new Error(errorMessage);
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
            token.position_id = dbUser.position_id;
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
          token.position_id = user.position_id;
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
      session.user.position_id = token.position_id as number;
      session.user.image = token.image as string | null;
      session.user.organizationId = token.organizationId as number | 1;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/", 
  },
});
