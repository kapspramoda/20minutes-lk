import mongoose, { Schema, Document, models } from "mongoose";

export interface IPasswordReset extends Document {
  phone: string;
  newPasswordPlain: string;
  status: string;
}

const PasswordResetSchema = new Schema(
  {
    phone: { type: String, required: true },
    newPasswordPlain: { type: String, required: true },
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

export default models.PasswordReset || mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);