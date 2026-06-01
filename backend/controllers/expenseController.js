import Expense from "../models/Expense.js";

export const createExpense = async (req, res, next) => {

    try {
        const expense = await Expense.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(expense)
    } catch (error) {
        next(error)
    }
}

export const getMyExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ createdBy: req.user._id }).sort({ date: -1, createdAt: -1 })
        res.json(expenses)
    } catch (error) {
        next(error)
    }
}

export const updateExpense = async (req, res, next) => {

    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true }
        );

        if (!expense) return res.status(404).json("Expense not found")
        res.json(expense)
    } catch (error) {
        next(error)
    }
}

export const deleteExpense = async (req, res, next) => {

    try {
        const expense = await Expense.findOneAndDelete(
            { _id: req.params.id, createdBy: req.user._id }
        );
        if (!expense) return res.status(404).json("Expense not found")

        res.json({ message: "Expense deleted" })

    } catch (error) {
        next(error)
    }
}
