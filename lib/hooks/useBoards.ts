'use client'
import { boardDataService, boardService, columnService, taskService } from "../services";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { Board, ColumnWithTasks, TaskData, Task } from "../superbase/models";
import { useSupabase } from "../superbase/SupabaseProvider";

export function useBoards() {

    const { supabase } = useSupabase();
    const { user } = useUser();
    const [board, setBoard] = React.useState<Board[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');

    async function loadBoards() {
        if (!user || !supabase)
            return;
        try {
            setLoading(true);
            const data = await boardService.getBoards(supabase, user.id);
            setBoard(data);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load boards...');
        }
        finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (user && supabase) {
            loadBoards();
        }
    }, [user, supabase])

    async function createBoard(boardData: {
        title: string, description?: string, color?: string,
    }) {
        try {
            if (!user || !supabase)
                throw new Error('User not Authenticated')
            const newBoard = await boardDataService.createBoardWithDefaultColumn(supabase, { ...boardData, userId: user.id })
            setBoard((prev) => [newBoard, ...prev]);
        }
        catch (error) {
            console.log(error)
            setError(error instanceof Error ? error.message : 'Failed to create board');
        }
    }

    return { board, error, loading, createBoard };
}

export function useViewBoard(boardId: string) {
    const { supabase } = useSupabase();
    const { user } = useUser();
    const [board, setBoard] = React.useState<Board | null>(null);
    const [columns, setColumns] = React.useState<ColumnWithTasks[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');

    async function loadBoard() {
        if (!boardId || !supabase || !user)
            return;
        try {
            setLoading(true);
            const data = await boardDataService.getBoardWithColumns(supabase, boardId);
            setBoard(data.board);
            setColumns(data.columnsWithTask);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load boards....');
        }
        finally {
            setLoading(false);
        }
    }

    async function updateBoard(board_id: string, boardData: Partial<Board>) {
        try {
            const updatedData = await boardService.updateBoard(supabase!, board_id, boardData);
            setBoard(updatedData);
            return updatedData;
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update the board....');
        }
    }

    async function createRealTask(columnID: string, taskData: TaskData) {
        try {
            const newTask = await taskService.createTask(supabase!, {
                title: taskData.title,
                description: taskData.description || null,
                assignee: taskData.assignee || null,
                due_date: taskData.dueDate || null,
                column_id: columnID,
                priority: taskData.priority || 'Medium',
                sort_order: columns.find((col) => col.id === columnID)?.tasks.length || 0,
            })
            setColumns((prev) => prev.map((col) => col.id === columnID ? { ...col, tasks: [...col.tasks, newTask] } : col));
            return newTask;
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create the task....');
        }
    }

    async function moveTask(taskID: string, newColumnID: string, newOrder: number) {
        try {
            await taskService.moveTask(supabase!, taskID, newColumnID, newOrder);
            setColumns((prev) => {
                const newColumns = [...prev];
                let taskToMove: Task | null = null;
                for (const col of newColumns) {
                    const taskIndex = col.tasks.findIndex((task) => task.id === taskID);
                    if (taskIndex !== -1) {
                        taskToMove = col.tasks[taskIndex];
                        col.tasks.splice(taskIndex, 1);
                        break;
                    }
                }
                if (taskToMove) {
                    const targetColumn = newColumns.find((col) => col.id === newColumnID)
                    if (targetColumn) {
                        targetColumn.tasks.splice(newOrder, 0, taskToMove);
                    }
                }
                return newColumns;
            })
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to move the task....');
        }
    }

    async function createNewColumn(title: string) {
        if (!board || !user)
            throw new Error('Board not loaded yet')
        try {
            const newColumn = await columnService.createColumn(supabase!, { title, user_id: user.id, board_id: boardId, sort_order: columns.length })
            setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
            return newColumn;
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to creare the column....');
        }
    }

    async function updateColumn(columnID: string, title: string) {
        try {
            const updatedColumn = await columnService.updateColumnTitle(supabase!, columnID, title)
            setColumns((prev) => prev.map((col) => col.id === columnID ? { ...col, ...updatedColumn } : col));
            return updatedColumn;
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update the column....');
        }
    }

    React.useEffect(() => {
        if (boardId && user && supabase) {
            loadBoard();
        }
    }, [boardId, user, supabase]);

    return { board, error, loading, columns, updateBoard, createRealTask, setColumns, moveTask, createNewColumn, updateColumn };
}