import { Module } from "./module";
import { Binding, Import } from "./interfaces";
import { Container } from "inversify";

const fake = <T>(overrides = {}) => overrides as T;

describe(Module.name, () => {
  class TestModule extends Module {}

  describe("class", () => {
    it("should conform to AsyncContainerModule", () => {
      const { id, registry } = new TestModule();
      expect(typeof id).toEqual("number");
      expect(typeof registry).toEqual("function");
    });

    it("should assign constructor properties", () => {
      const imports = fake<Import[]>();
      const bindings = fake<Binding[]>();
      const exposes = fake<Binding[]>();
      const module = new TestModule({
        imports,
        bindings,
        exposes,
      });

      expect(module.imports).toBe(imports);
      expect(module.bindings).toBe(bindings);
      expect(module.exposes).toBe(exposes);
    });
  });

  describe("exposes", () => {
    class TestService {}

    it("should not bind unexposed bindings", async () => {
      const module = new TestModule({ bindings: [TestService] });
      const bind = jest.fn();

      await module.registry(bind);

      expect(bind).not.toHaveBeenCalled();
    });

    it("should bind exposed bindings", async () => {
      const module = new TestModule({ bindings: [TestService], exposes: [TestService] });
      const bind = jest.fn().mockReturnValue({ toDynamicValue() {} });

      await module.registry(bind);

      expect(bind).toHaveBeenCalledWith(TestService);
    });

    it("should throw exposing unbound bindings", async () => {
      const module = new TestModule({ exposes: [TestService] });

      expect(module.registry(jest.fn())).rejects.toThrow(/identifiers not bound.*TestService/i);
    });

    it("should expose as a dynamic value", async () => {
      const module = new TestModule({ bindings: [TestService], exposes: [TestService] });
      const toDynamicValue = jest.fn();
      const bind = jest.fn().mockReturnValue({ toDynamicValue });

      await module.registry(bind);

      expect(toDynamicValue).toHaveBeenCalledTimes(1);
      const [ bindingCallback ] = toDynamicValue.mock.calls[0];
      expect(bindingCallback()).toBeInstanceOf(TestService);
    });

    it("should expose singletons by default", async () => {
      const module = new TestModule({ bindings: [TestService], exposes: [TestService] });
      const toDynamicValue = jest.fn();
      const bind = jest.fn().mockReturnValue({ toDynamicValue });

      await module.registry(bind);

      const [ bindingCallback ] = toDynamicValue.mock.calls[0];
      expect(bindingCallback()).toBe(bindingCallback()); // Same instance every time
    });

    it("should expose the same singleton across multiple registrations", async () => {
      const module = new TestModule({ bindings: [TestService], exposes: [TestService] });
      const toDynamicValue = jest.fn();
      const bind = jest.fn().mockReturnValue({ toDynamicValue });

      await module.registry(bind);
      const [ firstBindingCallback ] = toDynamicValue.mock.calls[0];
      const first = firstBindingCallback();

      await module.registry(bind);
      const [ secondBindingCallback ] = toDynamicValue.mock.calls[0];
      const second = secondBindingCallback();
      expect(first).toBe(second); // Still same instance every time
    });

    it("should expose custom prepared bindings", async () => {
      const bindings: Binding[] = [{ identifier: TestService, prepare: (bind) => bind.toSelf().inTransientScope() }]
      const module = new TestModule({ bindings, exposes: bindings });
      const toDynamicValue = jest.fn();
      const bind = jest.fn().mockReturnValue({ toDynamicValue });

      await module.registry(bind);

      const [ bindingCallback ] = toDynamicValue.mock.calls[0];
      expect(bindingCallback()).not.toBe(bindingCallback()); // Different instance every time
    });
    
  });

  describe("imports", () => {
    it("should register imported constructor modules", async () => {
      const registry = jest.fn();
      const construct = jest.fn().mockReturnValue({ registry });
      const MockModule = new Proxy(TestModule, { construct });

      const module = new TestModule({ imports: [MockModule] });

      await module.registry(jest.fn());

      expect(registry).toHaveBeenCalledTimes(1);
    });

    it("should only instantiate constructor modules once across multiple registrations", async () => {
      const construct = jest.fn().mockReturnValue({ registry: jest.fn() });
      const MockModule = new Proxy(TestModule, { construct });

      const module = new TestModule({ imports: [MockModule] });

      await module.registry(jest.fn());
      await module.registry(jest.fn());

      expect(construct).toHaveBeenCalledTimes(1);
    });

    it("should only instantiate constructor modules once in a module graph", async () => {
      const construct = jest.fn().mockReturnValue({ registry: jest.fn() });
      const MockModule = new Proxy(TestModule, { construct });

      const root = new TestModule({
        imports: [
          MockModule,
          new TestModule({ imports: [MockModule] })
        ]
      });

      await root.registry(jest.fn());

      expect(construct).toHaveBeenCalledTimes(1);
    });

    it("should register imported instance modules", async () => {
      const testModule = new TestModule();
      jest.spyOn(testModule, 'registry');

      const module = new TestModule({ imports: [testModule] });

      await module.registry(jest.fn());

      expect(testModule.registry).toHaveBeenCalledTimes(1);
    });
  });

  describe("hooks", () => {
    it("should run hooks with definition and container", async () => {
      const hook = jest.fn();
      const module = new TestModule({ hooks: [hook] });

      await module.registry(jest.fn());

      expect(hook).toHaveBeenCalledWith(module, expect.any(Container));
    });

    it("should run hooks only once across multiple registrations", async () => {
      const hook = jest.fn();
      const module = new TestModule({ hooks: [hook] });

      await module.registry(jest.fn());
      await module.registry(jest.fn());
      await module.registry(jest.fn());

      expect(hook).toHaveBeenCalledTimes(1);
    });
  });
});
