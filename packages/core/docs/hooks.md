# Hooks

> [!WARNING]
>
> Hooks are intended as both an extension mechanism and an escape hatch. Being
> able to execute hooks is a supported feature, but making sure your hooks
> behave correctly in different scenarios is up to you.

A [module root](./modules.md#module-roots) may define an additional `hooks`
property, which executes an array of middleware functions when a module is
[activated](./modules.md#activated-module) (by loading it into a container or
into another module).

The hooks defined on the module root will be executed before any binding takes
place, and any imported module will also be passed through the same hook
functions (also before any binding takes place in their respective module
containers).

> [!NOTE]
>
> Even though it's syntactically valid to define hooks in any module, only the
> module root that is loaded into an Inversify container will have it's hooks
> executed.

## Hook Functions

Hooks receive a reference to the module instance, and a reference to the module
container.

Accessing the module instance means you can access either core properties like
`imports`, `bindings`, or `exposes`, or define your own new properties for use.

See the [Hooks type signature](./API%20Reference/type-aliases/Hook.md) or the
Subversify source code for further details.

For example,
[`@subversify/express-utils`](../../subversify-express-utils/) reads a
`controllers` property so that modules can define global controllers linked to
module-level dependencies.

You can also access the constructor through the instance
(`moduleDefinition.constructor`) which makes hooks a good way to read and act on
metadata defined by decorators. This is how [Global
Modules](./modules.md#global-modules) are implemented internally.

## Type Safety

As discussed in [Module Patterns](./modules.md#patterns), you can define
your modules as classes using various JavaScript/TypeScript syntax features.

Public class fields can have some non-obvious gotchas when it comes to typing.

The short version is there are three recommendations for providing types for
your hooks and module graphs using hooks:

### Define a Type for your Hooks

Define an object type that defines any extra properties your hook supports.
Using `With${PropName}` is a suggested naming convention:

```typescript
type Constructor<T = unknown> = { new(...args: any[] ): T }

export type WithControllers = {
  controllers?: Constructor[]
}
```

### Use `implements` for static modules

If you are using public class fields and don't need a factory for your module, use `implements`:

```typescript
import { Module } from "@subversify/core";
import type { WithControllers } from "@subversify/express-utils";

export class UserModule extends Module implements WithControllers {
  controllers: [123]; // will now flag a type error
}
```

### Use Generics for modules created with factories

If your module is instantiated by a factory through it's constructor, use the
generic parameter of `Module` to type the constructor arguments:

```typescript
import { Module } from "@subversify/core";
import type { WithControllers } from "@subversify/express-utils";
class UserModule extends Module<WithControllers> {}

const UserModuleFactory = {
  register(options?: any) {
    return new UserModule({
      controllers: [123], // will now flag a type error
      imports: [],
      bindings: [],
      exposes: []
    })
  }
}

export { UserModuleFactory as UserModule };
```