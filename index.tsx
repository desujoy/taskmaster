import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";

const app = new Elysia();
const port = 3000;

app.use(html());

app.get("/", ({ html }) =>
  html(
    <BaseHtml>
      <body
        class="flex w-full h-screen justify-center items-center"
        hx-get="/todos"
        hx-trigger="load"
        hx-swap="innerHTML"
      ></body>
    </BaseHtml>
  )
);

app.post("/clicked", () => <div>Hello World!</div>);

app.get("/todos", () => <TodoList todos={todos} />);

app.post("/todos/toggle/:id", ({params}) => {
const todo = todos.find((todo) => todo.id === Number(params.id));
if (todo) {
  todo.completed = !todo.completed;
  return <TodoItem {...todo} />;
}
})

app.delete("/todos/:id", ({params}) => {
  const index = todos.findIndex((todo) => todo.id === Number(params.id));
  if (index !== -1) {
    todos.splice(index, 1);
  }
})

app.post("/todos", ({ body }) => {
  if (body.title.length === 0) {
    throw new Error("No body");
  }
  const newTodo = {
    id: todos.length+1,
    title: body.title,
    completed: false,
  };
  todos.push(newTodo);
  return <TodoItem {...newTodo} />;
}, { body: t.Object({ title: t.String() })});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const BaseHtml = ({ children }: elements.Children) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width" initial-scale="1.0">
    <title>Taskmaster</title>
    <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/hyperscript.org@0.9.11"></script> 
</head>
${children}
`;

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const todos: Todo[] = [
  { id: 1, title: "Task 1", completed: false },
  { id: 2, title: "Task 2", completed: true },
  { id: 3, title: "Task 3", completed: true },
  { id: 4, title: "Task 4", completed: false },
  { id: 5, title: "Task 5", completed: false },
  
];

function TodoItem({ title, completed, id }: Todo) {
  const textStyle = {
    textDecoration: completed ? 'line-through text-gray-500 opacity-50' : 'none',
  };
  return (
    <div class="flex flex-row space-x-3">
      <p class={textStyle.textDecoration}>{title}</p>
      <input type="checkbox" checked={completed}
      hx-post={`/todos/toggle/${id}`}
      hx-target="closest div"
      hx-swap="outerHTML"
      />
      <button class="text-red-500"
      hx-delete={`/todos/${id}`}
      hx-swap="outerHTML"
      hx-target="closest div"
      >X</button>
    </div>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
    <TodoForm />
    </div>
  );
}

function TodoForm() {
  return (
    <form
      class="flex flex-row space-x-3"
      hx-post="/todos"
      hx-swap="beforebegin"
      _="on submit target.reset()"
      >
      <input type="text" name="title" class="border border-black" />
      <button type="submit">Add</button>
    </form>
  );
}