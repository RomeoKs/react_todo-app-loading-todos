/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import {
  createTodo, getTodo, getTodos, refreshTodo, removeTodo,
} from './api/todos';
import { TodoError } from './components/TodoError';
import { Status, ToDoFooter } from './components/TodoFooter';
import { Header } from './components/TodoHeader';
import { TodoMain } from './components/TodoMain';
import { Todo } from './types/Todo';
import { UserWarning } from './UserWarning';

const USER_ID = 6245;

enum ErrorMessage {
  onLoad = 'Unable to load todos',
  OnAdd = 'Unable to add todos',
  onDelete = 'Unable to delete todos',
  onUpdate = 'Unable to update todos',
  onEmpty = "Title can't be empty",
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [status, setStatus] = useState<Status>('all');

  useEffect(() => {
    getTodos(USER_ID)
      .then(setTodos)
      .catch(() => {
        setError(true);
        setErrorMsg(ErrorMessage.onLoad);

        setTimeout(() => {
          setError(false);
        }, 3000);
      });
  }, []);

  useEffect(() => {
    if (todo) {
      getTodo(todo.id)
        .then(setTodo);
    }
  }, [todo]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const addTodo = (todoData: Omit<Todo, 'id'>) => {
    if (todoData.title !== '') {
      createTodo(todoData)
        .then(newTodo => setTodos([...todos, newTodo]))
        .catch(() => setErrorMsg(ErrorMessage.OnAdd));
    } else {
      setError(true);
      setErrorMsg(ErrorMessage.onEmpty);
      setTimeout(() => {
        setError(false);
        setErrorMsg('');
      }, 3000);
    }
  };

  const deleteTodo = (todoId: number) => {
    removeTodo(todoId)
      .then(() => {
        setTodos(todos.filter(todoToDelete => todoToDelete.id !== todoId));
      })
      .catch(() => setErrorMsg(ErrorMessage.onDelete));
  };

  const updateTodo = (todoToUpdate: Todo) => {
    refreshTodo(todoToUpdate)
      .then(() => {
        setTodos(
          todos.map(currentTodo => {
            if (currentTodo.id === todoToUpdate.id) {
              return todoToUpdate;
            }

            return currentTodo;
          }),
        );
      })
      .catch(() => setErrorMsg(ErrorMessage.onUpdate));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo({
      title: newTodoTitle,
      completed: false,
      userId: USER_ID,
    });

    setNewTodoTitle('');
  };

  let visibleTodos = todos;

  if (status === 'active') {
    visibleTodos = todos.filter(todo => !todo.completed);
  }

  if (status === 'completed') {
    visibleTodos = todos.filter(todo => todo.completed);
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          onSubmit={handleSubmit}
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
        />

        <TodoMain
          todos={visibleTodos}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
        />
        {todos.length > 0 && (
          <ToDoFooter
            todos={visibleTodos}
            status={status}
            setStatus={setStatus}
          />
        )}
      </div>

      {error && (
        <TodoError
          error={error}
          errorMsg={errorMsg}
          setError={setError}
        />
      )}
    </div>
  );
};