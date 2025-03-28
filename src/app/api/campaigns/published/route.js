// src/app/api/campaigns/published/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Campaign from "../../../../models/Campaign";

export async function GET() {
  try {
    await connectToDatabase();
    const campaigns = await Campaign.find({ status: "active" }).lean();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

