const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/productModel');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventoryStats
} = require('./controllers/productController');

// Helper mock response object
const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

test.before(async () => {
  await connectDB();
  // Clear test collection
  await Product.deleteMany({ name: /^UnitTest_/ });
});

test.after(async () => {
  await Product.deleteMany({ name: /^UnitTest_/ });
  await mongoose.connection.close();
});

test('Unit Test: Product Model Schema Validation', async (t) => {
  await t.test('Should throw validation error if required fields are missing', async () => {
    const invalidProd = new Product({});
    let error;
    try {
      await invalidProd.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error);
    assert.ok(error.errors.name);
    assert.ok(error.errors.category);
    assert.ok(error.errors.price);
    assert.ok(error.errors.stock);
    assert.ok(error.errors.brand);
  });

  await t.test('Should throw error for negative price', async () => {
    const prod = new Product({
      name: 'UnitTest_Prod',
      brand: 'TestBrand',
      category: 'TestCategory',
      price: -50,
      stock: 10
    });
    let error;
    try {
      await prod.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error);
    assert.ok(error.errors.price);
  });

  await t.test('Should throw error for non-integer stock', async () => {
    const prod = new Product({
      name: 'UnitTest_Prod',
      brand: 'TestBrand',
      category: 'TestCategory',
      price: 100,
      stock: 10.5
    });
    let error;
    try {
      await prod.validate();
    } catch (err) {
      error = err;
    }
    assert.ok(error);
    assert.ok(error.errors.stock);
  });

  await t.test('Should set default empty strings for description and imageUrl', () => {
    const prod = new Product({
      name: 'UnitTest_Prod',
      brand: 'TestBrand',
      category: 'TestCategory',
      price: 100,
      stock: 5
    });
    assert.strictEqual(prod.description, '');
    assert.strictEqual(prod.imageUrl, '');
  });
});

test('Unit Test: Product Controller CRUD Functions', async (t) => {
  let createdProductId;

  await t.test('createProduct: Creates product successfully', async () => {
    const req = {
      body: {
        name: 'UnitTest_Wireless Headset',
        brand: 'TestAudio',
        category: 'Audio',
        price: 2999,
        stock: 20,
        description: 'Unit test description',
        imageUrl: 'https://example.com/image.jpg'
      }
    };
    const res = createMockRes();

    await createProduct(req, res);

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.name, 'UnitTest_Wireless Headset');
    assert.ok(res.body.data._id);
    createdProductId = res.body.data._id.toString();
  });

  await t.test('getProductById: Retrieves created product', async () => {
    const req = { params: { id: createdProductId } };
    const res = createMockRes();

    await getProductById(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data._id.toString(), createdProductId);
  });

  await t.test('getProductById: Handles invalid ObjectId format', async () => {
    const req = { params: { id: 'invalid_id_123' } };
    const res = createMockRes();

    await getProductById(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('updateProduct: Updates product fields', async () => {
    const req = {
      params: { id: createdProductId },
      body: { price: 2499, stock: 15 }
    };
    const res = createMockRes();

    await updateProduct(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.price, 2499);
    assert.strictEqual(res.body.data.stock, 15);
  });

  await t.test('getInventoryStats: Aggregates statistics accurately', async () => {
    const req = {};
    const res = createMockRes();

    await getInventoryStats(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.totalProducts >= 1);
    assert.ok(res.body.data.totalStock >= 15);
  });

  await t.test('deleteProduct: Removes created product', async () => {
    const req = { params: { id: createdProductId } };
    const res = createMockRes();

    await deleteProduct(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    // Confirm product no longer exists
    const findRes = createMockRes();
    await getProductById(req, findRes);
    assert.strictEqual(findRes.statusCode, 404);
  });
});
