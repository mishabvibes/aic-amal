import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Campaign from "@/models/Campaign";

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const campaign = await Campaign.findByIdAndDelete(params.id);
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}