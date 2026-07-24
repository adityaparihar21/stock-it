import React from 'react';

const StatsOverview = ({ stats }) => {
  const formattedValue = (stats.inventoryValue || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon icon-blue">
          <i className="fa-solid fa-box"></i>
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Products</span>
          <h2>{stats.totalProducts || 0}</h2>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-green">
          <i className="fa-solid fa-indian-rupee-sign"></i>
        </div>
        <div className="stat-content">
          <span className="stat-label">Inventory Value</span>
          <h2>₹{formattedValue}</h2>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-purple">
          <i className="fa-solid fa-cubes"></i>
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Units</span>
          <h2>{stats.totalStock || 0}</h2>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon icon-yellow">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div className="stat-content">
          <span className="stat-label">Out of Stock</span>
          <h2>{stats.outOfStock || 0}</h2>
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;
