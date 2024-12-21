import { Container } from "inversify";
import { normalizeBinding } from "./utils";
import type { ModuleDefinition } from "./interfaces";

export const SUBVERSIFY_METADATA__GLOBAL = "subversify:global" as const;

export const Global = (): ClassDecorator => (target) => {
  Reflect.defineMetadata(SUBVERSIFY_METADATA__GLOBAL, true, target);
};

export const GlobalHook = () => {
  const GlobalContainer = new Container({ defaultScope: "Singleton" });

  return (moduleDefinition: ModuleDefinition, moduleContainer: Container) => {
    if (Reflect.getMetadata(SUBVERSIFY_METADATA__GLOBAL, moduleDefinition.constructor)) {
      const { exposes = [] } = moduleDefinition;

      exposes
        .map(normalizeBinding)
        .forEach(({ identifier }) =>
          GlobalContainer.bind(identifier).toDynamicValue(() => moduleContainer.get(identifier)),
        );
    }

    moduleContainer.parent = GlobalContainer;
  };
};
