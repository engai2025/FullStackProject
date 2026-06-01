import { DollarSign, Search, Wallet } from 'lucide-react'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ExpenseCard from './ExpenseCard'

const EXPENSE_TABS = [
    { value: 'all', label: 'All', filter: () => true },
    { value: 'food', label: 'Food', filter: (e) => e.category === 'food' },
    { value: 'transport', label: 'Transport', filter: (e) => e.category === 'transport' },
    { value: 'other', label: 'Other', filter: (e) => !['food', 'transport'].includes(e.category) },
];

const ExpenseList = ({ expenses = [], onEdit }) => {

    const [searchTerm, setSearchTerm] = useState('');

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Filter expenses based on search term

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    })


    const getExpenseStats = () => {

        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        const now = new Date();
        const thisMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
        });
        const thisMonthSpent = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const categories = [...new Set(expenses.map(e => e.category))];

        const categorizedExpenses = {};
        EXPENSE_TABS.forEach(tab => {
            categorizedExpenses[tab.value] = filteredExpenses.filter(tab.filter);
        });

        const stats = {
            total: expenses.length,
            totalSpent,
            thisMonthSpent,
            thisMonthCount: thisMonthExpenses.length,
            categories: categories.length
        }

        return { stats, categorizedExpenses };
    }


    const { stats, categorizedExpenses } = getExpenseStats();


    const ExpenseGrid = ({ expenses, emptyMessage }) => {

        if (expenses.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="mx-auto max-w-md">
                        <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-sm font-medium text-foreground">No expenses found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                </div>
            );
        }


        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    expenses.map(expense => (
                        <ExpenseCard
                            key={expense._id}
                            expense={expense}
                            onEdit={onEdit}
                        />
                    ))
                }
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatAmount(stats.totalSpent)}</p>
                </div>


                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatAmount(stats.thisMonthSpent)}</p>
                </div>

                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Categories</p>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.categories}</p>
                </div>
            </div>

            {/* search input */}

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2  h-4 w-4 text-muted-foreground transform -translate-y-1/2" />

                    <Input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    {EXPENSE_TABS.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                            {tab.label}
                            <Badge variant="secondary">
                                {categorizedExpenses[tab.value]?.length ?? 0}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {EXPENSE_TABS.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <ExpenseGrid
                            expenses={categorizedExpenses[tab.value]}
                            emptyMessage={`No ${tab.label.toLowerCase()} expenses found.`}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default ExpenseList
