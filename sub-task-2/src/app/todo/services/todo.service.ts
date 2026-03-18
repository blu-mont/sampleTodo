import { ITodo } from '../models/todo.interface';
import { TodoBaseService } from './todo-base.service';

function randomDateString(start: Date, end: Date): string {
    const startMs = start.getTime();
    const endMs = end.getTime();
    const rand = Math.floor(Math.random() * (endMs - startMs + 1)) + startMs;
    const d = new Date(rand);
    return d.toISOString();
}

export class TodoService extends TodoBaseService {
    private todos: ITodo[] = [];

    /**
     * Replace current todo list with a deep-cloned copy of the provided list.
     */
    setTodos(todos: ITodo[]): void {
        this.todos = todos.map(t => ({ ...t }));
    }

    async setTodosFromApi(): Promise<void> {
        const url = 'https://jsonplaceholder.typicode.com/todos?_limit=20';
        console.log('[TodoService] Fetching todos from API:', url);
        const res = await fetch(url);
        console.log('[TodoService] API response status:', res.status);
        if (!res.ok) {
            console.error('[TodoService] Failed to fetch todos:', res.status);
            throw new Error(`Failed to fetch todos: ${res.status}`);
        }
        const data = await res.json();
        console.log('[TodoService] API response data:', data);
        if (!Array.isArray(data)) {
            console.error('[TodoService] API response is not an array:', data);
            throw new Error('API response is not an array');
        }
        const start = new Date('2024-01-01T00:00:00.000Z');
        const end = new Date('2024-07-01T00:00:00.000Z');
        const todos: ITodo[] = data.map((item: any) => ({
            id: Number(item.id),
            title: String(item.title),
            completed: Boolean(item.completed),
            creationDate: randomDateString(start, end),
        }));
        console.log('[TodoService] Todos after mapping:', todos);
        this.setTodos(todos);
        console.log('[TodoService] Todos set in service:', this.todos);
    }

    addTodo(todo: ITodo): void {
        this.todos.push(todo);
    }

    deleteTodo(id: number): void {
        console.log('[TodoService] Deleting todo with id:', id);
        this.todos = this.todos.filter(t => t.id !== id);
        console.log('[TodoService] Todos after deletion:', this.todos);
    }

    updateTodo(id: number, changes: Partial<ITodo>): void {
        this.todos = this.todos.map(t => t.id === id ? { ...t, ...changes } : t);
    }

    getTodos(): ITodo[] {
        return [...this.todos];
    }
}
