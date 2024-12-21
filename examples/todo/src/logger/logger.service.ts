export class LoggerService {
  id: number;

  constructor() {
    this.id = Math.random();
    this.log("LoggerService created with id", this.id);
  }

  log(...args: any[]) {
    console.log(...args);
  }
}
