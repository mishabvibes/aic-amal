import connectToDatabase from "../../lib/db";
import Receipt from "../../models/Receipt";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  await connectToDatabase();

  const { id } = req.query;

  try {
    const receipt = await Receipt.findById(id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json(receipt);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
}