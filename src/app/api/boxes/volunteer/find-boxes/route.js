

import connectToDatabase from "@/lib/db"; // Adjust path
import Box from "@/models/Box"; // Adjust path
import Donation from "@/models/Donation"; // For consistency


// Helper function to determine payment status
function getPaymentStatus(lastPayment) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  if (!lastPayment) {
    return "Pending";
  }

  const lastPaymentDate = new Date(lastPayment);
  const paymentYear = lastPaymentDate.getFullYear();
  const paymentMonth = lastPaymentDate.getMonth();

  // Paid if last payment is in the current month/year
  const isPaid = paymentYear === currentYear && paymentMonth === currentMonth;
  return isPaid ? "Paid" : "Pending";
}

export async function GET(request) {
  try {

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
   
    // const { searchParams } = new URL(request.url);
    //   const id = searchParams.get("id");
  
    const sessionUserId = id

    if (!sessionUserId) {
      return new Response(JSON.stringify({ error: "Unauthorized, please log in" }), {
        status: 401,
      });
    }

    await connectToDatabase();
    const boxes = await Box.find({ "sessionUser.id": sessionUserId })
      .select("serialNumber name mobileNumber lastPayment isActive")
      .lean();

    if (!boxes.length) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Add payment status and latest donation details
    const boxesWithDetails = await Promise.all(
      boxes.map(async (box) => {
        const paymentStatus = getPaymentStatus(box.lastPayment);
        const latestDonation = await Donation.findOne({ boxId: box._id })
          .sort({ createdAt: -1 })
          .select("amount razorpayPaymentId createdAt")
          .lean();

        return {
          ...box,
          paymentStatus, // "Paid" or "Pending"
          latestPayment: latestDonation
            ? {
                amount: latestDonation.amount,
                paymentId: latestDonation.razorpayPaymentId,
                date: latestDonation.createdAt,
              }
            : null,
        };
      })
    );

    return new Response(JSON.stringify(boxesWithDetails), { status: 200 });
  } catch (error) {
    console.error("Error fetching boxes:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


// src/app/api/boxes/volunteer/find-boxes/route.js
// import connectToDatabase  from "../../../../lib/db"; // Adjust path to your MongoDB connection
// import { getServerSession } from "next-auth";
// import Box from "@/app/models/Box";
// import { authOptions } from "../../../../api/auth/[...nextauth]/route"; // Adjust path to your authOptions

// export async function GET(req) {
//     try {
//       // Connect to the database
//       await connectToDatabase();
  
//       // Get the session from the server
//       const session = await getServerSession(authOptions);
  
//       console.log("Session:", session); // Debug: Log the session
  
//       if (!session || !session.user || !session.user.id) {
//         return new Response(JSON.stringify({ error: "Unauthorized" }), {
//           status: 401,
//           headers: { "Content-Type": "application/json" },
//         });
//       }
  
//       const sessionUserId = session.user.id;
//       console.log("Session User ID:", sessionUserId); // Debug: Log the user ID
  
//       // Fetch boxes matching the sessionUser.id
//       const boxes = await Box.find({ "sessionUser.id": sessionUserId }).exec();
//       console.log("Boxes fetched:", boxes); // Debug: Log the result
  
//       return new Response(JSON.stringify(boxes), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     } catch (error) {
//       console.error("Error in GET /api/boxes/volunteer/find-boxes:", error); // Log the error
//       return new Response(
//         JSON.stringify({ error: "Failed to fetch boxes", details: error.message }),
//         {
//           status: 500,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }
//   }