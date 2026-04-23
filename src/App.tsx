import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

import type { RootState } from '@/store';
import type { Priority, ITask } from '@/types';
import { moveTask, addColumn, addTask, deleteTask, deleteColumn, updateTask } from '@/store';
import ErrorBoundary from '@/components/ErrorBoundary.tsx';

const PageLayout = styled.div`
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 40px 20px;
`;

const ColumnGrid = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  align-items: flex-start;
  @media (max-width: 390px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const KanbanColumn = styled.div`
  background: #f1f2f4;
  border-radius: 12px;
  min-width: 300px;
  width: 300px;
  @media (max-width: 390px) { width: 100%; }
`;

const ColumnHeader = styled.div<{ bg: string }>`
  padding: 15px;
  background: ${props => props.bg};
  color: white;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const TaskCard = styled.div`
  background: white;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const Badge = styled.span<{ level: Priority }>`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
  display: inline-block;
  background: ${props => props.level === 'High' ? '#fee2e2' : props.level === 'Medium' ? '#fef3c7' : '#dcfce7'};
  color: ${props => props.level === 'High' ? '#ef4444' : props.level === 'Medium' ? '#d97706' : '#16a34a'};
`;

const Btn = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-size: 11px;
  margin-left: 8px;
  &:hover { opacity: 0.7; }
`;

export default function App() {
  const { columns } = useSelector((state: RootState) => state.board);
  const dispatch = useDispatch();

  const handleEditTask = (colId: string, task: ITask) => {
    const newTitle = prompt("Изменить заголовок:", task.title);
    if (!newTitle) return;
    const newDesc = prompt("Изменить описание:", task.description) || "";
    const newPriority = prompt("Изменить приоритет (Low, Medium, High):", task.priority) as Priority;
    dispatch(updateTask({ colId, task: { ...task, title: newTitle, description: newDesc, priority: newPriority } }));
  };

  return (
    <ErrorBoundary>
      <PageLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>Dashboard</h1>
          <button onClick={() => {const t = prompt("Название колонки:"); if(t) dispatch(addColumn(t))}}>+ Колонка</button>
        </div>

        <DragDropContext onDragEnd={(res: DropResult) => {
          if (!res.destination) return;
          dispatch(moveTask({
            sourceCol: res.source.droppableId, destCol: res.destination.droppableId,
            sourceIdx: res.source.index, destIdx: res.destination.index
          }));
        }}>
          <ColumnGrid>
            {columns.map(col => (
              <KanbanColumn key={col.id}>
                <ColumnHeader bg={col.color}>
                  <span>{col.title} ({col.tasks.length})</span>
                  <Btn onClick={() => dispatch(deleteColumn(col.id))} style={{color:'white'}}>✕</Btn>
                </ColumnHeader>
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{minHeight:'100px'}}>
                      {col.tasks.map((t, idx) => (
                        <Draggable key={t.id} draggableId={t.id} index={idx}>
                          {(provided) => (
                            <TaskCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              {t.priority && <Badge level={t.priority}>{t.priority}</Badge>}
                              <h4 style={{margin:0}}>{t.title}</h4>
                              <p style={{fontSize:'12px', color:'#666'}}>{t.description}</p>
                              <div style={{marginTop:'10px', textAlign:'right'}}>
                                <Btn onClick={() => handleEditTask(col.id, t)}>Ред.</Btn>
                                <Btn onClick={() => dispatch(deleteTask({colId: col.id, taskId: t.id}))} style={{color:'red'}}>Удалить</Btn>
                              </div>
                            </TaskCard>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                <button style={{width:'94%', margin:'3%', padding:'8px'}} onClick={() => {
                  const tit = prompt("Задача:"); if(tit) dispatch(addTask({colId:col.id, task:{title:tit, description:"", priority:""}}))
                }}>+ Задача</button>
              </KanbanColumn>
            ))}
          </ColumnGrid>
        </DragDropContext>
      </PageLayout>
    </ErrorBoundary>
  );
}