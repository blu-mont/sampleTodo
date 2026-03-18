import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITodo } from '../../models/todo.interface';
import { TodoService } from '../../services/todo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
	selector: 'app-todo-table',
	templateUrl: './todo-table.component.html',
	styleUrls: ['./todo-table.component.scss'],
	standalone: true,
	imports: [FormsModule, CommonModule]
})
export class TodoTableComponent {
	@Input() todos: ITodo[] = [];
	@Input() selectedIds: number[] = [];
	@Input() sortKey: 'title' | 'creationDate' = 'title';
	@Input() sortDir: 'asc' | 'desc' = 'asc';

	@Output() select = new EventEmitter<number>();
	@Output() sortChange = new EventEmitter<{ key: 'title' | 'creationDate', dir: 'asc' | 'desc' }>();
	@Output() updated = new EventEmitter<void>();
	@Output() edit = new EventEmitter<ITodo>();
	@Output() delete = new EventEmitter<number>();

	editingId: number | null = null;
	editTitle: string = '';
	private todoService = new TodoService();

	get sortedTodos(): ITodo[] {
		const sorted = [...this.todos];
		sorted.sort((a, b) => {
			let compare = 0;
			if (this.sortKey === 'title') {
				compare = (a.title || '').localeCompare(b.title || '');
			} else if (this.sortKey === 'creationDate') {
				const dateA = a.creationDate ? new Date(a.creationDate).getTime() : 0;
				const dateB = b.creationDate ? new Date(b.creationDate).getTime() : 0;
				compare = dateA - dateB;
			}
			return this.sortDir === 'asc' ? compare : -compare;
		});
		return sorted;
	}

	/**
	 * Delete a todo item locally and notify parent to refresh.
	 * @param id Todo ID to delete.
	 */
	onDelete(id: number): void {
		console.log('[TodoTableComponent] Deleting todo with id:', id);
		this.todoService.deleteTodo(id);
		this.updated.emit();
	}

	/**
	 * Toggle current sort direction.
	 * @param key Sort key: title or creationDate.
	 */
	onSort(key: 'title' | 'creationDate'): void {
		let dir: 'asc' | 'desc' = 'asc';
		if (this.sortKey === key) {
			dir = this.sortDir === 'asc' ? 'desc' : 'asc';
		}
		this.sortChange.emit({ key, dir });
	}

	isSelected(id: number): boolean {
		return this.selectedIds.includes(id);
	}

	startEdit(todo: ITodo) {
		this.edit.emit(todo);
	}

	saveEdit(todo: ITodo) {
		this.todoService.updateTodo(todo.id, { title: this.editTitle });
		todo.title = this.editTitle;
		this.editingId = null;
		this.updated.emit();
	}

	cancelEdit() {
		this.editingId = null;
	}
}
