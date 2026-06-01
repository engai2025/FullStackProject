
import express from 'express'
import { createExpense, deleteExpense, getMyExpenses, updateExpense } from '../controllers/expenseController.js';
import { protect } from '../middlewares/auth.js'

const router = express.Router();

/**
 * @swagger
 * /expenses:
 *  get:
 *      summary: Get All expenses for the logged-in user
 *      tags: [Expenses]
 *      security:
 *         - bearerAuth: []
 *      responses: 
 *          200:
 *             description: A List of expenses     
 */
router.get('/', protect, getMyExpenses);

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [food, rent, transport, utilities, entertainment, shopping, health, other]
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created
 */


router.post('/', protect, createExpense);
/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Update an expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense updated
 */



router.put('/:id', protect, updateExpense);

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expense deleted
 */
router.delete('/:id', protect, deleteExpense);

// export the router
export default router;
