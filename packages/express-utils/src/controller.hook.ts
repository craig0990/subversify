import type { Container } from "inversify";
import { METADATA_KEY, type ControllerMetadata } from "inversify-express-utils";
import { WithControllers } from "./interfaces";
import { ModuleDefinition } from "@subversify/core";

export const ControllersHook = () => (moduleDefinition: ModuleDefinition & WithControllers, moduleContainer: Container) => {
  const { controllers = [] } = moduleDefinition;

  controllers.forEach((controller) => {
    const currentMetadata: ControllerMetadata = Reflect.getMetadata(METADATA_KEY.controller, controller);
    const existingMetadata: ControllerMetadata[] = Reflect.getMetadata(METADATA_KEY.controller, Reflect) || [];

    if (!currentMetadata) {
      // Not tagged as an Inversify/Express; skip it
      // @TODO warn by default?
      return;
    }

    currentMetadata.target = new Proxy<any>(currentMetadata.target, {
      construct(targetClass) {
        return moduleContainer.resolve(targetClass);
      }
    })

    Reflect.defineMetadata(METADATA_KEY.controller, [currentMetadata, ...existingMetadata], Reflect);
  });
};
