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

        // 🔴 අලුත් කොටස: Admin ද යන්න .env හරහා පරීක්ෂා කිරීම
        if (
          credentials.phone === process.env.ADMIN_PHONE && 
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          const adminSessionId = "admin-session-" + Date.now().toString();
          return {
            id: "admin-id",
            name: "Admin",
            phone: credentials.phone,
            role: "admin",
            sessionId: adminSessionId,
          };
        }

        // Admin නොවේ නම්, සාමාන්‍ය ළමයින්ගේ Database පරීක්ෂාව
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

        // Login එක සාර්ථක වූ විට අලුත් Session ID එකක් සෑදීම
        const newSessionId = Date.now().toString() + Math.random().toString(36).substring(2);
        
        // එම අලුත් Session ID එක Database හි User ගේ ගිණුමට සේව් කිරීම (Update කිරීම)
        await User.findByIdAndUpdate(user._id, { activeSessionId: newSessionId });

        // සාර්ථක නම් User ගේ විස්තර Session එකට යැවීම
        return {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role,
          sessionId: newSessionId, 
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
        token.sessionId = (user as any).sessionId; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
        (session.user as any).role = token.role;
        (session.user as any).sessionId = token.sessionId; 
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET || "20minuteslk_super_secret_key_2026",
});

export { handler as GET, handler as POST };