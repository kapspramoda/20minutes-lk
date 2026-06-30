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

const CourseSchema = new Schema({
  title: { type: String, required: true },
  whatsappLink: { type: String },
  subjects: [SubjectSchema],
  
  // 🔴 අලුතින් එකතු කළ කොටස: පාඨමාලාව Hide/Show කිරීම සඳහා
  isVisible: { type: Boolean, default: true }, 
  
}, { 
  timestamps: true 
});

const Course = models.Course || model("Course", CourseSchema);

export default Course;