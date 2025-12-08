"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, initialize, isLoading } = useAuthStore()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        initialize().then(() => setChecked(true))
    }, [initialize])

    useEffect(() => {
        if (checked && !isAuthenticated) {
            router.push("/login")
        }
    }, [checked, isAuthenticated, router])

    if (!checked || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-emerald-500">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    return <>{children}</>
}
