"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
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

import ImmersiveReveal from "@/components/ui/ImmersiveReveal"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localError, setLocalError] = useState("")
    const [showSandy, setShowSandy] = useState(false)

    const router = useRouter()
    const { register, error: storeError } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError("")

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            setLocalError("Passwords do not match")
            return
        }

        setIsSubmitting(true)
        setShowSandy(true) // Start Curtain
        try {
            await register(email, password, username)

            // 2 Second delay as requested
            setTimeout(() => {
                setShowSandy(false) // Reveal (though we navigate immediately)
                toast.success("Signup Successful! Redirecting...")
                router.push("/login")
            }, 2000)

        } catch (err) {
            toast.error("Registration failed")
            setShowSandy(false) // Hide if error
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <ImmersiveReveal isLoading={showSandy} />
            <Card className="w-full max-w-sm border-slate-800 bg-slate-900 text-slate-50">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src="/brand/ExpenseX_logo.png" alt="ExpenseX" className="h-16 w-16 object-contain" />
                    </div>
                    <CardTitle className="text-2xl">Register</CardTitle>
                    <CardDescription className="text-slate-400">
                        Create a new account to start tracking expenses.
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
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username (Optional)</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Maverick"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-950 border-slate-800"
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
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                        {(localError || storeError) && (
                            <div className="text-red-500 text-sm">
                                {localError || storeError}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 mt-4">
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-xl" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="underline hover:text-emerald-400">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </>
    )
}
