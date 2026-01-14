'use client'
import { DialogContent, DialogHeader, Dialog, DialogTitle } from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import React from "react";
import Navbar from "@/components/Navbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem } from '@/components/ui/select';
import { useViewBoard } from "@/lib/hooks/useBoards";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus, MoreHorizontal, User, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnWithTasks, Task } from "@/lib/superbase/models";
import { TaskData } from "@/lib/superbase/models";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent, rectIntersection, useDroppable, useSensor, PointerSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Column = {
    column: ColumnWithTasks,
    children: React.ReactNode,
    onEditColumn: (column: ColumnWithTasks) => void,
    onCreateTask: (e: React.FormEvent<HTMLFormElement>) => void,
}

function DroppableColumn({ column, children, onEditColumn, onCreateTask }: Column) {
    const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });
    return (
        <div ref={setNodeRef} className={`bg-white rounded-lg shadow-sm border p-2 min-w-80 ${isOver ? 'bg-blue-50 rounded-lg' : ''} h-fit mb-3 mt-5`}>
            <div className={`${isOver ? 'ring-2 ring-blue-300' : ''}`}>
                <div className="flex justify-between border-b">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold truncate">{column.title}</h2>
                        <Badge variant='secondary' className="text-xs">{column.tasks.length}</Badge>
                    </div>
                    <Button variant='ghost' size='sm' onClick={() => onEditColumn(column)}>
                        <MoreHorizontal />
                    </Button>
                </div>
                <div className="p-2 space-y-2">
                    {children}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='ghost' className="w-full mt-3 text-gray-500 hover:text-gray-700">
                                <Plus />Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Task</DialogTitle>
                                <p className="text-sm">Add a task to the board.</p>
                            </DialogHeader>
                            <form onSubmit={onCreateTask}>
                                <div>
                                    <Label> Title</Label>
                                    <Input id="title" name="title" placeholder="Enter task title" className="my-2" required />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea id="desp" name="desp" placeholder="Enter task description" rows={3} className="my-2" />
                                </div>
                                <div>
                                    <Label> Assignee</Label>
                                    <Input id="assignee" name="assignee" placeholder="Who should do this?" className="my-2" />
                                </div>
                                <div>
                                    <Label className="mb-2"> Priority</Label>
                                    <Select name="priority" defaultValue="Medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent >
                                            {
                                                ['Low', 'Medium', 'High'].map((value, index) => <SelectItem key={index} value={value} className="mt-2 mr-2">{value}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mt-2">Due Date</Label>
                                    <Input id="date" name="date" type="date" className="my-2" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button type="submit">Create Task</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

function getPriorityColor(priority: 'Low' | 'High' | 'Medium') {
    if (priority === 'High') {
        return 'bg-red-500';
    }
    else if (priority === 'Medium') {
        return 'bg-yellow-500';
    }
    else if (priority === 'Low') {
        return 'bg-green-500';
    }
    else {
        return 'bg-yellow-500';
    }
}

function SortableTask({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(task.id) });

    const styles = {
        transform: CSS.Transform.toString(transform),  //Converts DndKit transform object into valid CSS
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <Card ref={setNodeRef} {...listeners} {...attributes} style={styles} className="cursor-pointer hover:shadow-md transition:shadow touch-none">
            <CardContent className="space-y-2">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-gray-500 text-sm">{task.description || "No Description"}</p>
                <div className="text-gray-500">{task.assignee && (<span className="flex gap-2 text-sm items-center"><User className="w-4" />{task.assignee}</span>)}</div>
                <div className="text-gray-500 flex items-center justify-between">{task.due_date && (<span className="flex gap-2 text-sm items-center"><Calendar className="w-4" />{task.due_date}</span>)}
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                </div>
            </CardContent>
        </Card>
    )
}

function TaskOverlay({ task }: { task: Task }) {

    return (
        <Card className="cursor-pointer hover:shadow-md transition:shadow">
            <CardContent className="space-y-2">
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-gray-500 text-sm">{task.description || "No Description"}</p>
                <div className="text-gray-500">{task.assignee && (<span className="flex gap-2 text-sm items-center"><User className="w-4" />{task.assignee}</span>)}</div>
                <div className="text-gray-500 flex items-center justify-between">{task.due_date && (<span className="flex gap-2 text-sm items-center"><Calendar className="w-4" />{task.due_date}</span>)}
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                </div>
            </CardContent>
        </Card>
    )
}

function Board() {
    const { id } = useParams<{ id: string }>();

    const { board, updateBoard, columns, createRealTask, setColumns, moveTask, createNewColumn, updateColumn } = useViewBoard(id);

    const [editTitle, setEditTitle] = React.useState<boolean>(false);
    const [newTitle, setNewTitle] = React.useState<string>('');
    const [newColor, setNewColor] = React.useState<string>('');

    const [filterOpen, setFilterOpen] = React.useState<boolean>(false);
    const [filters, setFilters] = React.useState({
        priority: [] as string[],
        assignee: [] as string[],
        dueDate: null as string | null,
    })

    const [activeTask, setActiveTask] = React.useState<Task | null>(null);

    const [createColumn, setCreateColumn] = React.useState<boolean>(false);
    const [editColumn, setEditColumn] = React.useState<boolean>(false);

    const [newColumnTitle, setNewColumnTitle] = React.useState<string>('');
    const [editingColumnTitle, setEditingColumnTitle] = React.useState<string>('');
    const [editingColumn, setEditingColumn] = React.useState<ColumnWithTasks | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8
        }
    }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    );

    const colorList = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500', 'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500'];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!board) {
            console.warn("Board not loaded yet");
            return;
        }
        await updateBoard(board.id, { title: newTitle.trim(), color: newColor || board.color });
        setEditTitle(false);
    }

    async function createTask(taskData: TaskData) {
        const targetedColumn = columns[0];
        if (!targetedColumn) {
            throw new Error('No column available to add task')
        }
        await createRealTask(targetedColumn.id, taskData);
    }

    async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const taskData = {
            title: formData.get('title') as string,
            description: formData.get('desp') as string || undefined,
            assignee: formData.get('assignee') as string || undefined,
            dueDate: formData.get('date') as string || undefined,
            priority: formData.get('priority') as 'Low' | 'High' | 'Medium',
        }

        if (taskData.title.trim()) {
            await createTask(taskData);
        }

        // To close the Add Task popup
        const trigger = document.querySelector('[data-state="open"') as HTMLElement;
        if (trigger)
            trigger.click();
    }

    function handleDragStart(e: DragStartEvent) {
        const taskID = String(e.active.id);
        const task = columns
            .flatMap(col => col.tasks)
            .find(task => String(task.id) === taskID);

        if (task) {
            setActiveTask(task);
        }
    }


    function handleDragOver(e: DragOverEvent) {
        const { active, over } = e;  // active - draggable task over - task currently being over
        if (!over) {
            return;
        }
        const activeID = String(active.id);
        const overID = String(over.id);

        // column from where drag started
        const sourceColumn = columns.find((col) => col.tasks.some((task) => String(task.id) === activeID));

        //column cotaining hovered task
        let targetColumn = columns.find((col) => col.tasks.some((task) => String(task.id) === overID));

        if (!targetColumn && overID.startsWith("column-")) {
            const columnId = overID.replace("column-", "");
            targetColumn = columns.find(col => String(col.id) === columnId);
        }

        if (!sourceColumn || !targetColumn)
            return;

        // Drag and Drop inside same column
        if (sourceColumn.id === targetColumn.id) {
            const activeIndex = sourceColumn.tasks.findIndex(
                t => String(t.id) === activeID
            );

            const overIndex = sourceColumn.tasks.findIndex(
                t => String(t.id) === overID
            );

            if (activeIndex !== overIndex) {
                setColumns(prev =>
                    prev.map(col => {
                        if (col.id !== sourceColumn.id) return col;

                        const updatedTasks = [...col.tasks];
                        const [moved] = updatedTasks.splice(activeIndex, 1);
                        updatedTasks.splice(overIndex, 0, moved);

                        return { ...col, tasks: updatedTasks };
                    })
                );
            }
            return;
        }
        setColumns(prev =>
            prev.map(col => {
                if (col.id === sourceColumn.id) {
                    return {
                        ...col,
                        tasks: col.tasks.filter(
                            task => String(task.id) !== activeID
                        ),
                    };
                }

                if (col.id === targetColumn.id) {
                    const movedTask = sourceColumn.tasks.find(
                        task => String(task.id) === activeID
                    )!;
                    return {
                        ...col,
                        tasks: [...col.tasks, movedTask],
                    };
                }
                return col;
            })
        );
    }

    async function handleDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over) {
            return;
        }
        const activeId = String(active.id);
        const overId = String(over.id);

        let targetColumn = columns.find(col =>
            col.tasks.some(task => String(task.id) === overId)
        );

        if (!targetColumn && overId.startsWith("column-")) {
            const columnId = overId.replace("column-", "");
            targetColumn = columns.find(col => String(col.id) === columnId);
        }

        if (!targetColumn) return;

        await moveTask(activeId, targetColumn.id, targetColumn.tasks.length);
        setActiveTask(null);
    }

    async function handleCreateColumn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!newColumnTitle.trim())
            return;
        await createNewColumn(newColumnTitle.trim());
        setNewColumnTitle('');
        setCreateColumn(false);
    }

    async function handleUpdateColumn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingColumn)
            return;
        await updateColumn(editingColumn.id, editingColumnTitle.trim());
        setEditingColumnTitle('');
        setEditColumn(false);
        setEditingColumn(null);
    }

    function handleEditColumn(column: ColumnWithTasks) {
        setEditColumn(true);
        setEditingColumn(column);
        setEditingColumnTitle(column.title);
    }

    function handleFilterChange(type: 'priority' | 'assignee' | 'dueDate', value: string | string[] | null) {
        setFilters((prev) => ({
            ...prev,
            [type]: value
        }))
    }

    function clearFilters() {
        setFilters({
            priority: [] as string[],
            assignee: [] as string[],
            dueDate: null as string | null,
        })
    }

    const filteredColumns = columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
            if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
                return false;
            }

            if (filters.dueDate && task.due_date) {
                const taskDate = new Date(task.due_date).toDateString();
                const filtersDate = new Date(filters.dueDate).toDateString();
                if (taskDate !== filtersDate) {
                    return false;
                }
            }
            return true;
        })
    }));

    return (
        <>
            <Navbar onEditBoard={() => { setEditTitle(true); }}
                boardTitle={board ? board.title : newTitle}
                onFilterClick={() => { setFilterOpen(true) }}
                filterCount={
                    Object.values(filters).reduce(
                        (count, v) => count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
                        0
                    )
                } />
            <Dialog open={editTitle} onOpenChange={setEditTitle}>
                <DialogContent className="w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Edit Board</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <Label className="mb-2">Board Title</Label>
                        <Input placeholder="Enter Board Title..." value={newTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)} required />
                        <Label className="mb-2">Board Color</Label>
                        <div className="flex gap-x-13 gap-y-2 flex-wrap">
                            {
                                colorList.map((value, index) => <button key={index} type="button" className={`${value} w-8 h-8 rounded-full cursor-pointer ${value === newColor ? 'ring-2 ring-offset-2' : ''}`} onClick={() => setNewColor(value)} />)
                            }
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <Button type='button' className="text-xs" variant='outline' onClick={() => setEditTitle(false)}>Cancel</Button>
                            <Button type="submit" className="text-xs" disabled={!board}>Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Filter Tasks</DialogTitle>
                        <p className="text-sm">Filter tasks by priority, assignee or due date.</p>
                    </DialogHeader>
                    <div>
                        <Label>Priority</Label>
                        {
                            ['Low', 'Medium', 'High'].map((value, index) => <Button key={index} variant='outline' size='sm' className="mt-2 mr-2"
                                onClick={() => {
                                    const newPriority = filters.priority.includes(value) ? filters.priority.filter((p) => p !== value) : [...filters.priority, value];
                                    handleFilterChange('priority', newPriority)
                                }}
                            >{value}</Button>)
                        }
                    </div>
                    <div>
                        <Label>Due Date</Label>
                        <Input type="date" className="mt-2" value={filters.dueDate || ''} onChange={(e) => handleFilterChange('dueDate', e.target.value || null)} />
                    </div>
                    <div className="flex justify-between mt-2">
                        <Button type="button" variant='outline' onClick={clearFilters}>Clear Filters</Button>
                        <Button type="submit" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <main className="md:px-15 px-5 py-5">
                <div className="flex justify-between">
                    <div className="flex">
                        <h2>Total Tasks : </h2>
                        <span>&nbsp;
                            {
                                columns.reduce((sum, col) => sum + col.tasks.length, 0)
                            }
                        </span>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size='sm'>
                                <Plus />Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Task</DialogTitle>
                                <p className="text-sm">Add a task to the board.</p>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask}>
                                <div>
                                    <Label> Title</Label>
                                    <Input id="title" name="title" placeholder="Enter task title" className="my-2" required />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea id="desp" name="desp" placeholder="Enter task description" rows={3} className="my-2" />
                                </div>
                                <div>
                                    <Label> Assignee</Label>
                                    <Input id="assignee" name="assignee" placeholder="Who should do this?" className="my-2" />
                                </div>
                                <div>
                                    <Label className="mb-2"> Priority</Label>
                                    <Select name="priority" defaultValue="Medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent >
                                            {
                                                ['Low', 'Medium', 'High'].map((value, index) => <SelectItem key={index} value={value} className="mt-2 mr-2">{value}</SelectItem>)
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mt-2">Due Date</Label>
                                    <Input id="date" name="date" type="date" className="my-2" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button type="submit">Create Task</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <div className="flex mt-5 gap-5 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full ">
                        {
                            filteredColumns.map((value, index) => <DroppableColumn key={index} column={value} onCreateTask={handleCreateTask} onEditColumn={handleEditColumn}>
                                <SortableContext items={value.tasks.map((task) => String(task.id))} strategy={verticalListSortingStrategy}>
                                    {
                                        value.tasks.map((task, index) => <SortableTask key={index} task={task} />)
                                    }
                                </SortableContext>
                            </DroppableColumn>)
                        }
                        <div>
                            <Button variant='outline' className="border-dashed border-2 text-gray-500 hover:text-gray-700 h-fit min-w-80 mt-5 py-11"
                                onClick={() => setCreateColumn(true)}
                            >
                                <Plus /> Add another list
                            </Button>
                        </div>
                        <DragOverlay>
                            {
                                activeTask ? <TaskOverlay task={activeTask} /> : null
                            }
                        </DragOverlay>
                    </div>
                </DndContext>
            </main>
            <Dialog open={createColumn} onOpenChange={setCreateColumn}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Column</DialogTitle>
                        <p className="text-sm">Add new column to organize your tasks</p>
                    </DialogHeader>
                    <form className="space-y-3" onSubmit={handleCreateColumn}>
                        <Label>Column Title</Label>
                        <Input id="columnTitle" value={newColumnTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColumnTitle(e.target.value)}
                            placeholder="Enter column title" required />
                        <div className="flex justify-end gap-2">
                            <Button variant='outline' type="button" className="text-xs" onClick={() => setCreateColumn(false)}>Cancel</Button>
                            <Button type="submit" className="text-xs">Create Column</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={editColumn} onOpenChange={setEditColumn}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Column</DialogTitle>
                        <p className="text-sm">Update the title of column</p>
                    </DialogHeader>
                    <form className="space-y-3" onSubmit={handleUpdateColumn}>
                        <Label>Column Title</Label>
                        <Input id="columnTitle" value={editingColumnTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingColumnTitle(e.target.value)}
                            placeholder="Enter column title" required />
                        <div className="flex justify-end gap-2">
                            <Button variant='outline' type="button" className="text-xs" onClick={() => {
                                setEditColumn(false);
                                setEditingColumnTitle('');
                                setEditingColumn(null);
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit" className="text-xs">Edit Column</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Board;