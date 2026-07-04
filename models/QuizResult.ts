import mongoose, { Schema, model, models } from "mongoose";

const QuizResultSchema = new Schema({
  userPhone: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true }, // ළමයා ගත් ලකුණු
  totalQuestions: { type: Number, required: true }, // මුළු ප්‍රශ්න ගණන
  studentAnswers: [{ type: Number }] // ළමයා තෝරපු පිළිතුරු වල ලැයිස්තුව (Review එක පෙන්වීමට)
}, { timestamps: true });

export default models.QuizResult || model("QuizResult", QuizResultSchema);