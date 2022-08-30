import Serializer from './serializer';

// Create 3 classes for testing - Chicken, Egg and Fox
class Chicken {
    constructor(props) {
        this.className = 'Chicken';
        this.name = props.name;
        this.egg = props.egg;
    }

    isNamed() {
        return this.name;
    }
}

class Egg {
    constructor(props) {
        this.className = 'Egg';
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

// Create a round trip that generates a path for each object serialized
const generatePath = (value) => serializer.deserialize(serializer.serialize(value, true));
const family = {surname: 'Smith', son: {forename: 'John', son: {forename: 'Philip'}}, daughters: [{forename: 'Anne'}, {forename: 'Ruth'}]};
const familyBack = generatePath(family);

test('generates a path for an object child', () => {
    expect(familyBack.son.path).toEqual('son');
});

test('generates a path for a child of a child', () => {
    expect(familyBack.son.son.path).toEqual('son.son');
});

test('generates a path for each object in an array', () => {
    expect(familyBack.daughters[0].path).toEqual('daughters#0');
    expect(familyBack.daughters[1].path).toEqual('daughters#1');
});

test('generates a path for the top level object', () => {
    expect(familyBack.path).toEqual('');
});

test('generates a path for an array of objects', () => {
    const misc = [{name: 'John'}, {name: 'Philip'}]
    const miscBack = generatePath(misc);
    expect(miscBack[0].path).toEqual('#0');
    expect(miscBack[1].path).toEqual('#1');
});

test('generates a path for a mixed array of objects', () => {
    const misc = [{name: 'John'}, 42, 'Smith', {name: 'Philip'}]
    const miscBack = generatePath(misc);
    expect(miscBack[0].path).toEqual('#0');
    expect(miscBack[3].path).toEqual('#3');
});
