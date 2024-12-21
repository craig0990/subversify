import { Container, id, type interfaces } from "inversify";
import type { Hook, Binding, Import, ModuleDefinition } from "./interfaces";
import { normalizeBinding, printBinding } from "./utils";

type Newable<T> = interfaces.Newable<T>;
type AsyncContainerModule = interfaces.AsyncContainerModule;

/**
 * Returns a singleton instance of a class from the given WeakMap "registry",
 * creating an instance if one does not yet exist
 * @param registry A `WeakMap` to check for existing instances in
 * @param Module A `Module` constructor reference to use as the `WeakMap` key
 */
const getOrCreate = (
  registry: WeakMap<Newable<AsyncContainerModule>, AsyncContainerModule>,
  Module: Newable<AsyncContainerModule>,
) => (registry.has(Module) ? registry : registry.set(Module, new Module())).get(Module) as AsyncContainerModule;

/**
 * Base Module implementation, all Subversify modules should extend from this base clase
 * 
 * @template T An optional generic parameter to allow users/hooks to define what
 * additional properties may be passed to the constructor
 */
export abstract class Module<T = {}> implements AsyncContainerModule, ModuleDefinition {

  /**
   * An array of hook functions that should be executed when a module is
   * "activated" by being loaded into a container for the first time.
   * 
   * Modules imported by this module will have their hooks overridden, so hooks
   * should only be defined on a "module root".
   * 
   * Hooks only run once per module activation - loading the same module
   * instance into multiple containers will not re-run the hooks
   */
  public readonly hooks?: Hook[];

  /**
   * An array of module constructors to import, or, modules that have already
   * been instantiated (module instances). Module instances may be Subversify
   * module instances, or normal Inversify `ContainerModule` /
   * `AsyncContainerModule` instances.
   */
  public readonly imports?: Import[];

  /**
   * An array of constructors or binding definitions to bind to this module's
   * internal module container
   */
  public readonly bindings?: Binding[];

  /**
   * An array of constructors or binding definitions to expose to parent
   * containers when this module is loaded into a parent container
   */
  public readonly exposes?: Binding[];

  /**
   * Module ID, required by `AsyncContainerModule` interface
   */
  public readonly id = id();

  /**
   * Acts as a singleton cache for a module graph, mapping a constructor (e.g.
   * `MyModule`) to an existing instance (`new MyModule`)
   *
   * This is necessary if a module is imported multiple times in the same tree,
   * to avoid creating multiple module containers with bindings in each of them
   *
   * For example, a `UserModule` and a `CartModule` may both depend on a logger:
   * 
   *       [AppModule]
   *      ┌─────┴─────┐
   * [UserModule] [CartModule]
   *      └─────┬─────┘
   *       [LogModule]
   * 
   * The expectation is that `UserModule` and `CartModule` both get bindings to
   * the same `LogModule` module container, so we get the same instance of any
   * `LogModule` services.
   *
   * The module container is created when the module class is instantiated, so:
   * modules need to be singletons
   */
  protected readonly ModuleRegistry = new WeakMap<Newable<AsyncContainerModule>, AsyncContainerModule>();

  /**
   * The private container for the module. Bindings will be bound to this
   * container internally, as well as any bindings exposed by imported modules
   *
   * The default scope is `Singleton`, and cannot be changed because that
   * presumption simplifies quite a lot of the implementation
   */
  protected readonly moduleContainer = new Container({ defaultScope: "Singleton" });

  /**
   * Track whether we have initialized the module container bindings and any
   * imported modules, to ensure we only initialize once
   */
  protected activated: boolean = false;

  constructor(moduleDefinition?: ModuleDefinition & T) {
    Object.assign(this, moduleDefinition);
  }

  /**
   * The `registry` interface of `AsyncContainerModule`, which is called when
   * loading the module into a container
   * @param bind The bind function provided by the target container
   */
  async registry(bind: interfaces.Bind) {
    const { ModuleRegistry, moduleContainer, hooks = [], exposes = [] } = this;

    /**
     * Perform import and binding operations only once per module instance,
     * tracking via `this.initialized`
     *
     * This would be slightly cleaner in a class method, but that exposes it to
     * subclassing overrides, and we don't want to support that at this stage
     */
    if (!this.activated) {
      /**
       * Run hooks first, in a synchronous loop to avoid any potential mutation issues
       */
      for (const hook of hooks) {
        await hook(this, moduleContainer);
      }

      /**
       * Only destructure imports and binding references after hooks have run,
       * in case the references get replaced
       */
      const { imports = [], bindings = [] } = this;

      for (const ImportedModule of imports) {
        /**
         * If the imported module has an "id", it's already instantiated,
         * otherwise, get or create a singleton from our internal module
         * registry
         */
        const submodule = "id" in ImportedModule ? ImportedModule : getOrCreate(ModuleRegistry, ImportedModule);

        /**
         * Load it as usual, but override the `hooks` and `ModuleRegistry` down
         * the module "tree"
         *
         * This sort of thing would normally be constructor parameters, but we
         * don't want it to show up in type hints/intellisense, and we don't
         * want end users to be overriding thse values unless they are
         * explicitly choosing to manipulate instances via hooks
         */
        await moduleContainer.loadAsync(Object.assign(submodule, { hooks, ModuleRegistry }));
      }

      bindings.map(normalizeBinding).forEach(({ identifier, prepare }) => prepare(moduleContainer.bind(identifier)));

      this.activated = true;
    };

    const exposed = exposes.map(normalizeBinding);
    const unbound = exposed.filter(({ identifier }) => !this.moduleContainer.isBound(identifier));

    if (unbound.length) {
      throw new ReferenceError(`Exposed identifiers not bound: ${unbound.map(printBinding)}`);
    }

    exposed.forEach(({ identifier }) => bind(identifier).toDynamicValue(() => this.moduleContainer.get(identifier)));
  }
}
