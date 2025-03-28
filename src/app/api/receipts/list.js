import connectToDatabase from "../../lib/db";
import Receipt from "../../models/Receipt";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  try {
    const receipts = await Receipt.find({});
    res.status(200).json(receipts);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
}