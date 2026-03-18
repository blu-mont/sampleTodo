import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { ITodo } from './models/todo.interface';
import { TodoService } from './services/todo.service';
import { TodoTableComponent } from "./components/todo-table/todo-table.component";
import { TodoSidebarComponent } from "./components/todo-sidebar/todo-sidebar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-todo.component',
    templateUrl: './todo.component.html',
    styleUrl: './todo.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
        imports: [
            TodoTableComponent,
            TodoSidebarComponent,
            FormsModule,
            CommonModule
        ]
})
export class TodoComponent {
    todos: ITodo[] = [];
    selectedIds: number[] = [];
    sortKey: 'title' | 'creationDate' = 'title';
    sortDir: 'asc' | 'desc' = 'asc';
    editingTodo: ITodo | null = null;
    showSidebar = false;
    private todoService = new TodoService();
    private cdr: ChangeDetectorRef;

    constructor(cdr: ChangeDetectorRef) {
        this.cdr = cdr;
        this.loadTodos();
    }

    async loadTodos() {
        await this.todoService.setTodosFromApi();
        this.todos = this.todoService.getTodos();
        this.cdr.markForCheck();
    }

    onSelect(id: number) {
        if (this.selectedIds.includes(id)) {
            this.selectedIds = this.selectedIds.filter(i => i !== id);
        } else {
            this.selectedIds = [...this.selectedIds, id];
        }
    }

    onEdit(todo: ITodo) {
        this.editingTodo = todo;
        this.showSidebar = true;
    }

    /**
     * Delete todo from data service and refresh table state.
     * @param id Todo item id to delete
     */
    onDelete(id: number): void {
        console.log('[TodoComponent] Deleting todo with id:', id);
        this.todoService.deleteTodo(id);
        this.refreshTodoList();
        this.selectedIds = this.selectedIds.filter(i => i !== id);
    }

    /**
     * Close the editing sidebar and reset current edit target.
     */
    onSidebarClose(): void {
        this.showSidebar = false;
        this.editingTodo = null;
    }

    /**
     * Persist sidebar changes and refresh state.
     * @param updatedTodo updated todo from sidebar
     */
    onSidebarSave(updatedTodo: ITodo): void {
        this.todoService.updateTodo(updatedTodo.id, {
            title: updatedTodo.title,
            creationDate: updatedTodo.creationDate,
        });

        this.refreshTodoList();
    }

    /**
     * Switch sorting field/direction for table.
     */
    onSort(key: 'title' | 'creationDate'): void {
        if (this.sortKey === key) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortDir = 'asc';
        }
    }

    /**
     * Refresh local todo state from service and re-apply filters.
     */
    refreshTodoList(): void {
        this.todos = this.todoService.getTodos();
        this.applyDateFilter();
        this.cdr.markForCheck();
    }

    // Date filter state
    filterStartDate: string | null = null;
    filterEndDate: string | null = null;
    filteredTodos: ITodo[] = [];

    applyDateFilter() {
        if (!this.filterStartDate && !this.filterEndDate) {
            this.filteredTodos = this.todos;
        } else {
            const start = this.filterStartDate ? new Date(this.filterStartDate) : null;
            const end = this.filterEndDate ? new Date(this.filterEndDate) : null;
            this.filteredTodos = this.todos.filter(todo => {
                if (!todo.creationDate) return false;
                const date = new Date(todo.creationDate);
                if (start && date < start) return false;
                if (end && date > end) return false;
                return true;
            });
        }
        this.cdr.markForCheck();
    }

    resetDateFilter() {
        this.filterStartDate = null;
        this.filterEndDate = null;
        this.filteredTodos = this.todos;
        this.cdr.markForCheck();
    }
}
