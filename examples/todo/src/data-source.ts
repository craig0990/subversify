import { DataSource } from "typeorm";
import { Todo } from "./todo/todo.entity";
import path from "path";

export default new DataSource({
  type: "sqlite",
  database: "./todo.db",
  entities: [Todo],
  migrations: [path.join(__dirname, "./migrations/*.ts")],
});
