"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get email from URL (prefilled)
    const emailParam = searchParams.get("email") || ""

    const [email, setEmail] = useState(emailParam)
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Update state if URL param changes and email state is empty
    if (emailParam && email === "") {
        setEmail(emailParam)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!code || code.length < 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        setIsSubmitting(true)
        try {
            await api.post("/auth/reset-password", {
                token: code, // Validation expects 'token' field
                email,
                new_password: password
            })
            toast.success("Password reset successfully! Redirecting to login...")
            setTimeout(() => router.push("/login"), 2000)
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Invalid code or expired.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 text-slate-50">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <img src="/brand/ExpenseX_logo.png" alt="ExpenseX" className="h-12 w-12 object-contain" />
                </div>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription className="text-slate-400">
                    Enter the code sent to your email and your new password.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200"
                            placeholder="m@example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="code">Reset Code</Label>
                        <Input
                            id="code"
                            type="text"
                            required
                            placeholder="123456"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 tracking-widest text-center font-mono"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 mt-2">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Change Password
                    </Button>
                    <Link href="/login" className="text-center text-sm text-slate-400 hover:text-emerald-400 transition-colors mt-2">
                        Cancel
                    </Link>
                </CardFooter>
            </form>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
