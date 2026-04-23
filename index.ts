import { createSlice, configureStore } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IBoardState, ITask } from '../types';
import { v4 as uuidv4 } from 'uuid';

const initialState: IBoardState = JSON.parse(localStorage.getItem('kanban-state') || 'null') || {
  columns: [
    { id: 'col-1', title: 'To Do', color: '#4F46E5', tasks: [] },
    { id: 'col-2', title: 'In progress', color: '#E5A500', tasks: [] },
    { id: 'col-3', title: 'Done', color: '#10B981', tasks: [] },
  ]
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    addColumn: (state, action: PayloadAction<string>) => {
      state.columns.push({
        id: uuidv4(),
        title: action.payload,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        tasks: []
      });
    },
    deleteColumn: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(col => col.id !== action.payload);
    },
    addTask: (state, action: PayloadAction<{colId: string, task: Omit<ITask, 'id'>}>) => {
      const col = state.columns.find(c => c.id === action.payload.colId);
      if (col) col.tasks.push({ ...action.payload.task, id: uuidv4() });
    },
    updateTask: (state, action: PayloadAction<{colId: string, task: ITask}>) => {
        const col = state.columns.find(c => c.id === action.payload.colId);
        if (col) {
            const idx = col.tasks.findIndex(t => t.id === action.payload.task.id);
            if (idx !== -1) col.tasks[idx] = action.payload.task;
        }
    },
    deleteTask: (state, action: PayloadAction<{colId: string, taskId: string}>) => {
      const col = state.columns.find(c => c.id === action.payload.colId);
      if (col) col.tasks = col.tasks.filter(t => t.id !== action.payload.taskId);
    },
    moveTask: (state, action: PayloadAction<{
      sourceCol: string, 
      destCol: string, 
      sourceIdx: number, 
      destIdx: number 
    }>) => {
      const { sourceCol, destCol, sourceIdx, destIdx } = action.payload;
      const sCol = state.columns.find(c => c.id === sourceCol);
      const dCol = state.columns.find(c => c.id === destCol);
      if (sCol && dCol) {
        const [removed] = sCol.tasks.splice(sourceIdx, 1);
        dCol.tasks.splice(destIdx, 0, removed);
      }
    }
  }
});

export const store = configureStore({ 
  reducer: { board: boardSlice.reducer } 
});

store.subscribe(() => {
  localStorage.setItem('kanban-state', JSON.stringify(store.getState().board));
});

export const { addColumn, deleteColumn, addTask, deleteTask, moveTask, updateTask } = boardSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;