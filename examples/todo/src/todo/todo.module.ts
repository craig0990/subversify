import { Module } from "@subversify/core";
import type { WithControllers } from "@subversify/express-utils";

import { LoggerModule } from "../logger/logger.module";
import { TypeOrmModule } from "../typeorm";

import { Todo } from "./todo.entity";
import { TodoService } from "./todo.service";
import { TodoController } from "./todo.controller";

export class TodoModule extends Module implements WithControllers {
  controllers = [TodoController];
  imports = [LoggerModule, TypeOrmModule.forFeature([Todo])];
  bindings = [TodoService];
  exposes = [TodoService];
}
