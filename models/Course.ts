import mongoose, { Schema, model, models } from "mongoose";

const LessonSchema = new Schema({
  lessonId: { type: String, required: true },
  title: { type: String, required: true },
  videoEmbed: { type: String, required: true },
  pdfUrl: { type: String },
});

const SubjectSchema = new Schema({
  subjectId: { type: String, required: true },
  name: { type: String, required: true },
  liveClass: {
    time: { type: String },
    zoomLink: { type: String }
  },
  lessons: [LessonSchema],
});

// 🔴 අලුතින් බැංකු ගිණුම් සඳහා හැදූ අච්චුව
const BankAccountSchema = new Schema({
  bankName: { type: String, required: true }, // උදා: BOC, ComBank
  branch: { type: String, required: true },
  accNumber: { type: String, required: true },
  accName: { type: String, required: true },
});

const CourseSchema = new Schema({
  title: { type: String, required: true },
  coverImage: { type: String },               // 🔴 අලුත්: Cover Picture (Base64)
  price: { type: String, required: true },    // 🔴 අලුත්: Course Price (උදා: රු. 2500)
  whatsappLink: { type: String },
  notification: { type: String, default: "" }, // 🔴 අලුත්: Notification පණිවිඩය
  bankAccounts: [BankAccountSchema],          // 🔴 අලුත්: Bank Accounts ලැයිස්තුව
  subjects: [SubjectSchema],
  isVisible: { type: Boolean, default: true },
}, { 
  timestamps: true 
});

const Course = models.Course || model("Course", CourseSchema);

export default Course;