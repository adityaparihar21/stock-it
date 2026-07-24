import React from 'react';

const ProductForm = ({
  formId,
  formData,
  handleInputChange,
  handleFormSubmit,
  resetForm,
  submitting,
  seedSampleData,
  seeding
}) => {
  return (
    <aside className="form-container">
      <div className="glass-card form-card">
        <div className="card-header">
          <h3>
            <i className={`fa-solid ${formId ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
            {formId ? ' Edit Product' : ' Add New Product'}
          </h3>
          {formId && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>

        <form id="product-form" onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="product-name">Product Name *</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-tag input-icon"></i>
              <input
                type="text"
                id="product-name"
                name="name"
                placeholder="e.g. Wireless Mouse"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-brand">Brand *</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-copyright input-icon"></i>
              <input
                type="text"
                id="product-brand"
                name="brand"
                placeholder="e.g. Logitech"
                value={formData.brand}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-category">Category *</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-layer-group input-icon"></i>
              <input
                type="text"
                id="product-category"
                name="category"
                placeholder="e.g. Electronics"
                value={formData.category}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-price">Price (₹) *</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-indian-rupee-sign input-icon"></i>
                <input
                  type="number"
                  id="product-price"
                  name="price"
                  placeholder="799"
                  min="0"
                  step="any"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="product-stock">Stock Quantity *</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-warehouse input-icon"></i>
                <input
                  type="number"
                  id="product-stock"
                  name="stock"
                  placeholder="50"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-image">Image URL (Optional)</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-image input-icon"></i>
              <input
                type="url"
                id="product-image"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="product-desc">Description (Optional)</label>
            <div className="input-wrapper textarea-wrapper">
              <textarea
                id="product-desc"
                name="description"
                rows="3"
                placeholder="Short item description, features, warranty..."
                value={formData.description || ''}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            <i className={`fa-solid ${submitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            {submitting ? ' Saving...' : formId ? ' Update Product' : ' Save Product'}
          </button>
        </form>
      </div>

    </aside>
  );
};

export default ProductForm;
