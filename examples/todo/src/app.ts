import { Container, inject, injectable } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import type { DataSource } from "typeorm";
import type { Application } from "express";
import bodyParser from 'body-parser';

import { TodoService } from "./todo/todo.service";
import { DataSourceIdentifier } from "./typeorm";

@injectable()
export class App {
  app: Application;

  constructor(
    @inject(DataSourceIdentifier()) protected readonly dataSource: DataSource,
    protected readonly todoService: TodoService,
  ) {
    const server = new InversifyExpressServer(new Container());

    server.setConfig((app) => {
      app.use(bodyParser.json());
    });

    this.app = server.build();
  }

  async listen(port: number = 3000) {
    return this.dataSource.initialize().then(() => {
      this.app.listen(port);

      console.log(`App listening on port ${port}`);
    });
  }
}
