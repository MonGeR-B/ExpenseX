"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await api.post("/auth/forgot-password", { email })
            // Redirect to reset page with email param
            toast.success("Code sent! Check your email.")
            router.push(`/reset-password?email=${encodeURIComponent(email)}`)
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-sm border-slate-800 bg-slate-900 text-slate-50">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription className="text-slate-400">
                    Enter your email address and we'll send you a code to reset your password.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 mt-2">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Code
                    </Button>
                    <Link href="/login" className="text-center text-sm text-slate-400 hover:text-emerald-400 transition-colors mt-2">
                        Back to Login
                    </Link>
                </CardFooter>
            </form>
        </Card>
    )
}
