const express = require('express');

const { getAddProduct, postAddProduct } = require('../controllers/admin');
const { getProducts } = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', getAddProduct);
router.get('/products', getProducts);

// /admin/add-product => POST
router.post('/add-product', postAddProduct);

module.exports = router;
