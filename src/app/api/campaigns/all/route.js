// // src/app/api/campaigns/upcoming/route.js
// src/app/api/campaigns/upcoming/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Campaign from "../../../../models/Campaign";

export async function GET() {
  try {
    await connectToDatabase();
    const campaigns = await Campaign.find({}).lean(); // Fetch all campaigns

    // Transform campaigns to make featuredImage HTML-displayable
    const transformedCampaigns = campaigns.map((campaign) => {
      if (campaign.featuredImage) {
        // Convert Buffer to Base64 string
        const base64Image = Buffer.from(campaign.featuredImage.buffer).toString("base64");
        // Use featuredImageType if available, otherwise default to "image/jpeg"
        const mimeType = campaign.featuredImageType || "image/jpeg";
        // Replace featuredImage with a data URL
        campaign.featuredImage = `data:${mimeType};base64,${base64Image}`;
      }
      return campaign;
    });

    console.log("Transformed campaigns:", transformedCampaigns); // Debug log
    return NextResponse.json(transformedCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";
// import connectToDatabase from "../../../../lib/db";
// import Campaign from "../../../../models/Campaign";

// export async function GET() {
//   try {
//     await connectToDatabase();
//     const campaigns = await Campaign.find({}).lean(); // Fetch all campaigns
    
//     console.log("Fetched campaigns:", campaigns); // Debug log
//     return NextResponse.json(campaigns);
//   } catch (error) {
//     console.error("Error fetching campaigns:", error);
//     return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
//   }
// }