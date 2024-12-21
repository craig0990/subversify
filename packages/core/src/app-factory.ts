import { Container, type interfaces } from "inversify";
import type { AppFactoryOptions } from "./interfaces";

/**
 * Provides a simple interface to creating a root container, loading a module
 * root, and returns the configured root container.
 */
export class AppFactory {
  /**
   * 
   * @param AppModule A container module to load, usually a Subversify module
   * @param options Optionally provide the root container to load into
   * @returns A `Promise` that resolves with the configured container
   */
  static async create(AppModule: interfaces.Newable<interfaces.AsyncContainerModule>, options: AppFactoryOptions = {}) {
    const container = options.container || new Container({ defaultScope: "Singleton" });

    await container.loadAsync(new AppModule());

    return container;
  }
}
