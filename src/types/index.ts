export type Priority = 'Low' | 'Medium' | 'High' | '';

export interface ITask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
}

export interface IColumn {
  id: string;
  title: string;
  tasks: ITask[];
  color: string;
}

export interface IBoardState {
  columns: IColumn[];
}