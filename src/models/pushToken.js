import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema({
    expoPushToken:{type:String, unique:true, // Enforces uniqueness
        required: true,},
   
});

export default mongoose.models.PushToken || mongoose.model("PushToken", PushTokenSchema);