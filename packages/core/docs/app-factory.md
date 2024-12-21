# App Factory

Loading Subversify modules is easy using the built-in Inversify `loadAsync`
method, but Subversify also provides a simple `AppFactory` to help enforce a few
small best practices:

- [x] The root container should load only one Subversify module root for
      consistent binding behaviour
- [x] The root container should have a `defaultScope` of `Singleton`
- [x] The root container should not require manual configuration

The `AppFactory` exposes a `create` factory method that only accepts a single
module, and resolves to a `Promise` with the configured root container:

<!--: /// tab | index.ts -->
```typescript
import { AppFactory } from "@subversify/core";
import { App } from "./app";
import { AppModule } from "./app.module";

AppFactory.create(AppModule).then((container) => {
  const app = container.resolve(App);
});
```
<!--: /// -->
<!--: /// tab | app.ts -->
```typescript
export class App {
  constructor(appService: AppService) {
    console.log(appService);
  }
}
```
<!--: /// -->

## Options

To support progressively migrating to modules in existing applications, the root
container can be provided in the optional `options` argument:

```typescript
AppFactory.create(AppModule, {
  container: existingContainer,
}).then(/** ... */);
```

> [!CAUTION]
>
> For application root containers with a `defaultScope` of `Transient`,
> this "should" be fine as all modules are `Singleton` by default, although this
> has not been tested extensively.
