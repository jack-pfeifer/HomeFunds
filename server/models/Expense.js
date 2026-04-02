const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  member: String,
  description: String,
  amount: Number,
  category: String,
  date: String,
  receiptUrl: String,
  receiptFileName: String,
});

module.exports = mongoose.model("Expense", expenseSchema);