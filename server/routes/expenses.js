const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const Expense = require("../models/Expense");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, _id: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// CREATE expense with optional receipt
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const { member, description, amount, category, date } = req.body;

    const newExpense = new Expense({
      member,
      description,
      amount: Number(amount),
      category,
      date,
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : "",
      receiptFileName: req.file ? req.file.originalname : "",
    });

    const savedExpense = await newExpense.save();
    res.json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = router;