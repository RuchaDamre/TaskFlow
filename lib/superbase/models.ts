export type Board = {
    id: string,
    title: string,
    description: string | null,
    color: string,
    user_id: string,
    created_at: string,
    updated_at: string,
}

export type Column = {
    id: string,
    board_id: string,
    title: string,
    sort_order: number,
    created_at: string,
    user_id: string,
}

export type Task = {
    id: string,
    column_id: string,
    title: string,
    description: string | null,
    assignee: string | null,
    due_date: string | null,
    priority: 'Low' | 'Medium' | 'High',
    created_at: string,
    sort_order: number,
}

export type ColumnWithTasks = Column & {
    tasks: Task[],
}

export type TaskData = {
    title: string,
    description?: string,
    assignee?: string,
    dueDate?: string,
    priority: 'High' | 'Low' | 'Medium'
}