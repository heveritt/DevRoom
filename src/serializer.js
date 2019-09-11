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
        const circularityDetector = ( () => {
            const alreadySerialized = new WeakSet();
            const throwIfCircular = (value) => {
                if (typeof value === 'object') {
                    if (alreadySerialized.has(value)) {
                        throw new Error('Circular dependency detected - class: ' + value.constructor.name);
                    } 
                    alreadySerialized.add(value);
                }
            }
            return throwIfCircular;
        } )();

        const classStorer = (value) => {
            /*if (typeof value === 'object') {
                const className = value.constructor.name;
                if (this.classMap[className]) {
                    // Need to shallow copy object to avoid infinite recursion
                    return Object.assign({className}, value);
                }
            }*/
            return value;
        };

        return (key, value) => {
            circularityDetector(value);
            return classStorer(value);
        }
    }

    reviver(reconstruct) {
        const classRestorer = (value) => {
            if (typeof value === 'object' && value.className) {
                const classConstructor = this.classMap[value.className];
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

        return (key, value) => classRestorer(value);
    }

}

export default Serializer
