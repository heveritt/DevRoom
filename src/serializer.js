class Serializer {

  constructor(classMap) {
    this.classMap = classMap;
    this.alreadySerealized = undefined;

    this.replacer = this.storeClass.bind(this);
    this.reviver = this.restoreClass.bind(this);
  }

  serialize(instance) {
    this.alreadySerialized = new Set();
    return JSON.stringify(instance, this.replacer);
  }

  deserialize(jsonString) {
    return JSON.parse(jsonString, this.reviver);
  }

  storeClass(key, value) {

    if (typeof value === 'object') {
      const className = value.constructor.name;

      if (this.alreadySerialized.has(value)) {
        throw new Error('Circular dependency detected - class: ' + className);
      } 
      this.alreadySerialized.add(value);

      if (this.classMap[className]) {
        // Need to shallow copy object to avoid infinite recursion
        return ['class: ' + className, Object.assign({}, value)];
      }
    }

    return value;
  }

  restoreClass(key, value) {
    if (Array.isArray(value) && 
        typeof value[0] === 'string' && 
        value[0].slice(0, 7) === 'class: ') {
      const className = value[0].slice(7);
      const properties = value[1];
      const constructor = this.classMap[className];
      if (constructor) {
        return new constructor(properties);
      } else {
        throw new Error('Atttempt to de-serialize unmapped class: ' + className);
      }
    }
    return value;
  }

}

export default Serializer
