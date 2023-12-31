const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename),
    'data',
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, price) {
        fs.readFile(p, (err, data) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(data);
            }
            const index = cart.products.findIndex(
                (product) => product.id === id
            );
            const existingProduct = cart.products[index];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[index] = updatedProduct;
            } else {
                updatedProduct = {
                    id: id,
                    qty: 1,
                };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + price;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }
};
