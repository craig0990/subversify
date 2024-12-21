import { controller } from "@subversify/express-utils";
import { Request, Response } from "express";
import { httpGet, httpPost, request, response } from "inversify-express-utils";
import { validate } from "class-validator";

import { TodoService } from "./todo.service";
import { Todo } from "./todo.entity";

@controller("/todo")
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @httpGet("/")
  public async getTodos(@response() res: Response) {
    res.status(200).json(await this.todoService.search());
  }

  @httpPost("/")
  public async createTodo(@request() req: Request, @response() res: Response) {
    const todo = new Todo();
    todo.title = req.body.title;
    todo.completed = req.body.completed;

    const errors = await validate(todo, { validationError: { target: false }});

    if (errors.length) {
      return res.status(400).json(errors);
    }
    
    return res.status(201).json(await this.todoService.create(todo));
  }
}
