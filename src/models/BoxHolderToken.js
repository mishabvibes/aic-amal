import mongoose from "mongoose";

const BoxHolderTokenSchema = new mongoose.Schema({
  expoPushToken: {type: String,
  },
});

export default mongoose.models.BoxHolderToken || mongoose.model("BoxHolderToken", BoxHolderTokenSchema);