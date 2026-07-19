import mongoose, { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // පිළිතුරු 4
  correctOptionIndex: { type: Number, required: true } // නිවැරදි පිළිතුරේ Index එක (0, 1, 2, 3)
});

const QuizSchema = new Schema({
  courseId: { type: String, required: true }, // කුමන පාඨමාලාවට අදාළද කියා හඳුනා ගැනීමට
  title: { type: String, required: true }, // Paper එකේ නම
  pdfUrl: { type: String, default: "" },
  questions: [QuestionSchema],
  isVisible: { type: Boolean, default: true } // Hide/Show කිරීමට
}, { timestamps: true });

export default models.Quiz || model("Quiz", QuizSchema);