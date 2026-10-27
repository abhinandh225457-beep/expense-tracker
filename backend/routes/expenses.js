
import express from "express";
import Expense from "../models/Expense.js";

const router = express.Router();

const validCategories = [
  "Food", "Travel", "Bills", "Shopping", "Other"
];

function validExpense(data) {
  const { title, amount, category, date } = data;

  return (
    typeof title === "string" &&
    title.trim().length > 0 &&
    title.trim().length <= 100 &&
    typeof amount === "number" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    validCategories.includes(category) &&
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date
  );
}

// View all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// Add expense
router.post("/", async (req, res) => {
  try {
    if (!validExpense(req.body)) {
      return res.status(400).json({ message: "Invalid expense details" });
    }

    const expense = await Expense.create({
      ...req.body,
      title: req.body.title.trim(),
    });

    res.status(201).json(expense);
  } catch {
    res.status(500).json({ message: "Failed to add expense" });
  }
});

// Edit expense
router.put("/:id", async (req, res) => {
  try {
    if (!validExpense(req.body)) {
      return res.status(400).json({ message: "Invalid expense details" });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...req.body, title: req.body.title.trim() },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch {
    res.status(400).json({ message: "Unable to update expense" });
  }
});

// Delete expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch {
    res.status(400).json({ message: "Unable to delete expense" });
  }
});

export default router;
