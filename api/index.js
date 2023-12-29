import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
const app = express();
app.use(cors());
dotenv.config();

app.use(express.json());

let url = process.env.URL;
const sequelize = new Sequelize(url);

const Cred = sequelize.define("Cred", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING},
  password: { type: DataTypes.STRING },
});

Cred.sync();

const List = sequelize.define("List", {
  list_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  list_name: { type: DataTypes.STRING },
  user_id: { type: DataTypes.INTEGER },
});

List.sync();

const Task = sequelize.define("Task", {
  task_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_description: { type: DataTypes.STRING },
  list_id: { type: DataTypes.INTEGER },
  task_status: { type: DataTypes.STRING },
});

Task.sync();

app.post("/login", async (req, res) => {
  try {
    const user = await Cred.findOne({
      where: { email: req.body.email },
    });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      res.status(200).json(user.user_id);
    } else {
      res.status(401).send("Username or password incorrect");
    }
  } catch {
    res.status(500).send();
  }
});

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await Cred.create({
      email: req.body.email,
      password: hashedPassword,
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

app.get("/lists/:user_id", async (req, res) => {
  //find lists by user_id
  try {
    const lists = await List.findAll({
      where: { user_id: req.params.user_id },
    });
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).send();
  }
});

app.post("/lists", async (req, res) => {
  //create list
  try {
    const list = await List.create({
      list_name: req.body.list_name,
      user_id: req.body.user_id,
    });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).send();
  }
});

app.put("/lists", async (req, res) => {
  //update list
  try {
    const list = await List.update(
      { list_name: req.body.list_name },
      { where: { list_id: req.body.list_id } }
    );
    res.status(201).json(list);
  } catch (error) {
    res.status(500).send();
  }
});

app.delete("/lists/:list_id", async (req, res) => {
  //delete list
  try {
    const list = await List.destroy({
      where: { list_id: req.params.list_id },
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).send();
  }
});

app.post("/tasks", async (req, res) => {
  //create task
  try {
    const task = await Task.create({
      task_description: req.body.task_description,
      list_id: req.body.list_id,
      task_status: req.body.task_status,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send();
  }
});

app.get("/tasks/:list_id", async (req, res) => {
  //find tasks by list_id
  try {
    const tasks = await Task.findAll({
      where: { list_id: req.params.list_id },
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

//update list_id of task

app.put("/movetask", async (req, res) => {
  //update task
  try {
    const task = await Task.update(
      { list_id: req.body.list_id },
      { where: { task_id: req.body.task_id } }
    );
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send();
  }
});

app.put("/tasks", async (req, res) => {
  //update task
  try {
    const task = await Task.update(
      { task_description: req.body.task_description },
      { where: { task_id: req.body.task_id } }
    );
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send();
  }
});

app.put("/taskstatus", async (req, res) => {
  //update task
  try {
    const task = await Task.update(
      { task_status: req.body.task_status },
      { where: { task_id: req.body.task_id } }
    );
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send();
  }
});

app.delete("/tasks/:task_id", async (req, res) => {
  //delete task
  try {
    const task = await Task.destroy({
      where: { task_id: req.params.task_id },
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).send();
  }
});

const port = process.env.PORT || 3000;
app.listen(port);
