import mongoose, { Schema, model, models } from "mongoose";

const SecurityAlertSchema = new Schema({
  userPhone: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default models.SecurityAlert || model("SecurityAlert", SecurityAlertSchema);