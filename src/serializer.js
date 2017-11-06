class Serializer {

  constructor(classMap) {
    this.classMap = classMap;
  }

  serialize(instance) {
    return JSON.stringify(instance, this.replacer());
  }

  deserialize(jsonString) {
    return JSON.parse(jsonString, this.reviver());
  }

  replacer() {
    const classMap = this.classMap;
    const alreadySerialized = new WeakSet();

    return function storeClass(key, value) {
      if (typeof value === 'object') {
        const className = value.constructor.name;

        if (alreadySerialized.has(value)) {
          throw new Error('Circular dependency detected - class: ' + className);
        } 
        alreadySerialized.add(value);

        if (classMap[className]) {
          // Need to shallow copy object to avoid infinite recursion
          return ['class: ' + className, Object.assign({}, value)];
        }
      }

      return value;
    }
  }

  reviver() {
    const classMap = this.classMap;

    return function restoreClass(key, value) {
      if (Array.isArray(value) && 
          typeof value[0] === 'string' && 
          value[0].slice(0, 7) === 'class: ') {
        const className = value[0].slice(7);
        const properties = value[1];
        const constructor = classMap[className];
        if (constructor) {
          return new constructor(properties);
        } else {
          throw new Error('Atttempt to de-serialize unmapped class: ' + className);
        }
      }
      return value;
    }
  }

}

export default Serializer
