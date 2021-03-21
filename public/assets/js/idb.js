// create a variable to hold db connection
let db;

// establish a connection to IndexedDB databse 
// called 'pizza_hunt' and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);

//this event will emit if the databse version changes
// (nonexistent to version 1, v1 to v2, etc)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called 'new_pizza',
    // set it to have an autoincrementing primary key of sorts
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

// upon successful request
request.onsuccess = function(event) {
    // when db is successfully created with its object store
    // (from onupgradeneeded or  simply established a connection)
    // save reference to db in global variable
    db = event.target.result;
    // check to see if app is oline, if yes run uploadPizza() function
    // to send all local data to api
    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
}

// function executed if new pizza is submitted with no internet connection
function saveRecord(record) {
    // open transaction with db w read & write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');
    // access the object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');
    // add record to your store with add method
    pizzaObjectStore.add(record);
}

// function to upload pizza once network comes back online
function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    // access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set you a variable 
    const getAll = pizzaObjectStore.getAll();
    

    // upon a successful .getAll execution run this function
    getAll.onsuccess = function() {
        console.log(getAll);
        // if there was data in indexedDb's store -> send it to the API server
        if(getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open another transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                // access the new_pizza objectStore
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                // clear all items in the store
                pizzaObjectStore.clear();

                alert('All saved pizzas have been submitted🍕')
            })
            .catch(err => console.log(err));
        }
    }
}

// listen for app coming back online
window.addEventListener('online', uploadPizza);