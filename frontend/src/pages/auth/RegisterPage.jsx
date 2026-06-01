import React from 'react'
import RegisterForm from '../../components/auth/RegisterForm'

const RegisterPage = () => {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-background'>

            <div className='absolute inset-0 bg-gradient-to-br from-secondary to-secondary opacity-1' />
            <div className='z-10 w-full max-w-md px-4'>
                <div className='mb-8 text-center'>
                    <p className='text-sm font-medium text-primary mb-2'>Expense Tracker</p>
                    <h1 className='text-3xl font-bold text-foreground'>Join us today</h1>
                    <p>Create an account to track your expenses</p>
                </div>

                {/* Registration Form */}
                <RegisterForm />
            </div>
        </div>
    )
}

export default RegisterPage