const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1
//Scenario1
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//Scenario2
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
//Scenario3
const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
//Scenario5
const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
//Scenario6
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
//Scenario7
const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let dictionary = request.query;
  let getTodoQuery = "";
  let errMessage = "";
  switch (true) {
    //Scenario 1
    case hasStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE status='${dictionary.status}';`;
      errMessage = "Invalid Todo Status";
      data = await database.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send(errMessage);
      } else {
        response.send(data);
      }
      break;
    //Scenario 2
    case hasPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE priority='${dictionary.priority}';`;
      errMessage = "Invalid Todo Priority";
      data = await database.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send(errMessage);
      } else {
        response.send(data);
      }
      break;

    //Scenario 3
    case hasPriorityAndStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE priority='${dictionary.priority}' AND status='${dictionary.status}';`;
      data = await database.all(getTodoQuery);
      response.send(data);
      break;
    //Scenario 5
    case hasCategoryAndStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE category='${dictionary.category}' AND status='${dictionary.status}';`;
      data = await database.all(getTodoQuery);
      response.send(data);
      break;
    //Scenario 6
    case hasCategoryProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE category='${dictionary.category}';`;
      errMessage = "Invalid Todo Category";
      data = await database.all(getTodoQuery);
      if (data.length === 0) {
        response.status(400);
        response.send(errMessage);
      } else {
        response.send(data);
      }
      break;
    //Scenario 7
    case hasCategoryAndPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE category='${dictionary.category}' AND priority='${dictionary.priority}';`;
      data = await database.all(getTodoQuery);
      response.send(data);
      break;
    //Scenario 4
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${dictionary.search_q}%';`;
      data = await database.all(getTodoQuery);
      response.send(data);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status, category, due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    due_date = previousTodo.due_date,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${due_date}'
    WHERE
      id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
