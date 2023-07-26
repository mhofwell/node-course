const fs = require('fs');
const localPath = require('../util/path');
const path = require('path');

const p = path.join(localPath, 'data', 'products.json');

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, data) => {
        if (!err) {
            const products = JSON.parse(data);
            cb(products);
        } else {
            console.log(err);
            cb([]);
        }
    });
};

module.exports = class Product {
    constructor(title, imageURL, price, description) {
        this.title = title;
        this.imageURL = imageURL;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile((products) => {
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), (err) => {
                console.log(err);
            });
        });
    }

    // call this on the class its self and not an instantiated object.
    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
};
