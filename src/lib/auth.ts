import  { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import admin from "firebase-admin";
import Admin from "@/models/Admin";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";
import Box from "@/models/Box";

// Define a common interface for all user-like models
interface AuthUser {
  _id: string; // Assuming ObjectId is converted to string
  phone?: string;
  email?: string;
  name?: string;
  role?: string;
}

// Extend NextAuth's User type for custom fields
interface ExtendedUser extends NextAuthUser {
  phone?: string;
  role?: string;
}

// Extend JWT to include custom fields
interface ExtendedJWT extends JWT {
  id?: string;
  phone?: string;
  role?: string;
}

// Extend Session to include custom fields
interface ExtendedSession extends Session {
  user: {
    id?: string;
    phone?: string;
    role?: string;
    name?: string | null;
    email?: string | null;
  };
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        phone: { label: "Phone", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          if (!credentials?.idToken || !credentials.phone || !credentials.role) {
            throw new Error("Missing credentials");
          }

          const userCredential = await admin.auth().verifyIdToken(credentials.idToken);
          const firebaseUser = userCredential;
          console.log("✅ Firebase Verified User:", firebaseUser);

          await dbConnect();

          // Check for user in different collections with explicit typing
          let auth: AuthUser | null = await User.findOne({
            $and: [
              { phone: firebaseUser.phone_number },
              { role: credentials.role },
            ],
          });
          if (!auth)
            auth = await Admin.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            });
          if (!auth)
            auth = await Volunteer.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            });
          if (!auth)
            auth = await Donor.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            });
          if (!auth)
            auth = await Box.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            });

          if (!auth) {
            console.error(" No user found with phone:", firebaseUser.phone_number);
            throw new Error("User not found. Please register first.");
          }

          console.log("✅ Authenticated User:", auth);

          // Return user object with required fields
          return {
            id: auth._id.toString(), // Convert ObjectId to string
            phone: auth.phone || firebaseUser.phone_number || "", // Fallback to empty string
            email: auth.email || "",
            name: auth.name || "Unknown",
            role: auth.role || "user",
          };
        } catch (error) {
          console.error(" Error verifying Firebase token:", error);
          throw new Error("Authentication failed. Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: ExtendedJWT; user?: ExtendedUser }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
      }
      console.log("JWT Token:", token); // Debugging
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: ExtendedJWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.role = token.role;
      }
      console.log("Session Updated:", session); // Debugging
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
