import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'

const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Food' },
    { value: 'rent', label: 'Rent' },
    { value: 'transport', label: 'Transport' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' }
];


const ExpenseForm = ({ expense, open = true, onOpenChange }) => {


    // State for form values
    const [formValues, setFormValues] = useState({
        title: '',
        amount: '',
        category: 'other',
        description: '',
        date: ''
    })
    const [validationError, setValidationError] = useState(null)


    useEffect(() => {

        if (expense) {
            setFormValues({
                title: expense.title || '',
                amount: expense.amount?.toString() || '',
                category: expense.category || 'other',
                description: expense.description || '',
                date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : ''
            });
        } else {
            setFormValues({
                title: '',
                amount: '',
                category: 'other',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
        setValidationError(null);

    }, [expense, open])


    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({
            ...formValues,
            [name]: value
        })
    }


    const handleCategoryChange = (value) => {

        setFormValues({
            ...formValues,
            category: value
        })

    }


    const handleCancel = () => {
        onOpenChange?.(false)
    }

    const queryClient = useQueryClient()


    // create expense mutation

    const createExpenseMutation = useMutation({
        mutationFn: async (expenseData) => {
            const response = await api.post('/expenses', expenseData);
            return response.data;
        },
        onSuccess: (data) => {
            console.log("Expense created successfully:", data);
            toast.success('Expense added successfully', { description: 'Your expense has been recorded.' });
            queryClient.invalidateQueries(['expenses']);
            onOpenChange?.(false);
            setFormValues({
                title: '',
                amount: '',
                category: 'other',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
        },
        onError: (error) => {
            console.error("Error creating expense:", error);
            toast.error(`Error adding expense: ${extractErrorMessages(error)}`, { description: 'Please try again.' });
            setValidationError(extractErrorMessages(error));
        }
    })

    const updateExpenseMutation = useMutation({
        mutationFn: async (expenseData) => {
            const response = await api.put(`/expenses/${expense._id}`, expenseData);
            return response.data;
        },
        onSuccess: (data) => {

            toast.success('Expense updated successfully', { description: 'Your expense has been updated.' });
            queryClient.invalidateQueries(['expenses']);
            onOpenChange?.(false);
            setFormValues({
                title: '',
                amount: '',
                category: 'other',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            console.log("Expense updated successfully:", data);
        }
        ,
        onError: (error) => {
            console.error("Error updating expense:", error);
            toast.error(`Error updating expense: ${extractErrorMessages(error)}`, { description: 'Please try again.' });
            setValidationError(extractErrorMessages(error));
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formValues.title) {
            setValidationError('Title is required');
            return;
        }

        if (!formValues.amount || parseFloat(formValues.amount) <= 0) {
            setValidationError('Amount must be greater than 0');
            return;
        }

        const expenseData = {
            title: formValues.title.trim(),
            amount: parseFloat(formValues.amount),
            category: formValues.category,
            description: formValues.description.trim() || '',
            date: formValues.date ? new Date(formValues.date).toISOString() : new Date().toISOString()
        }
        if (expense) {
            updateExpenseMutation.mutate(expenseData);
        } else {
            createExpenseMutation.mutate(expenseData);
        }

    }


    // Get display error from validation or mutation errors
    const displayError = validationError ||
        extractErrorMessages(createExpenseMutation.error);

    const isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {expense ? 'Edit Expense' : 'Add New Expense'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Fill in the details below to record your expense.
                    </DialogDescription>
                </DialogHeader>

                {/* inputs */}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {displayError && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {displayError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            value={formValues.title}
                            onChange={handleInputChange}
                            placeholder="Enter expense title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formValues.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={formValues.category}
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPENSE_CATEGORIES.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            type="text"
                            value={formValues.description}
                            onChange={handleInputChange}
                            placeholder="Enter expense description (optional)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formValues.date}
                            onChange={handleInputChange}
                        />
                    </div>

                    <DialogFooter className="flex justify-end space-x-2">

                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>


                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader size="sm" />
                                    {expense ? 'Updating...' : 'Adding...'}
                                </span>
                            ) : (
                                expense ? 'Update Expense' : 'Add Expense'
                            )}
                        </Button>

                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ExpenseForm
