import { interfaces } from "inversify";
import { DEFAULT_DATA_SOURCE_NAME } from "./constants";

export const DataSourceIdentifier = (name: string = DEFAULT_DATA_SOURCE_NAME) => Symbol.for(`datasource:${name}`);

export const RepositoryIdentifier = (entity: interfaces.Newable<any>, dataSourceName: string = DEFAULT_DATA_SOURCE_NAME) =>
  Symbol.for(`${entity.name}Repository:${dataSourceName}`);
