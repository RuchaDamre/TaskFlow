'use client'
import { Trello, ArrowRight, ArrowLeft, MoreHorizontal, Filter } from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Badge } from './ui/badge';
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
    onEditBoard: () => void,
    boardTitle: string,
    onFilterClick: () => void,
    filterCount?: number,
}

function Navbar({ onEditBoard, boardTitle, onFilterClick, filterCount = 0 }: Props) {
    const { isSignedIn, user } = useUser();
    const pathname = usePathname();
    const isDashboardPage = pathname === '/dashboard';
    const isBoardPage = pathname.startsWith(`/boards/`);
    if (isDashboardPage) {
        return (
            <nav className="flex justify-between py-2 px-5 bg-white border-b-2 border-gray-100">
                <div className="flex gap-3 items-center">
                    <Trello className="h-8 w-8 text-blue-300" />
                    <h1 className="font-bold text-md">TaskFlow</h1>
                </div>
                <UserButton />
            </nav>
        )
    }
    if (isBoardPage) {
        return (
            <nav className="bg-white border-b-2 border-gray-100 flex py-2 md:px-5 px-3 items-center justify-between">
                <Link href={'/dashboard'} className="flex items-center">
                    <ArrowLeft className="mr-2 w-4" />
                    <h2 className="hidden md:block text-sm">Back to Dashboard</h2>
                </Link>
                <div className="flex items-center">
                    <div className="flex gap-2 items-center">
                        <Trello className="md:h-8 md:w-8 h-5 w-5 text-blue-600" />
                        <h1 className="font-bold md:text-md text-sm truncate md:w-100 max-w-30">{boardTitle}</h1>
                    </div>
                    <Button variant='ghost' size='sm' className="h-7 w-7" onClick={onEditBoard}>
                        <MoreHorizontal />
                    </Button>
                </div>
                <div className="flex items-center md:gap-2">
                    {
                        onFilterClick && (
                            <Button className={`mr-2 text-xs ${filterCount > 0 && `bg-blue-100 border-blue-100`}`} size='sm' variant='outline' onClick={onFilterClick}>
                                <Filter />Filter
                                {
                                    filterCount > 0 && (
                                        <Badge variant='secondary' className="text-xs">{filterCount}</Badge>
                                    )
                                }
                            </Button>
                        )
                    }
                    <UserButton />
                </div>
            </nav>
        )
    }
    return (
        <nav className="flex justify-between py-2 px-5 bg-white border-b-2 border-gray-100">
            <div className="flex gap-3 items-center">
                <Trello className="h-8 w-8 text-blue-300" />
                <h1 className="font-bold text-lg">TaskFlow</h1>
            </div>
            {
                isSignedIn ?
                    <div className="flex gap-2 items-center">
                        <h2 className="md:block hidden text-sm text-gray-600">Welcome, {user.firstName ?? user.emailAddresses[0].emailAddress}</h2>
                        <Link href={'/dashboard'}><Button size="sm" className="text-xs">Dashboard <ArrowRight /></Button></Link>
                    </div>

                    : <div>
                        <SignInButton>
                            <Button variant="ghost" size="sm" className="text-sm">Sign In</Button>
                        </SignInButton>
                        <SignUpButton>
                            <Button className="ml-5 text-xs" size="sm">Sign Up</Button>
                        </SignUpButton>
                    </div>
            }
        </nav>
    )
}

export default Navbar;