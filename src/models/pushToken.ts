// src/models/pushToken.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPushToken extends Document {
    user?: Schema.Types.ObjectId;
    expoPushToken: string;
    deviceInfo?: {
        platform?: string;
        deviceName?: string;
        appVersion?: string;
    };
    isActive: boolean;
    lastUsed: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false, // Optional for anonymous users
        },
        expoPushToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        deviceInfo: {
            platform: String,
            deviceName: String,
            appVersion: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastUsed: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.models.PushToken ||
    mongoose.model<IPushToken>("PushToken", PushTokenSchema);