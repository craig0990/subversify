import { Container } from "inversify";
import { AppModule } from "./app.module";
import { App } from "./app";

const container = new Container();

container.loadAsync(new AppModule()).then(async () => {
  const app = container.resolve(App);

  await app.listen();
});