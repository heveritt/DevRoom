class Serializer {

    constructor(classMap=null) {
        this.classMap = classMap;
        this.serialize = this.serialize.bind(this);
        this.deserialize = this.deserialize.bind(this);
    }

    serialize(instance, genPath=false) {
        return JSON.stringify(instance, this.replacer(genPath));
    }

    deserialize(jsonString, reconstruct=true) {
        return JSON.parse(jsonString, this.reviver(reconstruct));
    }

    replacer(genPath) {
        const duplicateDetector = ( () => {
            const alreadySerialized = new WeakSet();
            const throwIfDuplicate = (value) => {
                if (typeof value === 'object') {
                    if (alreadySerialized.has(value)) {
                        throw new Error('Duplicate reference detected: ' + JSON.stringify(value));
                    } 
                    alreadySerialized.add(value);
                }
            }
            return throwIfDuplicate;
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
        const addPath = (value) =>
        {
            if (type(value) === 'class') {
                return Object.assign({path: value.getPath()}, value);
            } else {
                return value;
            }
        }

        return function(key, value) {
            duplicateDetector(value);
            return genPath ? addPath(value) : value;
        }
    }

    reviver(reconstruct) {
        const classRestorer = (value) => {
            if (type(value) === 'class') {
                const classConstructor = this.classMap[value.className];
                if (classConstructor) {
                    Object.setPrototypeOf(value, classConstructor.prototype);
                } else {
                    throw new Error('Atttempt to de-serialize unmapped class: ' + value.className);
                }
            }
            return value;
        }

        const parentRestorer = (parent, key, value) => {

            if (type(value) === 'array') {
                return value.map(function (element, ix) {
                    if (type(element) === 'class') {
                        element.setParent(parent, key, ix);
                    }
                    return element;
                });
            } else if (type(parent) !== 'array' && key && type(value) === 'class') {
                value.setParent(parent, key);
            }
            return value;
        }

        return function(key, value) {
            const parent = this; // Bound to the object currently being restored
            value = classRestorer(value);
            return reconstruct ? parentRestorer(parent, key, value): value;
        }
    }
}

function type(value) {
    if (Array.isArray(value)) {
        return 'array';
    } else if (typeof value === 'object' && value.className) {
        return 'class';
    } else {
        return typeof value;
    }
}

export default Serializer
