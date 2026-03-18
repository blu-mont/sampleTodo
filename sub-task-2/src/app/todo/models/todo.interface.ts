import { ITodoBase } from './todo-base.interface';

export interface ITodo extends ITodoBase {
    creationDate?: string;
}
