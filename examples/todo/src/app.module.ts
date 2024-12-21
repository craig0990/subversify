import { GlobalHook, Module } from "@subversify/core";
import { ControllersHook } from "@subversify/express-utils";

import { TypeOrmModule } from "./typeorm";
import { TodoModule } from "./todo/todo.module";
import { App } from "./app";
import dataSource from "./data-source";

export class AppModule extends Module {
  hooks = [GlobalHook(), ControllersHook()];
  imports = [
    TypeOrmModule.forRoot(dataSource),
    TodoModule,
  ];
  bindings = [App];
  exposes = [App];
}
