import { Binding, Module } from "@subversify/core";
import type { DataSource } from "typeorm";
import type { interfaces } from "inversify";

import { DEFAULT_DATA_SOURCE_NAME } from "./constants";
import { DataSourceIdentifier, RepositoryIdentifier } from "./utils";
import { TypeOrmCoreModule, type TypeOrmCoreOptions } from "./typeorm-core.module";

class TypeOrmModule extends Module {}

const Factories = {
  // @TODO resolve type hinting requirement
  forRoot(config: TypeOrmCoreOptions): Module {
    return new TypeOrmModule({
      imports: [TypeOrmCoreModule.forRoot(config)],
    });
  },

  forFeature(entities: interfaces.Newable<any>[], dataSource: string = DEFAULT_DATA_SOURCE_NAME): Module {
    const bindings: Binding[] = entities.map((entity) => ({
      identifier: RepositoryIdentifier(entity, dataSource),
      prepare(bind) {
        bind
          .toDynamicValue((context) =>
            context.container.get<DataSource>(DataSourceIdentifier(dataSource)).getRepository(entity),
          )
          .inSingletonScope();
      },
    }));

    return new TypeOrmModule({
      bindings,
      exposes: bindings,
    });
  },
};

export { Factories as TypeOrmModule };
