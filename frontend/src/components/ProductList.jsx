import React from 'react';

const ProductList = ({
  products,
  loading,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  sortBy,
  setSortBy,
  fetchProducts,
  startEdit,
  handleDelete,
  viewDetail,
  getStockClassAndText,
  currentPage,
  setCurrentPage,
  seedSampleData,
  seeding,
  clearAllData,
  pageSize = 7
}) => {
  // Filter products by search & category
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'stock-asc') return Number(a.stock) - Number(b.stock);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // Default sorting by creation order
  });

  // Pagination calculation
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="glass-card list-card">
      <div className="card-header flex-wrap">
        <h3><i className="fa-solid fa-boxes-stacked"></i> Products Inventory</h3>

        <div className="filter-toolbar">
          {/* Search Input */}
          <div className="search-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              id="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Lowest First</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button className="btn btn-secondary btn-icon-only" onClick={fetchProducts} title="Refresh Inventory">
            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
          </button>
          
          {/* Load Samples Button */}
          <button 
            className="btn btn-secondary btn-icon-only" 
            onClick={seedSampleData} 
            title="Load Sample Data"
            disabled={seeding}
          >
            <i className={`fa-solid fa-cloud-arrow-down ${seeding ? 'fa-bounce' : ''}`}></i>
          </button>

          {/* Delete All Button */}
          <button 
            className="btn btn-secondary btn-icon-only" 
            onClick={clearAllData} 
            title="Delete All Data"
            disabled={loading || products.length === 0}
            style={{ color: '#ef4444', borderColor: 'transparent' }}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-state">
                  <i className="fa-solid fa-spinner fa-spin"></i> Loading inventory from database...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  <i className="fa-solid fa-folder-open"></i>
                  {search || selectedCategory !== 'All'
                    ? 'No products match your search or filter criteria.'
                    : 'No products found. Add a new product or click "Load Samples".'}
                </td>
              </tr>
            ) : (
              paginated.map((product) => {
                const { className, text } = getStockClassAndText(product.stock);
                return (
                  <tr key={product._id}>
                    <td>
                      <div className="prod-info-cell" onClick={() => viewDetail(product)} style={{ cursor: 'pointer' }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="prod-thumb" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="prod-thumb-placeholder"><i className="fa-solid fa-box"></i></div>
                        )}
                        <div className="prod-info">
                          <span className="prod-name">{product.name}</span>
                          <span className="prod-brand">{product.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-category">{product.category}</span>
                    </td>
                    <td>
                      <span className="prod-price">₹{Number(product.price).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`stock-pill ${className}`}>{text}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => viewDetail(product)}
                          title="View Product Specs"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => startEdit(product)}
                          title="Edit Product"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(product._id)}
                          title="Delete Product"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sorted.length > 0 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sorted.length)} - {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} products
          </span>

          <div className="pagination-controls">
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <i className="fa-solid fa-chevron-left"></i> Previous
            </button>
            <span className="page-indicator">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
