class Serializer {

    constructor(classMap) {
        this.classMap = classMap;
    }

    serialize(instance) {
        return JSON.stringify(instance, this.replacer());
    }

    deserialize(jsonString, reconstruct=true) {
        return JSON.parse(jsonString, this.reviver(reconstruct));
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
                        return Object.assign({className: className}, value);
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

    reviver(reconstruct) {
        const classMap = this.classMap;
        return function restoreClass(key, value) {
            if (typeof value === 'object' && value.className) {
                const classConstructor = classMap[value.className];
                if (classConstructor) {
                    if (reconstruct) {
                        return new classConstructor(value);
                    } else {
                        value.classConstructor = classConstructor;
                        return value;
                    }
                } else {
                    throw new Error('Atttempt to de-serialize unmapped class: ' + value.className);
                }
            }
            return value;
        }
    }

}

export default Serializer
