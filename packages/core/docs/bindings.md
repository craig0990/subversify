# Bindings

Bindings are used in the `bindings` and `exposes` properties of a module.

Subversify supports two ways of declaring a binding; either with a direct
reference to a **class constructor**, or with a full **binding definition**.

## Binding Definition

A binding definition is of the form `{ identifier, prepare }`. Both fields are required.

### `identifier`

An identifier that will be used to bind to the [module
container](./modules.md#module-container). This is usually a reference to a
class constructor, but it can be any valid Inversify service identifier such as
a string, symbol, or `Function` reference

### `prepare(bind)`

A preparation function, where you can define how to bind your identifier to the
module container. Subversify handles the initial bind call for you.

The function will receive a `bind` parameter, which is the result of a call to
the `moduleContainer.bind(identifier)` function.

You can chain new fluent calls off this just like ordinary Inversify bindings,
such as a `bind.toDynamicValue(() => /* ... */)`, etc.

## Constructor Shorthand

When you define a binding as a reference to a class constructor, Subversify
expands this to a default binding definition. For example, `MyService` becomes:

<!-- eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars -->
```typescript
import type { Binding } from "@subversify/core";

class MyService {}

const binding: Binding = {
  identifier: MyService,
  prepare: (bind) => bind.toSelf()
}
```
<!-- eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars -->

Which is equivalent to: `moduleContainer.bind(MyService).toSelf()`

## Exposed Bindings

Exposed bindings have the same type signature, but they only use the
`identifier`. The `prepare` step is unused and is not executed.

When a module is loaded into another container (via module `imports` or a manual
container call to `loadAsync`) it will be bound as a dynamic value, proxying
through to the imported module container. Conceptually, it looks like this:

```typescript
import { Container, type interfaces } from "inversify";

export class Module {
  registry(bind: interfaces.Bind) {
    const moduleContainer = new Container();
    this.exposes.forEach((exposedBinding) => {
        // Bind function is provided by the target module/container being imported into
        bind(exposedBinding.identifier).toDynamicValue(() => moduleContainer.get(exposedBinding.identifier));
    });
  }
}
```

This works because [module containers have a `defaultScope` of
`Singleton`](./modules.md#module-container-default-scope), which is discussed
further in the [Modules section](./modules.md) of the documentation.