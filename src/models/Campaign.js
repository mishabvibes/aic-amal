// src/models/Campaign.js
const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ["fundraising", "physical", "fixedamount"],
  },
  goal: {
    type: Number,
    required: [
      function () {
        return !this.isInfinite;
      },
      "Goal is required unless campaign is infinite",
    ],
    min: [1, "Goal must be at least 1"],
    default: undefined,
  },
  area: {
    type: String, // Ensure this is String, not Number
    required: [
      function () {
        return this.type === "fixedamount";
      },
      "Area is required for fixed amount campaigns",
    ],
    trim: true,
    default: undefined,
  },
  rate: {
    type: Number,
    required: [
      function () {
        return this.type === "fixedamount";
      },
      "Rate is required for fixed amount campaigns",
    ],
    min: [1, "Rate must be at least 1"],
    default: undefined,
  },
  isInfinite: { type: Boolean, default: false },
  description: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // targetAudience: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" },
  status: { type: String, default: "draft" },
  currentAmount: { type: Number, default: 0, min: 0 },
  featuredImage: { type: Buffer },
  featuredImageType: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);