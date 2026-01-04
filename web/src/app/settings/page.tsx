"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { Download, Upload, Loader2, AlertTriangle, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth"

export default function SettingsPage() {
    const { user, updateProfile } = useAuthStore()
    const [importing, setImporting] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [newUsername, setNewUsername] = useState("")
    const [updatingProfile, setUpdatingProfile] = useState(false)

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) return
        setUpdatingProfile(true)
        try {
            await updateProfile(newUsername)
            toast.success("Profile updated successfully!")
            setNewUsername("")
        } catch (error: any) {
            toast.error("Failed to update profile")
        } finally {
            setUpdatingProfile(false)
        }
    }

    const handleExport = async () => {
        try {
            const response = await api.get("/data/export", { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'expenses.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success("Export downloaded!")
        } catch (error) {
            toast.error("Failed to export data")
        }
    }

    const handleImport = async () => {
        if (!file) return
        setImporting(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await api.post("/data/import", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success(res.data.message)
            setFile(null)
            // Optional: reset file input?
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Import failed")
        } finally {
            setImporting(false)
        }
    }

    return (
        <AppShell>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Settings & Data
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Manage your data and account preferences.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 pt-6">
                    {/* Profile Settings - Purple Theme */}
                    <div className="relative group md:col-span-2">

                        <div className="relative overflow-hidden rounded-[2.5rem] bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 p-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Profile Settings</h3>
                                    <p className="text-xs font-bold text-purple-200/60 uppercase tracking-wider">Public Profile</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-black text-purple-200 uppercase">Display Name</Label>
                                    <div className="flex gap-3">
                                        <Input
                                            id="username"
                                            placeholder="Enter your display name"
                                            defaultValue={user?.username || ''}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="bg-black/20 border-purple-500/30 text-white focus:ring-purple-500 rounded-xl h-11 placeholder:text-white/20"
                                        />
                                        <Button
                                            onClick={handleUpdateProfile}
                                            disabled={updatingProfile}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-11 px-6 shadow-lg shadow-purple-900/20 whitespace-nowrap"
                                        >
                                            {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-purple-200/50 font-medium">
                                        This is how you will be addressed in the app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Export Card - Blue Theme */}
                    <div className="relative group">

                        <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 p-8 shadow-2xl h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <Download className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Export Content</h3>
                                    <p className="text-xs font-bold text-blue-200/60 uppercase tracking-wider">Download CSV</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 font-medium mb-6 leading-relaxed">
                                Get a complete backup of your expenses and categories. Perfect for Excel analysis.
                            </p>
                            <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-blue-900/20">
                                Download CSV
                            </Button>
                        </div>
                    </div>

                    {/* Import Card - Emerald Theme */}
                    <div className="relative group">

                        <div className="relative overflow-hidden rounded-[2.5rem] bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 p-8 shadow-2xl h-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <Upload className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Import Data</h3>
                                    <p className="text-xs font-bold text-emerald-200/60 uppercase tracking-wider">Restore or Move</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid w-full gap-1.5">
                                    <Label htmlFor="csv" className="text-xs font-black text-emerald-200 uppercase">Select CSV File</Label>
                                    <Input
                                        id="csv"
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="bg-black/20 border-emerald-500/30 text-emerald-100 file:bg-emerald-500/20 file:text-emerald-300 file:font-bold rounded-xl h-12 pt-2 file:border-0 file:mr-4 file:rounded-lg cursor-pointer"
                                    />
                                </div>
                                <Button
                                    onClick={handleImport}
                                    disabled={!file || importing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-emerald-900/20"
                                >
                                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Import"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone - Red Theme */}
                    <div className="relative group md:col-span-2">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/20">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-black text-red-100">Danger Zone</h3>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-red-200/70 font-medium">
                                    Actions here cannot be undone. Be careful.
                                </p>
                                <Button variant="destructive" className="bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl border-0 shadow-lg" disabled>
                                    Delete Account (Soon)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
