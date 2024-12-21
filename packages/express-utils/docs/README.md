# @subversify/express-utils

The `@subversify/express-utils` package provides a customized decorator and
module hook for working with `inversify-express-utils` controllers in a
Subversify application.

It is generally intended for working with _existing_ `inversify-express-utils`
controllers as part of a progressive modularisation strategy, to overcome the
global registration approach of `inversify-express-utils`. Suitable
alternatives&mdash;if any&mdash;depend on your specific situation too much for
any recommendations to be made here.

## Installation

```
$ npm install --save @subversify/express-utils
```

## Usage

### Defining/Migrating Controllers

When creating a new controller or migrating an existing controller within a
Subversify module, use this package's `@controller` decorator instead of the one
exported by `inversify-express-utils`.

Other decorators such as `httpGet` etc. should continue to be imported from
`inversify-express-utils`.

```typescript title="user.controller.ts" linenums="1"
import { controller } from "@subversify/express-utils";
import { httpGet, response } from "inversify-express-utils";

@controller("/users")
export class UserController { 
  @httpGet("/")
  public index(@response() res: express.Response) {
    res.send("OK");
  }
}
```

Internally, the `@controller` decorator proxies all arguments to the
`@controller` decorator from `inversify-express-utils`, but removes the
automatic global registration of the controller.

### Registering Controllers

In your application [module root](../subversify-core/modules.md#module-roots),
register the `Controllers` hook from this package. The hook is a factory
function, with zero parameters:

```typescript title="app.module.ts" linenums="1"
import { Module } from "@subversify/core";
import { ControllersHook } from "@subversify/express-utils";

export class AppModule {
  hooks = [ControllersHook()];
  /* imports, bindings, etc. */
}
```

Now, in your module(s) you can register your controller by explicitly including
it in a `controllers` class property. If you do not include it in a
`controllers` property, it will not be registered in the Inversify Express
Server.

For static modules, you can implement `WithControllers` for better type safety:

```typescript title="user.module.ts" linenums="1"
import { Module } from "@subversify/core";
import { WithControllers } from "@subversify/express-utils";

export class UserModule extends Module implements WithControllers {
  controllers = [UserController];
}
```

For module factories, you will need to use `WithControllers` as a generic type
parameter to tell the base `Module` constructor about the new `controllers`
property:

```typescript title="user.module.ts" linenums="1"
import { Module } from "@subversify/core";
import { WithControllers } from "@subversify/express-utils";

class UserModule extends Module<WithControllers> {}

const UserModuleFactory = {
  static register(options?: any) {
    return new UserModule({
      controllers: [UserController]
    });
  }
}

export { UserModuleFactory as UserModule }
```

That's it. Building your Inversify Express Server is the same as the
`inversify-express-utils` package documentation.

## Gotchas

Moving your controller into a Subversify module means it can only access
dependencies defined by that module, it's imports, or [global
module](../subversify-core/modules.md#global-modules) bindings.

If your controller currently depends on services defined in your root container,
some work may be required to refactor those into modules that can be imported.