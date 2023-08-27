class axios {
    static get = (url, data) => {
        return this.request('GET', url, data)
    }
    static request(method, url, data) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open(method, url, true)
            xhr.send(data || null)
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    try {
                        xhr.status === 200 ? resolve({ data: JSON.parse(xhr.response) }) : reject(new Error('Request failed'))
                    } catch (error) {
                        resolve({ data: xhr.response })

                    }
                }
            }
        })
    }
}