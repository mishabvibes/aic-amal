import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Subscription from "@/models/Subscription";

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const subscriptions = await Subscription.find({ method: "manual" }).lean();
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching manual subscriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}