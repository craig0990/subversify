import { inject, interfaces } from "inversify";
import { RepositoryIdentifier } from "./utils";
import { DEFAULT_DATA_SOURCE_NAME } from "./constants";
import { DecoratorTarget } from "inversify-express-utils";

/**
 * TypeScript insists on explicit typing, so return type borrowed from inversify
 * d.ts source 
 */
export const injectRepository = <T = unknown>(
  entity: interfaces.Newable<any>,
  dataSource: string = DEFAULT_DATA_SOURCE_NAME,
): ((
  target: DecoratorTarget,
  targetKey?: string | symbol,
  indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>,
) => void) => inject<T>(RepositoryIdentifier(entity, dataSource));
