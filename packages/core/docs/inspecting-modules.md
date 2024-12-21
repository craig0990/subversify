# Inspecting Modules

> [!WARNING]
>
> The `inspect` API is unstable, and is a work in progress

Subversify exports an `inspect` function, which accepts an instantiated module
root, and prints a nested object representation of the module graph.

```typescript
import { inspect } from "@subversify/core";
import { AppModule } from "./app.module";

console.log(inspect(new AppModule()));
```