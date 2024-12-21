import { controller as inversifyController, ControllerMetadata, METADATA_KEY, type Middleware } from "inversify-express-utils";

export const controller = (path: string, ...middleware: Middleware[]) => {
  return (target: NewableFunction) => {
    inversifyController(path, ...middleware)(target);

    const currentMetadata: ControllerMetadata = Reflect.getMetadata(METADATA_KEY.controller, target);
    const existingMetadata: ControllerMetadata[] = Reflect.getMetadata(METADATA_KEY.controller, Reflect);

    Reflect.defineMetadata(
      METADATA_KEY.controller,
      existingMetadata.filter((metadata) => metadata !== currentMetadata),
      Reflect,
    );
  };
};
