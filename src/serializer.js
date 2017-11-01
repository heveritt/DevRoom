class Serializer {

  constructor(classMap) {
    this.classMap = classMap;

    this.replacer = this.storeClass.bind(this);
    this.reviver = this.restoreClass.bind(this);
  }

  serialize(instance) {
    return JSON.stringify(instance, this.replacer);
  }

  deserialize(jsonString) {
    return JSON.parse(jsonString, this.reviver);
  }

  storeClass(key, value) {
    if (typeof value === 'object') {
      let className = value.prototype.name;
      if (classMap[className]) {
        return ['class: ' + className, value];
      }
    }
    return value;
  }

  restoreClass(key, value) {
    if (typeof value === 'array' && 
        typeof value[0] === 'string' && 
        value[0].slice(0, 7) === 'class: ' {
      const className = value[0].slice(7);
      const classProps = value[1];
      const classProto = classMap[className];
      if (classProto) {
        return Object.create(classProto, classProps);
      }
    }
    return value;
  }

}

export default Serializer
