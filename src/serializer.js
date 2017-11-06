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
    const circularityDetector = function() {
      const alreadySerialized = new WeakSet();
      return function throwIfCircular(value) {
        if (typeof value === 'object') {
          if (alreadySerialized.has(value)) {
            throw new Error('Circular dependency detected - class: ' + value.constructor.name);
          } 
          alreadySerialized.add(value);
        }
      }
    }();

    const classMap = this.classMap;
    const classStorer = function() {
      return function storeClass(value) {
        if (typeof value === 'object') {
          const className = value.constructor.name;
          if (classMap[className]) {
            // Need to shallow copy object to avoid infinite recursion
            return ['class: ' + className, Object.assign({}, value)];
          }
        }
        return value;
      }
    }();

    return function(key, value) {
      circularityDetector(value);
      return classStorer(value);
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
