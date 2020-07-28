class Serializer {

    constructor(classMap) {
        this.classMap = classMap;
        this.serialize = this.serialize.bind(this);
        this.deserialize = this.deserialize.bind(this);
    }

    serialize(instance, includeDerived=true) {
        return JSON.stringify(instance, this.replacer(includeDerived));
    }

    deserialize(jsonString, reconstruct=true) {
        return JSON.parse(jsonString, this.reviver(reconstruct));
    }

    replacer(includeDerived) {
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

        /* This turns out to be incompatable with build minification so parked at present.

        const classStorer = (value) => {
            if (typeof value === 'object') {
                const className = value.constructor.name;
                if (this.classMap[className]) {
                    // Need to shallow copy object to avoid infinite recursion
                    return Object.assign({className}, value);
                }
            }
            return value;
        };

        */

        const filterDerived = (key, value) =>
        {
            return (key === 'path') ? undefined : value;
        }

        return (key, value) => {
            circularityDetector(value);
            return includeDerived ? value : filterDerived(key, value);
        }
    }

    reviver(reconstruct) {
        const classRestorer = (key, value) => {
            if (typeof value === 'object' && value.className) {
                const classConstructor = this.classMap[value.className];
                if (classConstructor) {
                    if (reconstruct) {
                        return new classConstructor(value, key);
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

        return (key, value) => classRestorer(key, value);
    }

}

export default Serializer
