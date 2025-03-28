// src/app/api/boxes/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path
import connectToDatabase from "@/lib/db"; // Adjust path
import Box from "@/models/Box"; // Adjust path
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and a Volunteer
  if (!session || session.user.role !== "Volunteer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // Filter boxes by sessionUser.id matching session.user.id
    const boxes = await Box.find({ "sessionUser.id": session.user.id }).lean();
    console.log("volunteer bbbbbboxes",boxes);
    

    return NextResponse.json({ boxes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return NextResponse.json({ error: "Failed to fetch boxes" }, { status: 500 });
  }
}