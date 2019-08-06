
class Database {

    constructor() {
        this.baseURL = 'http://localhost:8080/';
    }

    loadModel() {
        const keys = ['sememes', 'nodes'];
        const fetchRequests = keys.map(key => {
            return fetch(this.baseURL + key)
            .then(res => res.ok ? res.text() : Promise.reject(new Error('GET ' + res.url + ' (' + res.status + ') ' + res.statusText)));
        });
        return Promise.all(fetchRequests).then(values => {
            return keys.reduce( (model, key, i) => {model[key] = values[i]; return model}, {});
        });
    }

    saveNode(id, json) {
        return fetch(this.baseURL + 'nodes/', {method: 'POST', body: json, headers: {'Content-type': 'application/json'}})
        .then(res => res.ok ? res.json() : Promise.reject(new Error('POST ' + res.url + ' (' + res.status + ') ' + res.statusText)));
    }
 
}

export default Database;
