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
            if (typeof value === 'object' && value.className) {
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

    reviver() {
        const classRestorer = (parent, key, value) => {

            function giveGrandParentCustody(element, ix) {
                if (typeof element === 'object' && element.className) {
                    Object.defineProperty(element, 'parent', {value: parent, enumerable: false});
                    Object.defineProperty(element, 'role', {value: key + '#' + ix, enumerable: false});
                }
                return element;
            }

            if (Array.isArray(value)) {
                return value.map(giveGrandParentCustody);
            } else if (typeof value === 'object' && value.className) {
                const classConstructor = this.classMap[value.className];
                if (classConstructor) {
                    if (! Array.isArray(parent) && key) {
                        // Establish outward (parent) relationships as well as inward (child) relationships
                        Object.defineProperty(value, 'parent', {value: parent, enumerable: false});
                        Object.defineProperty(value, 'role', {value: key, enumerable: false});
                    }
                    return Object.setPrototypeOf(value, classConstructor.prototype);
                } else {
                    throw new Error('Atttempt to de-serialize unmapped class: ' + value.className);
                }
            }
            return value;
        }

        return function(key, value) {
            const parent = this; // Bound to the object currently being restored
            return classRestorer(parent, key, value);
        }
    }

}

export default Serializer
