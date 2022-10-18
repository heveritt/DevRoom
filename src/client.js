import Serializer from './serializer';
const { serialize } = new Serializer();

function put(location, json) {
    const options = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: json
    };
    fetch(location, options)
        .then((res) => res.json())
        .then((data) => console.log(data.message));
}

const client = {
    save: function save(nodule) {
        put("/nodes/" + nodule.id, serialize(nodule));
    },

    generate: function generate(nodule) {
        put("/generated/" + nodule.id, serialize(nodule));
    }
}

export default client;