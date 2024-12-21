import type { Import } from "./interfaces";
import { normalizeBinding, printBinding } from "./utils";

export const inspect = (ModuleDefinition: Import): Record<string, any> => {
  const module = "id" in ModuleDefinition ? ModuleDefinition : new ModuleDefinition();

  const { imports = [], bindings = [], exposes = [] } = module;

  return {
    bindings: bindings.map(normalizeBinding).map(printBinding),
    exposes: exposes.map(normalizeBinding).map(printBinding),
    // @TODO `.name` typing?
    imports: imports.reduce((acc, submodule) => ({ ...acc, [`${(submodule as any).name}`]: inspect(submodule) }), {}),
  };
};
