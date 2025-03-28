import connectToDatabase from "../../lib/db";
import Receipt from "../../models/Receipt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { donorName, amount, donationId } = req.body;

  try {
    const receipt = new Receipt({
      donorName,
      amount: parseInt(amount),
      donationId,
    });
    await receipt.save();
    res.status(201).json({ message: "Receipt created", id: receipt._id });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to create receipt" });
  }
}