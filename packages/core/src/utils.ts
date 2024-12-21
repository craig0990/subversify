import type { Binding, BindingDefinition } from "./interfaces";

export const normalizeBinding = (binding: Binding): BindingDefinition =>
  typeof binding === "object" ? binding : { identifier: binding, prepare: (bind) => bind.toSelf() };

export const printBinding = ({ identifier }: BindingDefinition): string =>
  typeof identifier === "string" || typeof identifier === "symbol"
    ? identifier.toString()
    : identifier.name || identifier.constructor.name || identifier.toString();
