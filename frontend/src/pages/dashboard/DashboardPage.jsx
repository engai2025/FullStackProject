import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import React, { useState } from 'react'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import DashboardWelcome from '../../components/dashboard/DashboardWelcome'
import ExpenseForm from '../../components/expense/ExpenseForm'
import ExpenseList from '../../components/expense/ExpenseList'
import api from '../../lib/api/apiClient'

const DashboardPage = () => {

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)


    const handleFormClose = () => {
        setShowCreateForm(false)
        setEditingExpense(null)
    }

    const handleCreateExpenseClick = () => {
        setShowCreateForm(true)
    }


    const expensesQuery = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const response = await api.get('/expenses');
            return response.data;
        },
        retry: 1,
    })



    const handleEditExpense = (expense) => {
        setEditingExpense(expense)
        setShowCreateForm(true)
    }

    if (expensesQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (expensesQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-red-500'>Error loading expenses: {expensesQuery.error.message}</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-background'>

            {/* header */}

            <DashboardHeader />

            {/* Main content */}
            <main className='max-w-7xl mx-auto  px-4 py-8 space-y-6'>

                {/* Welcome Section */}
                <DashboardWelcome
                    showCreateForm={showCreateForm}
                    onCreateExpense={handleCreateExpenseClick}
                />
                {/* Expenses Section */}
                <div>
                    <ExpenseList
                        expenses={expensesQuery.data || []}
                        isLoading={expensesQuery.isLoading}
                        onEdit={handleEditExpense}
                    />
                </div>
            </main>

            {/* Expense Dialog Form */}

            <ExpenseForm
                expense={editingExpense}
                open={showCreateForm || !!editingExpense}
                onOpenChange={handleFormClose}
            />

        </div>
    )
}

export default DashboardPage
