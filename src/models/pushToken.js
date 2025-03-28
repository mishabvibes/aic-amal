import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema({
    expoPushToken:{type:String},
   
});

export default mongoose.models.PushToken || mongoose.model("PushToken", PushTokenSchema);