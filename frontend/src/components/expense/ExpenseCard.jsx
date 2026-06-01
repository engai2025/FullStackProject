import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';


import { Calendar, Edit2, Loader, MoreVertical, Trash } from 'lucide-react';
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api/apiClient';

const CATEGORY_CONFIG = {
    'food': { variant: 'secondary', label: 'Food', color: 'text-orange-600' },
    'rent': { variant: 'default', label: 'Rent', color: 'text-blue-600' },
    'transport': { variant: 'outline', label: 'Transport', color: 'text-purple-600' },
    'utilities': { variant: 'secondary', label: 'Utilities', color: 'text-yellow-600' },
    'entertainment': { variant: 'outline', label: 'Entertainment', color: 'text-pink-600' },
    'shopping': { variant: 'secondary', label: 'Shopping', color: 'text-indigo-600' },
    'health': { variant: 'outline', label: 'Health', color: 'text-green-600' },
    'other': { variant: 'secondary', label: 'Other', color: 'text-gray-600' }
};

const ExpenseCard = ({
    expense,
    onEdit,
    isLoading = false
}) => {

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);


    const categoryConfig = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['other'];

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const expenseDate = formatDate(expense.date);

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/expenses/${expense._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            toast.success('Expense deleted successfully');
        },
        onError: (error) => {
            toast.error(`Error deleting expense: ${error.message}`);
            console.error("Error deleting expense:", error);
        }
    })


    const handleDeleteConfirm = async () => {

        try {
            await deleteMutation.mutateAsync(expense._id);
            setShowDeleteDialog(false);
        } catch (error) {
            console.error("Error confirming delete:", error);
            toast.error(`Error confirming delete: ${error.message}`);
        }
    }


    return (
        <>
            <Card className="w-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg leading-tight">{expense?.title}</CardTitle>
                            <p className="text-2xl font-bold text-primary">{formatAmount(expense.amount)}</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Badge variant={categoryConfig?.variant} className={'shrink-0'}>
                                {categoryConfig?.label}
                            </Badge>

                            {/* Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => onEdit(expense)}
                                    >
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* description */}
                    {
                        expense.description && (
                            <p className='text-muted-foreground text-sm leading-relaxed'>{expense.description}</p>
                        )
                    }
                    {/* date */}

                    {

                        expenseDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Date:</span>
                                <Badge variant="outline" className="text-xs">
                                    {expenseDate}
                                </Badge>
                            </div>
                        )
                    }

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Added: {formatDate(expense.createdAt)}</span>
                        <span className={categoryConfig.color}>
                            {categoryConfig.label}
                        </span>
                    </div>

                </CardContent>

            </Card>


            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the expense "{expense.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >

                            {deleteMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader size="sm" />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete'
                            )}

                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    )
}

export default ExpenseCard
