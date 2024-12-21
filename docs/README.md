<!--: <section class="home" markdown> -->
<!--: <section class="full-width" data-md-color-scheme="slate" markdown> -->
<!--: <div class="grid" markdown> -->
<!--: <section markdown> -->

# ⸬ Isolated Modules for Inversify

**Subversify** is a lightweight wrapper around Inversify Container Modules,
designed to help enforce modular isolation and scoped bindings. It helps
progressively streamline complex container bindings, making it easier to manage
large numbers of dependencies without sacrificing Inversify's flexibility.

[Read the Docs](https://craig0990.github.io/subversify/)<!--: { .md-button .md-button--primary } -->

<!--: </section> -->
<!--: <section markdown> -->
```typescript { title="app.module.ts" }
import { Module } from "@subversify/core";
import { TodoModule } from "./todo/todo.module";
import { App } from "./app";

export class AppModule extends Module {
  imports = [TodoModule]; // (1)!
  bindings = [App]; // (2)!
  exposes = [App]; // (3)!
}
```

1. Import Subversify modules or other Inversify Container Modules
2. Declare bindings private to this module
3. Expose selected bindings for other modules to import
<!--: </section> -->
<!--: </div> -->

<!--: <div class="grid cards" markdown> -->

-   **:package: Inversify Native**

    Subversify modules implement the Inversify [`AsyncContainerModule`
    interface](https://github.com/inversify/InversifyJS/blob/f76a93346d01af7085835fc86b9897e81ffed343/wiki/container_modules.md),
    which means you can load them into existing containers with
    `container.loadAsync()`, and unload them with `container.unload()` if
    necessary

-   **:lock: Encapsulated and Isolated**

    Subversify uses private containers for each module, enforcing strong
    isolation while allowing select dependencies to be exposed to other modules
    or containers

-   **:dart: Singletons by Default**

    Module bindings and modules themselves are singletons by default, giving
    predictable behaviour, but with more flexible options when you need them

-   **:wrench: Module Factories**

    Subversify modules are just classes, which means you can use standard
    factory patterns to create dynamic, configurable modules when you need to

-   **:hook: Extensible**

    Subversify has a simple but flexible hook system, allowing you to extend
    what properties a module can define, and act on them. This system also
    powers the built in support for Global Modules

-   **:feather: Lightweight**

    Subversify fits in a few hundres lines of code (and it's core is a few dozen
    lines), and depends on **zero** additional packages

<!--: </div> -->
<!--: </section> -->

<!--: <div class="quick-start" markdown> -->

## Installation

```
npm install --save @subversify/core
```

## Quick Start

A Subversify module is a class that extends `Module` from `@subversify/core`:

```typescript
import { Module } from "@subversify/core";

export class MyModule extends Module {
  imports = [];
  bindings = [];
  exposes = [];
}
```

* **imports** - import other Subversify modules (or, native Inversify Container Modules)
* **bindings** - defines what will be bound to the internal module container
* **exposes** - define a subset of the bindings, for other modules to consume

We can create private module containers and only expose a subset of our module
internals:

```typescript { title="todo.module.ts" }
import { injectable } from "inversify";
import { Module } from "@subversify/core";

class TodoRepository {}

@injectable()
export class TodoService {
  constructor(
    protected todoRepository: TodoRepository
  ) {}
}

export class TodoModule extends Module {
  bindings = [TodoService, TodoRepository];
  exposes = [TodoService];
}
```

We can import them into other modules:


```typescript { title="app.module.ts" }
import { injectable } from "inversify";
import { Module } from "@subversify/core";
import { TodoModule, TodoService } from "./todo.module";

@injectable()
export class AppService {
  constructor(
    protected todoService: TodoService
  ) {}
}

export class AppModule extends Module {
  imports = [TodoModule];
  bindings = [AppService];
  exposes = [AppService];
}
```

And load them into new or existing Inversify containers:

```typescript { title="index.ts" }
import { Container } from "inversify";
import { AppModule, AppService } from "./app.module";

const container = new Container();
container.loadAsync(new AppModule()).then(() => {
  const appService = container.resolve(AppService);
  console.log(appService);
});
```
