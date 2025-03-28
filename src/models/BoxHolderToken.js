import mongoose from "mongoose";

const BoxHolderTokenSchema = new mongoose.Schema({
  expoPushToken: {type: String,unique: true, required: true,
  },
});

export default mongoose.models.BoxHolderToken || mongoose.model("BoxHolderToken", BoxHolderTokenSchema);