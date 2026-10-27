
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Travel", "Bills", "Shopping", "Other"],
  },
  date: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Expense", expenseSchema);
