const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function exists(username) {
  return (users.some(user => user.username == username)) ? true : false;
}

function getUser(username) {
  return users.find(user => user.username == username);
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!exists(username)) {
    response.status(404).send({ error: "username does not exists" });
  }

  request.username = username;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (exists(username)) response.status(400).send({ error: "username already exists" });

  const id = uuidv4();
  const newUser = {
    id,
    name,
    username,
    todos: []
  };

  users.push(newUser);
  console.log(users);

  response.send(newUser).status(201);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = getUser(username);
  response.status(201).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = getUser(username);

  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = getUser(username);
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoToUpdate = user.todos.find(todo => todo.id == id);

  if (!todoToUpdate) {
    response.status(404).send({ error: "todo not found to update" });
  } else {
    todoToUpdate.title = title;
    todoToUpdate.deadline = deadline;

    response.status(201).send(todoToUpdate);
  }

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = getUser(username);
  const { id } = request.params;

  const todoToUpdate = user.todos.find(todo => todo.id == id);
  if (!todoToUpdate) {
    response.status(404).send({ error: "todo not found to update" });
  } else {
    todoToUpdate.done = true;
    response.status(201).send(todoToUpdate);
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = getUser(username);
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id == id);

  if (todoIndex == -1) {
    response.status(404).send({ error: "Todo item not found" });
  } else {
    user.todos.splice(todoIndex, 1);
    response.status(204).send();
  }
});

module.exports = app;