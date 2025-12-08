import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentTransactions() {
    return (
        <div className="space-y-8">
            <div className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="Avatar" />
                    <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Grocery Run</p>
                    <p className="text-sm text-muted-foreground">
                        Walmart Supercenter
                    </p>
                </div>
                <div className="ml-auto font-medium text-destructive">-$82.50</div>
            </div>
            <div className="flex items-center">
                <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
                    <AvatarImage src="/avatars/02.png" alt="Avatar" />
                    <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Electric Bill</p>
                    <p className="text-sm text-muted-foreground">Dec 2024</p>
                </div>
                <div className="ml-auto font-medium text-destructive">-$145.00</div>
            </div>
            <div className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/03.png" alt="Avatar" />
                    <AvatarFallback>IN</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Freelance Payment</p>
                    <p className="text-sm text-muted-foreground">Upwork</p>
                </div>
                <div className="ml-auto font-medium text-green-600">+$250.00</div>
            </div>
            <div className="flex items-center">
                <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/04.png" alt="Avatar" />
                    <AvatarFallback>WK</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Netflix Subscription</p>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <div className="ml-auto font-medium text-destructive">-$15.99</div>
            </div>
        </div>
    )
}
