import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITodo } from '../../models/todo.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-sidebar',
  templateUrl: './todo-sidebar.component.html',
  styleUrls: ['./todo-sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TodoSidebarComponent {
  // The todo item currently being edited in the sidebar.
  @Input() todo: ITodo | null = null;

  // Triggered when the user closes the sidebar without saving.
  @Output() close = new EventEmitter<void>();

  // Triggered when the user saves the current todo values.
  @Output() save = new EventEmitter<ITodo>();

  /**
   * Emit updated todo, then close sidebar.
   */
  onSave(): void {
    if (!this.todo) {
      return;
    }

    this.save.emit(this.todo);
    this.close.emit();
  }
}
