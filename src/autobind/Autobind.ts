namespace App {
  // Autobind decorator
  export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = method.bind(this);
        return boundFn;
      },
    };

    return adjDescriptor;
  }
}
