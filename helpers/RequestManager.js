export default class RequestManager {
    constructor() {
    }

    makeRequest(config) {
        console.log("\nthis is running")
        let url = config.url
        let method = config.method
        let headers = config.headers
        var options = {
            method: method,
            headers: headers
        }
        
        fetch(url, options)
            .then(response => response.json())
            .then(response => this.response = response)
            .catch(err => console.error(err))
    }
}