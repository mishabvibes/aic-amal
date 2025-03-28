// src/app/api/campaigns/route.js
import Campaign from "../../../../models/Campaign"; // Adjust path if necessary
import connectToDatabase from "../../../../lib/db"; // Adjust path if necessary

export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const campaigns = await Campaign.find(status ? { status } : {}).lean();

    // Transform campaigns to include Base64 image data
    const transformedCampaigns = campaigns.map((campaign) => {
      if (campaign.featuredImage) {
        // Convert Buffer to Base64
        const base64Image = Buffer.from(campaign.featuredImage.buffer).toString("base64");
        // Assume MIME type if not stored; adjust if you have a `featuredImageType` field
        const mimeType = campaign.featuredImageType || "image/jpeg"; // Default to JPEG if type is unknown
        campaign.featuredImage = `data:${mimeType};base64,${base64Image}`;
      }
      return campaign;
    });

    return new Response(JSON.stringify(transformedCampaigns), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch campaigns" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// export async function DELETE(req, { params }) {
//   await connectToDatabase();
//   const id = params.id || req.url.split("/").pop(); // Fallback for dynamic route

//   try {
//     const campaign = await Campaign.findByIdAndDelete(id);
//     if (!campaign) {
//       return new Response(JSON.stringify({ error: "Campaign not found" }), { status: 404 });
//     }
//     return new Response(JSON.stringify({ message: "Campaign deleted" }), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Failed to delete campaign" }), { status: 500 });
//   }
// }

// For dynamic route: src/app/api/campaigns/[id]/route.js
export async function DELETE(req, { params }) {
  await connectToDatabase();

  try {
    const campaign = await Campaign.findByIdAndDelete(params.id);
    if (!campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: "Campaign deleted" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete campaign" }), { status: 500 });
  }
}