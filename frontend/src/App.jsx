import React, { useState, useEffect } from 'react';
import {
  getAllProducts,
  getInventoryStats,
  createProduct,
  updateProduct,
  deleteProduct
} from './services/api';

import StatsOverview from './components/StatsOverview';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import ProductDetailModal from './components/ProductDetailModal';
import ToastContainer from './components/ToastContainer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [toasts, setToasts] = useState([]);
  const [logs, setLogs] = useState([]);

  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    inventoryValue: 0,
    outOfStock: 0
  });

  // Initial Load
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Log traffic in terminal emulator
  const logTraffic = (method, url, status, requestBody, responseBody) => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      request: requestBody || null,
      response: responseBody
    };
    setLogs((prev) => {
      const updated = [logEntry, ...prev];
      if (updated.length > 20) updated.pop();
      return updated;
    });
  };

  const fetchStats = async () => {
    try {
      const response = await getInventoryStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const url = `${API_URL}/products`;
    try {
      const response = await getAllProducts({ limit: 100 });
      logTraffic('GET', url, response.status, null, response.data);

      if (response.data.success) {
        const fetched = response.data.data;
        setProducts(fetched);

        // Derive unique categories
        if (response.data.categories && response.data.categories.length > 0) {
          setCategories(response.data.categories);
        } else {
          const cats = Array.from(new Set(fetched.map((p) => p.category).filter(Boolean)));
          setCategories(cats);
        }

        // Recalculate local stats if backend stats unavailable
        const totalProducts = fetched.length;
        const totalStock = fetched.reduce((acc, curr) => acc + Number(curr.stock || 0), 0);
        const inventoryValue = fetched.reduce(
          (acc, curr) => acc + Number(curr.price || 0) * Number(curr.stock || 0),
          0
        );
        const outOfStock = fetched.filter((p) => Number(p.stock) === 0).length;

        setStats({ totalProducts, totalStock, inventoryValue, outOfStock });
      } else {
        showToast(response.data.message || 'Failed to fetch products', 'error');
      }
    } catch (error) {
      logTraffic('GET', url, 500, null, { success: false, error: error.message });
      showToast('Failed to connect to backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.brand.trim() || !formData.category.trim() || formData.price === '' || formData.stock === '') {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);

    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Price cannot be negative', 'error');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      showToast('Stock must be a non-negative integer', 'error');
      return;
    }

    setSubmitting(true);
    const isEditing = !!formId;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/products/${formId}` : `${API_URL}/products`;

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      price: priceNum,
      stock: stockNum,
      description: formData.description ? formData.description.trim() : '',
      imageUrl: formData.imageUrl ? formData.imageUrl.trim() : ''
    };

    try {
      let response;
      if (isEditing) {
        response = await updateProduct(formId, payload);
      } else {
        response = await createProduct(payload);
      }

      logTraffic(method, url, response.status, payload, response.data);

      if (response.data.success) {
        showToast(response.data.message || `Product ${isEditing ? 'updated' : 'created'} successfully!`);
        resetForm();
        await fetchProducts();
        await fetchStats();
      } else {
        showToast(response.data.message || 'Error occurred while saving product', 'error');
      }
    } catch (error) {
      logTraffic(method, url, error.response?.status || 500, payload, {
        success: false,
        error: error.response?.data?.message || error.message
      });
      showToast(error.response?.data?.message || 'Failed to save product details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product) => {
    setFormId(product._id);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      price: product.price !== undefined ? product.price.toString() : '',
      stock: product.stock !== undefined ? product.stock.toString() : '',
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormId('');
    setFormData({
      name: '',
      brand: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const url = `${API_URL}/products/${id}`;
    try {
      const response = await deleteProduct(id);
      logTraffic('DELETE', url, response.status, null, response.data);
      if (response.data.success) {
        showToast('Product deleted successfully');
        await fetchProducts();
        await fetchStats();
      } else {
        showToast(response.data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      logTraffic('DELETE', url, error.response?.status || 500, null, {
        success: false,
        error: error.response?.data?.message || error.message
      });
      showToast('Failed to delete product from database', 'error');
    }
  };

  const seedSampleData = async () => {
    const sampleProducts = [
      {
        name: 'Logitech MX Master 3S',
        brand: 'Logitech',
        category: 'Electronics',
        price: 8995,
        stock: 25,
        description: 'Quiet Click ergonomic wireless mouse with 8K DPI track-on-glass sensor.',
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop'
      },
      {
        name: 'Keychron K2 Mechanical Keyboard',
        brand: 'Keychron',
        category: 'Electronics',
        price: 7499,
        stock: 14,
        description: '75% Layout tactile mechanical keyboard with Mac & Windows compatibility.',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop'
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        brand: 'Sony',
        category: 'Audio',
        price: 29990,
        stock: 8,
        description: 'Industry leading noise canceling headphones with Auto NC Optimizer.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'
      },
      {
        name: 'Dell UltraSharp 27" 4K Monitor',
        brand: 'Dell',
        category: 'Electronics',
        price: 45990,
        stock: 5,
        description: 'U2723QE IPS Black monitor with VESA DisplayHDR 400 and USB-C hub.',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop'
      },
      {
        name: 'Xiaomi Smart Band 8',
        brand: 'Xiaomi',
        category: 'Wearables',
        price: 2999,
        stock: 60,
        description: '1.62" AMOLED display fitness tracker with 150+ workout modes.',
        imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop'
      },
      {
        name: 'Anker 65W GaN Fast Charger',
        brand: 'Anker',
        category: 'Accessories',
        price: 2499,
        stock: 0,
        description: 'Ultra-compact 3-port fast wall charger for laptop, phone, and tablet.',
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop'
      }
    ];

    setSeeding(true);
    showToast('Loading sample items into database...', 'info');

    for (const item of sampleProducts) {
      try {
        const response = await createProduct(item);
        logTraffic('POST', `${API_URL}/products`, response.status, item, response.data);
      } catch (e) {
        console.error('Seed error:', e);
      }
    }

    await fetchProducts();
    await fetchStats();
    showToast('Mock data loaded successfully!');
    setSeeding(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme === 'light' ? 'Light' : 'Dark'} Theme`, 'info');
  };

  const getStockClassAndText = (stock) => {
    if (stock === 0) return { className: 'stock-empty', text: 'Out of Stock' };
    if (stock <= 5) return { className: 'stock-low', text: `Low Stock (${stock})` };
    return { className: 'stock-ok', text: `${stock} units` };
  };

  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="app-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-logo">
            <div className="logo-icon">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div className="logo-text">
              <h1>stock-it</h1>
            </div>
          </div>

          <div className="header-status">
            <button id="theme-toggle-btn" className="btn-theme-toggle" onClick={toggleTheme}>
              <i id="theme-icon" className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <StatsOverview stats={stats} />

        {/* Workspace */}
        <div className="workspace-grid">
          {/* Left Column: Product Form */}
          <ProductForm
            formId={formId}
            formData={formData}
            handleInputChange={handleInputChange}
            handleFormSubmit={handleFormSubmit}
            resetForm={resetForm}
            submitting={submitting}
            seedSampleData={seedSampleData}
            seeding={seeding}
          />

          {/* Right Column: List & Inspector */}
          <main className="content-container">
            <ProductList
              products={products}
              loading={loading}
              search={search}
              setSearch={setSearch}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              sortBy={sortBy}
              setSortBy={setSortBy}
              fetchProducts={fetchProducts}
              startEdit={startEdit}
              handleDelete={handleDelete}
              viewDetail={(p) => setSelectedProduct(p)}
              getStockClassAndText={getStockClassAndText}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </main>
        </div>
      </div>

      {/* Product Specification Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={(p) => startEdit(p)}
        />
      )}
    </>
  );
}

export default App;
