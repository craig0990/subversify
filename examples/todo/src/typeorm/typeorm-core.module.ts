import { Binding, Module, Global } from "@subversify/core";
import { DataSource, DataSourceOptions } from "typeorm";
import { DEFAULT_DATA_SOURCE_NAME } from "./constants";
import { DataSourceIdentifier } from "./utils";

export type TypeOrmCoreOptions = DataSource | DataSourceOptions;

@Global()
class TypeOrmCoreModule extends Module {}

const TypeOrmCoreModuleFactory = {
  /**
   * @TODO not 100% sure where `dataSource.initialize` belongs
   * @param config 
   * @returns 
   */
  forRoot(config: TypeOrmCoreOptions, name: string = DEFAULT_DATA_SOURCE_NAME) {
    const dataSource = config instanceof DataSource ? config : new DataSource(config);

    const binding: Binding = {
      identifier: DataSourceIdentifier(name),
      prepare: (bind) => bind.toConstantValue(dataSource),
    };

    return new TypeOrmCoreModule({
      bindings: [binding],
      exposes: [binding],
    });
  },
};

export { TypeOrmCoreModuleFactory as TypeOrmCoreModule };
