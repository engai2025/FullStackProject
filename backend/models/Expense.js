import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ["food", "rent", "transport", "utilities", "entertainment", "shopping", "health", "other"],
            default: "other"
        },
        description: String,
        date: { type: Date, default: Date.now },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, { timestamps: true, collection: 'expenses' }
);

export default mongoose.model('Expense', expenseSchema, 'expenses')
