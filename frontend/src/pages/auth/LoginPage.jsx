import React from 'react'
import LoginForm from '../../components/auth/LoginForm'

const LoginPage = () => {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-background'>

            <div className='absolute inset-0 bg-gradient-to-br from-secondary to-secondary opacity-1' />
            <div className='z-10 w-full max-w-md px-4'>
                <div className='mb-8 text-center'>
                    <p className='text-sm font-medium text-primary mb-2'>Expense Tracker</p>
                    <h1 className='text-3xl font-bold text-foreground'>Welcome back</h1>
                    <p>Sign in to manage your expenses</p>
                </div>

                {/* Registration Form */}
                <LoginForm />
            </div>
        </div>

    )
}

export default LoginPage