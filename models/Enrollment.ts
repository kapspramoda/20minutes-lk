import mongoose, { Schema, Document, models } from "mongoose"; // models import එකතු කළා

// ... IEnrollment interface එක ...

const EnrollmentSchema = new Schema(
  {
    // ... අනිත් fields ...
    amount: { type: Number, default: 0 },
    slipImage: { type: String, required: false }, // 🔴 required: false විය යුතුමයි!
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

// 🔴 Model එක compile කිරීමේ ආරක්ෂිත ක්‍රමය (වැදගත්)
const Enrollment = models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;