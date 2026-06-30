import mongoose, { Schema, model, models } from "mongoose";

// 1. පාඩමක (Lesson) අච්චුව
const LessonSchema = new Schema({
  lessonId: { type: String, required: true }, // උදා: "l1"
  title: { type: String, required: true },    // උදා: "1 වන පාඩම"
  videoEmbed: { type: String, required: true },// YouTube ලින්ක් එක
  pdfUrl: { type: String },                   // Tute එකේ ලින්ක් එක
});

// 2. විෂයක (Subject) අච්චුව
const SubjectSchema = new Schema({
  subjectId: { type: String, required: true }, // උදා: "sub1"
  name: { type: String, required: true },      // උදා: "සාමාන්‍ය දැනීම (GK)"
  liveClass: {
    time: { type: String },                    // උදා: "ඉරිදා රාත්‍රී 8"
    zoomLink: { type: String }                 // Zoom ලින්ක් එක
  },
  lessons: [LessonSchema],                     // මේ විෂයට අදාළ පාඩම් ලැයිස්තුව
});

// 3. ප්‍රධාන පාඨමාලාවේ (Course) අච්චුව
const CourseSchema = new Schema({
  title: { type: String, required: true },     // පාඨමාලාවේ නම
  whatsappLink: { type: String },              // WhatsApp ගෲප් ලින්ක් එක
  subjects: [SubjectSchema],                   // පාඨමාලාවේ විෂයයන් ලැයිස්තුව
}, { 
  timestamps: true // පාඨමාලාව හැදූ වේලාව සහ අප්ඩේට් කළ වේලාව ඉබේම සේව් වීමට
});

// කලින් Model එකක් හැදිලා තියෙනවා නම් ඒක පාවිච්චි කරන්න, නැත්නම් අලුතින් හදන්න
const Course = models.Course || model("Course", CourseSchema);

export default Course;