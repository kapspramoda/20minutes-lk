import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("කරුණාකර දුරකථන අංකය සහ මුරපදය ලබා දෙන්න.");
        }

        await connectToDatabase();
        const user = await User.findOne({ phone: credentials.phone });

        if (!user) {
          throw new Error("මෙම අංකයෙන් ගිණුමක් සොයාගත නොහැක. කරුණාකර ලියාපදිංචි වන්න.");
        }

        // මුරපදය නිවැරදි දැයි පරීක්ෂා කිරීම
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("ඔබ ඇතුළත් කළ මුරපදය වැරදියි.");
        }

        // සාර්ථක නම් User ගේ විස්තර Session එකට යැවීම
        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  // රහස්‍ය කේතයක් (මෙය .env ෆයිල් එකෙන් ලබා ගනී)
  secret: process.env.NEXTAUTH_SECRET || "20minuteslk_super_secret_key_2026",
});

export { handler as GET, handler as POST };