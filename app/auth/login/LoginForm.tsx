// app/auth/login/ui.tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Mode = 'login' | 'signup'

interface AuthError {
    message: string
}

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = useMemo(() => createClient(), [])

    const nextPath = searchParams.get('next') || '/'

    const [mode, setMode] = useState<Mode>('login')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault()
        setError(null)
        setInfo(null)
        setLoading(true)

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                router.replace(nextPath)
                router.refresh()
                return
            }

            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error

            if (data.session) {
                router.replace(nextPath)
                router.refresh()
            } else {
                setInfo('Account created. Check your email to confirm your address, then sign in.')
                setMode('login')
            }
        } catch (err) {
            const authError = err as AuthError
            setError(authError?.message ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setPassword(e.target.value)
    }

    const toggleMode = (): void => {
        setMode(mode === 'login' ? 'signup' : 'login')
    }

    return (
        <main className="@container/main flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10 md:py-14">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {mode === 'login' ? 'Sign in' : 'Create account'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {mode === 'login' ? 'Use your email and password.' : 'Create an account with email and password.'}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    {info ? <p className="text-sm">{info}</p> : null}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
                    </Button>
                </form>

                <div className="text-sm">
                    <button className="underline" onClick={toggleMode} type="button">
                        {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
                    </button>
                </div>
            </div>
        </main>
    )
}
