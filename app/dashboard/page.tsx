'use client'
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { Plus, Trello, BarChart3, Rocket, Grid3X3, List, Filter, Search, Loader2 } from 'lucide-react';
import { useBoards } from "@/lib/hooks/useBoards";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { Board } from "@/lib/superbase/models";

function Dashboard() {
    const { user, isLoaded } = useUser();
    const [view, setView] = React.useState('grid');
    const { createBoard, loading, error, board } = useBoards();

    const [filterOpen, setFilterOpen] = React.useState<boolean>(false);
    const [filters, setFilters] = React.useState({
        search: '',
        dateRange: {
            start: null as string | null,
            end: null as string | null,
        },
        taskCount: {
            min: null as number | null,
            max: null as number | null,
        }
    });

    const boardsWithTaskCount = board.map((board: Board) => ({
        ...board,
        taskCount: 0
    }))

    const filteredBoards = boardsWithTaskCount.filter((board: Board) => {
        const matchesSearch = board.title.toLowerCase().includes(filters.search.toLowerCase())
        const matchesDateRange = (!filters.dateRange.start || new Date(board.created_at) >= new Date(filters.dateRange.start))
            && (!filters.dateRange.end || new Date(board.created_at) <= new Date(filters.dateRange.end))

        return matchesSearch && matchesDateRange;
    });

    function clearFilters() {
        setFilters({
            search: '',
            dateRange: {
                start: null as string | null,
                end: null as string | null,
            },
            taskCount: {
                min: null as number | null,
                max: null as number | null,
            }
        })
    }

    async function handleCreateBoard() {
        await createBoard({ title: 'New Board' });
    }

    if (loading || !isLoaded) {
        return <div className="flex flex-col justify-center items-center h-screen"><Loader2 className="animate-spin" />Loading your boards...</div>
    }

    if (error) {
        return <div className="text-center mt-70">{error}</div>
    }

    return (
        <>
            <Navbar />
            <main className="md:px-12 py-5 px-5">
                <h2 className="mb-2 font-bold md:text-xl">Welcome back, {user?.firstName ?? user?.emailAddresses[0].emailAddress}! </h2>
                <p className="text-gray-600 text-xs md:text-base">Here is what is happening with your boards today</p>
                <section className="flex md:gap-10 gap-5 my-5 justify-center md:justify-normal md:flex-row flex-col md:w-fit w-65">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between md:gap-20 gap-10">
                                <div>
                                    <p className="md:text-sm text-xs">Total Boards</p>
                                    <p className="font-bold text-sm md:text-base">{board.length}</p>
                                </div>
                                <Trello className="bg-blue-100 text-blue-300 p-2 md:w-10 md:h-10 w-8 h-8 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between md:gap-20 gap-10">
                                <div>
                                    <p className="md:text-sm text-xs">Recent Activity</p>
                                    {/* how many boards updated a week ago */}
                                    <p className="font-bold text-sm md:text-base">{board.filter((value) => {
                                        const updated_at = new Date(value.updated_at);
                                        const today = new Date();
                                        today.setDate(today.getDate() - 7);
                                        return updated_at > today;
                                    }).length}</p>
                                </div>
                                <BarChart3 className="bg-purple-100 text-purple-300 p-2 md:w-10 md:h-10 w-8 h-8 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between md:gap-20 gap-10">
                                <div>
                                    <p className="md:text-sm text-xs">Active Projects</p>
                                    <p className="font-bold text-sm md:text-base">{board.length}</p>
                                </div>
                                <Rocket className="bg-green-100 text-green-300 p-2 md:w-10 md:h-10 w-8 h-8 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                </section>
                <section className="flex md:flex-row flex-col md:justify-between md:items-center">
                    <div>
                        <h2 className="mb-1 font-bold md:text-lg text-md">Your Boards</h2>
                        <p className="text-gray-600 mb-5 text-xs md:text-base">Manage your projects and Tasks</p>
                    </div>
                    <div className="flex md:flex-row flex-col items-center gap-2">
                        <div className="bg-white h-fit rounded-md p-1 md:w-fit w-full">
                            <Button size='sm' variant={view === 'grid' ? 'default' : 'ghost'} onClick={() => setView('grid')}><Grid3X3 /></Button>
                            <Button size='sm' variant={view === 'list' ? 'default' : 'ghost'} onClick={() => setView('list')}><List /></Button>
                        </div>
                        <Button className="mr-2 text-xs md:w-fit w-full mb-3 md:mb-0" size='sm' variant='outline' onClick={() => setFilterOpen(true)}><Filter />Filter</Button>
                        <Button className="text-xs md:w-fit w-full mb-5 md:mb-0" onClick={handleCreateBoard}><Plus />Create Board</Button>
                    </div>
                </section>
                <div className="relative mb-5">
                    <Search className="absolute top-1.5 left-2 text-gray-500 w-4.5" />
                    <Input type="text" placeholder="Search boards..." className="bg-gray-50 pl-10 placeholder:text-sm" onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
                </div>
                {
                    board.length < 0 ? <div>No boards created yet.</div> : (
                        <section>
                            {
                                view === 'grid' ? (
                                    <div className="flex gap-5 flex-wrap justify-center md:justify-normal">
                                        {
                                            filteredBoards.map((value, index) =>
                                                <Link href={`/boards/${value.id}`} key={index}>
                                                    <Card className="hover:shadow-lg transition-shadow md:w-94">
                                                        <CardHeader className="md:mb-2">
                                                            <div className="flex justify-between items-center">
                                                                <div className={`${value.color} w-4 h-4 rounded`}></div>
                                                                <Badge className="text-xs" variant='secondary'>New</Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <CardTitle className="hover:text-blue-300 transition-colors mb-2">{value.title}</CardTitle>
                                                            <CardDescription>{value.description}</CardDescription>
                                                            <div className="mt-5 flex gap-10 text-sm text-gray-500 justify-between">
                                                                <span>Created {' '} {new Date(value.created_at).toLocaleDateString()}</span>
                                                                <span>Updated {' '} {new Date(value.updated_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            )
                                        }
                                        <button onClick={handleCreateBoard} className="w-94">
                                            <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors px-20 py-14 cursor-pointer group">
                                                <CardContent className="flex flex-col justify-center items-center h-full">
                                                    <Plus className="h-6 w-6 text-gray-400 mb-2 group-hover:text-blue-600" />
                                                    <p className="text-sm text-gray-600 group-hover:text-blue-600">Create new board</p>
                                                </CardContent>
                                            </Card>
                                        </button>
                                    </div>
                                )
                                    : (<div>
                                        {
                                            filteredBoards.map((value, index) =>
                                                <Link href={`/boards/${value.id}`} key={index}>
                                                    <Card className="hover:shadow-lg transition-shadow mb-5">
                                                        <CardHeader className="md:mb-2">
                                                            <div className="flex justify-between items-center">
                                                                <div className={`${value.color} w-4 h-4 rounded`}></div>
                                                                <Badge className="text-xs" variant='secondary'>New</Badge>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <CardTitle className="hover:text-blue-300 transition-colors mb-2">{value.title}</CardTitle>
                                                            <CardDescription>{value.description}</CardDescription>
                                                            <div className="mt-5 flex gap-10 text-sm text-gray-500 justify-between">
                                                                <span>Created {' '} {new Date(value.created_at).toLocaleDateString()}</span>
                                                                <span>Updated {' '} {new Date(value.updated_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            )
                                        }
                                        <button onClick={handleCreateBoard} className="w-full">
                                            <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors p-10 cursor-pointer group">
                                                <CardContent className="flex flex-col justify-center items-center h-full">
                                                    <Plus className="h-6 w-6 text-gray-400 mb-2 group-hover:text-blue-600" />
                                                    <p className="text-sm text-gray-600 group-hover:text-blue-600">Create new board</p>
                                                </CardContent>
                                            </Card>
                                        </button>
                                    </div>
                                    )
                            }
                        </section>
                    )
                }
            </main>
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="-space-y-4">
                    <DialogHeader>
                        <DialogTitle>Filter Boards</DialogTitle>
                        <p className="text-gray-600 text-sm mb-2">Filter boards by title, date or task count</p>
                    </DialogHeader>
                    <Label className="font-semibold text-sm">Search</Label>
                    <Input id="search" placeholder="Search board titles..." className="my-0.5 placeholder:text-xs" onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
                    <Label className="font-semibold text-sm">Date Range</Label>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                            <Label className="font-semibold text-xs">Start Date</Label>
                            <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value || null, } }))} />
                        </div>
                        <div>
                            <Label className="font-semibold text-xs">End Date</Label>
                            <Input type="date" onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value || null, } }))} />
                        </div>
                    </div>
                    <Label className="font-semibold text-sm mt-4">Task Count</Label>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="w-48">
                            <Label className="font-semibold text-xs">Minimum</Label>
                            <Input type="number" className="placeholder:text-xs" min={0} placeholder="Minimum tasks" onChange={(e) => setFilters((prev) => ({ ...prev, taskCount: { ...prev.taskCount, min: e.target.value !== null ? Number(e.target.value) : null, } }))} />
                        </div>
                        <div className="w-48">
                            <Label className="font-semibold text-xs">Maximum</Label>
                            <Input type="number" className="placeholder:text-xs" min={0} placeholder="Maximum tasks" onChange={(e) => setFilters((prev) => ({ ...prev, taskCount: { ...prev.taskCount, max: e.target.value !== null ? Number(e.target.value) : null, } }))} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 mb-1">
                        <Button variant='outline' size='sm' className="md:text-sm text-xs" onClick={clearFilters}>Clear Filters</Button>
                        <Button size='sm' className="md:text-sm text-xs" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Dashboard;