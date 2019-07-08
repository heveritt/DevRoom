import Serializer from './serializer';

// Create 3 classes for testing - Chicken, Egg and Fox
class Chicken {
    constructor(props) {
        this.name = props.name;
        this.egg = props.egg;
    }

    isNamed() {
        return this.name;
    }
}

class Egg {
    constructor(props) {
        this.name = props.name;
        if (props.mother) this.mother = props.mother;
    }

    isNamed() {
        return this.name;
    }
}

class Fox {
    constructor(props) {
        this.name = props.name;
        this.prey = props.prey;
    }

    eats() {
        return props.prey;
    }
}

// Initialise a class map with the Chicken and Egg classes but not the Fox
const classMap = {};
classMap[Chicken.name] = Chicken;
classMap[Egg.name] = Egg;

// Initialise a serialiser & provide a 'roundTrip' alias for serializing and de-serializing
const serializer = new Serializer(classMap);
const roundTrip = (value) => serializer.deserialize(serializer.serialize(value));

// 3 class instances - gregg and hen are mapped, but basil isn't
const gregg = new Egg({name: 'Gregg'});
const hen = new Chicken({name: 'Henrietta', egg: gregg}); 
const basil = new Fox({name: 'Basil', prey: 'chickens!'});

// Chicken and egg with circular dependencies
const henson = new Chicken({name: 'Henson', egg: gregg}); 
const clegg = new Egg({name: 'Clegg', mother: henson});
henson.egg = clegg;

test('works for a string', () => {
    expect(roundTrip('Hello')).toBe('Hello');
});

test('works for a number', () => {
    expect(roundTrip(5.3)).toBe(5.3);
});

test('works for an object', () => {
    expect(roundTrip({name: 'John', age: 50})).toEqual({name: 'John', age: 50});
});

test('works for an array', () => {
    expect(roundTrip(['John', 50])).toEqual(['John', 50]);
});

test('works for a mapped class', () => {
    const eggBack = roundTrip(gregg);
    expect(eggBack).toBeInstanceOf(Egg);
    expect(eggBack.isNamed()).toBe('Gregg');
});

test('treats unmapped classes as objects', () => {
    const foxBack = roundTrip(basil);
    expect(foxBack).not.toBeInstanceOf(Fox);
    expect(foxBack).toEqual({name: 'Basil', prey: 'chickens!'});
    expect(foxBack.eats).toBeUndefined;
});

test('works for a hierarchy of mapped classes', () => {
    const henBack = roundTrip(hen);
    expect(henBack).toBeInstanceOf(Chicken);
    expect(henBack.isNamed()).toBe('Henrietta');
    expect(henBack.egg).toBeInstanceOf(Egg);
    expect(henBack.egg.isNamed()).toBe('Gregg');
});

test('does not treat an array of a string and an object as a class', () => {
    expect(roundTrip(['John', {age: 50}])).toEqual(['John', {age: 50}]);
});

test('throws on attempt to de-serialize an unmapped class', () => {
    const serialization = '{\"className\":\"Pitcairn\",\"year\":1790}';
    expect(() => {serializer.deserialize(serialization);}).toThrow();
});

test('throws on attempt to serialize classes with circular dependencies', () => {
    expect(() => {serializer.serialize(henson);}).toThrow();
});
