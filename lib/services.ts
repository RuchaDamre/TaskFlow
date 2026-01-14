import { SupabaseClient } from "@supabase/supabase-js";
import { Board, Column, Task } from "./superbase/models";

export const boardService = {
    async getBoard(supabase: SupabaseClient, boardId: string) {
        const { data, error } = await supabase.from('boards').select('*').eq('id', Number(boardId)).single();
        if (error)
            throw error;
        return data;
    },

    async getBoards(supabase: SupabaseClient, userId: string) {
        const { data, error } = await supabase.from('boards').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    },

    async createBoard(supabase: SupabaseClient, board: Omit<Board, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase.from('boards').insert(board).select().single();
        if (error)
            throw error;
        return data;
    },

    async updateBoard(supabase: SupabaseClient, boardId: string, boardData: Partial<Board>) {
        const { data, error } = await supabase.from('boards').update({ ...boardData, updated_at: new Date().toISOString() }).eq('id', Number(boardId)).select().single();
        if (error)
            throw error;
        return data;
    },
}

export const columnService = {
    async getColumns(supabase: SupabaseClient, boardId: string) {
        const { data, error } = await supabase.from('columns').select('*').eq('board_id', Number(boardId)).order('sort_order', { ascending: true });
        if (error)
            throw error;
        return data;
    },

    async createColumn(supabase: SupabaseClient, column: Omit<Column, 'id' | 'created_at'>) {
        const { data, error } = await supabase.from('columns').insert(column).select().single();
        if (error)
            throw error;
        return data;
    },

    async updateColumnTitle(supabase: SupabaseClient, columnId: string, title: string) {
        const { data, error } = await supabase.from('columns').update({ title }).eq('id', Number(columnId)).select().single();
        if (error)
            throw error;
        return data;
    }
}

export const taskService = {
    async getTaskByBoard(supabase: SupabaseClient, boardId: string) {
        const { data, error } = await supabase.from('tasks').select(`*, columns!inner(board_id)`).eq('columns.board_id', Number(boardId)).order('sort_order', { ascending: true });
        if (error)
            throw error;
        return data;
    },

    async createTask(supabase: SupabaseClient, task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase.from('tasks').insert(task).select().single();
        if (error)
            throw error;
        return data;
    },

    async moveTask(supabase: SupabaseClient, taskID: string, newColumnID: string, newOrder: number) {
        const { data, error } = await supabase.from('tasks').update({ column_id: newColumnID, sort_order: newOrder }).eq('id', Number(taskID));
        if (error)
            throw error;
        return data;
    },

}

export const boardDataService = {
    async createBoardWithDefaultColumn(supabase: SupabaseClient, boardData: { title: string, userId: string, description?: string, color?: string, }) {
        const board = await boardService.createBoard(supabase, { title: boardData.title, description: boardData.description || '', color: boardData.color || 'bg-blue-500', user_id: boardData.userId })
        await columnService.createColumn(supabase, { title: 'To Do', sort_order: 0, board_id: board.id, user_id: boardData.userId });
        await columnService.createColumn(supabase, { title: 'In Progress', sort_order: 1, board_id: board.id, user_id: boardData.userId });
        await columnService.createColumn(supabase, { title: 'Review', sort_order: 2, board_id: board.id, user_id: boardData.userId });
        await columnService.createColumn(supabase, { title: 'Done', sort_order: 3, board_id: board.id, user_id: boardData.userId });
        return board;
    },

    async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
        const board = await boardService.getBoard(supabase, boardId);
        const columns = await columnService.getColumns(supabase, boardId);
        const tasks = await taskService.getTaskByBoard(supabase, boardId);
        const columnsWithTask = columns.map((column) => ({
            ...column,
            tasks: tasks.filter((task) => task.column_id === column.id)
        }))
        return { board, columns, columnsWithTask };
    }
}

