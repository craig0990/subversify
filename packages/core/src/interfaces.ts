import { Container, type AsyncContainerModule, type interfaces } from "inversify";

export type AppFactoryOptions = {
  container?: Container;
};

export type Binding<T = unknown> = interfaces.Newable<T> | BindingDefinition<T>;

export type BindingDefinition<T = unknown> = {
  identifier: interfaces.ServiceIdentifier<unknown>;
  prepare: (bind: interfaces.BindingToSyntax<T>) => void;
};

export type Import =
  | (AsyncContainerModule & ModuleDefinition)
  | interfaces.Newable<AsyncContainerModule & ModuleDefinition>;

export type Hook = (moduleDefinition: ModuleDefinition, moduleContainer: Container) => void | Promise<void>;

export type ModuleDefinition = {
  hooks?: Hook[];
  imports?: Import[];
  bindings?: Binding[];
  exposes?: Binding[];
};
