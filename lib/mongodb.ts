import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("කරුණාකර .env ෆයිල් එකේ MONGODB_URI එක ඇතුළත් කරන්න.");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // 🔴 අලුත් වෙනස: Database Connection එක වේගවත් කිරීමට සැකසුම් (Options) වෙනස් කිරීම
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // එකවර හදන Connections ගණන 10කට සීමා කරයි (මෙයින් සර්වර් එක හිරවීම නවතී)
      serverSelectionTimeoutMS: 5000, // තත්පර 5ක් ඇතුළත ඉක්මනින් Connect වේ (Loading වෙලා තියෙන එක නවතී)
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log("MongoDB සම්බන්ධ විය! (Optimized)");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;