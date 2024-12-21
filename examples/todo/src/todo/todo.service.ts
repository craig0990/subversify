import { injectable } from "inversify";
import { injectRepository } from "../typeorm";
import { Todo } from "./todo.entity";
import { Repository } from "typeorm";
import { LoggerService } from "../logger/logger.service";

@injectable()
export class TodoService {
  constructor(
    @injectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    private readonly logger: LoggerService,
  ) {}

  async search() {
    this.logger.log("Searching for todos");
    return this.todoRepository.find();
  }

  async create(todo: Todo) {
    this.logger.log("Creating todo with %o", todo);
    return this.todoRepository.save(todo);
  }
}
