import React from 'react';

const ProductDetailModal = ({ product, onClose, onEdit }) => {
  if (!product) return null;

  const stockClass = product.stock === 0 ? 'stock-empty' : product.stock <= 5 ? 'stock-low' : 'stock-ok';
  const stockText = product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Low Stock (${product.stock})` : `In Stock (${product.stock} units)`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fa-solid fa-box-open"></i> Product Details</h3>
          <button className="btn-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-media">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="product-modal-img" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="product-modal-placeholder">
                <i className="fa-solid fa-cube"></i>
              </div>
            )}
          </div>

          <div className="detail-content">
            <div className="detail-title-block">
              <h2>{product.name}</h2>
              <span className="badge-category">{product.category}</span>
            </div>

            <p className="detail-brand"><i className="fa-solid fa-copyright"></i> Brand: <strong>{product.brand}</strong></p>

            <div className="detail-pricing-stock">
              <div className="price-tag">
                <span className="label">Price:</span>
                <span className="amount">₹{Number(product.price).toFixed(2)}</span>
              </div>
              <div className="stock-tag">
                <span className="label">Availability:</span>
                <span className={`stock-pill ${stockClass}`}>{stockText}</span>
              </div>
            </div>

            {product.description && (
              <div className="detail-description">
                <h4>Description:</h4>
                <p>{product.description}</p>
              </div>
            )}

            <div className="detail-meta">
              <div className="meta-item">
                <span>Product ID:</span> <code>{product._id}</code>
              </div>
              {product.createdAt && (
                <div className="meta-item">
                  <span>Created At:</span> {new Date(product.createdAt).toLocaleString()}
                </div>
              )}
              {product.updatedAt && (
                <div className="meta-item">
                  <span>Last Updated:</span> {new Date(product.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
          >
            <i className="fa-solid fa-pen-to-square"></i> Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
