const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/products.db');
    this.db = null;
    this.init();
  }

  /**
   * Initialize database connection and create tables
   */
  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        throw err;
      }
      console.log('Connected to SQLite database');
      this.createTables();
    });
  }

  /**
   * Create necessary tables
   */
  createTables() {
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco TEXT,
        preco_original TEXT,
        moeda TEXT DEFAULT 'BRL',
        valor_numerico REAL,
        imagem TEXT,
        url TEXT UNIQUE NOT NULL,
        descricao TEXT,
        site TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createProductsTable, (err) => {
      if (err) {
        console.error('Error creating products table:', err.message);
      } else {
        console.log('Products table ready');
      }
    });
  }

  /**
   * Get all products with pagination and search
   */
  getProducts({ offset = 0, limit = 10, search = '' } = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM products';
      let params = [];

      if (search) {
        query += ' WHERE nome LIKE ? OR descricao LIKE ?';
        params = [`%${search}%`, `%${search}%`];
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get product by ID
   */
  getProductById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get product by URL
   */
  getProductByUrl(url) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM products WHERE url = ?', [url], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Create new product
   */
  createProduct(product) {
    return new Promise((resolve, reject) => {
      const { nome, preco, preco_original, moeda, valor_numerico, imagem, url, descricao, site, created_at, updated_at } = product;
      
      this.db.run(
        'INSERT INTO products (nome, preco, preco_original, moeda, valor_numerico, imagem, url, descricao, site, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, preco, preco_original, moeda, valor_numerico, imagem, url, descricao, site, created_at, updated_at],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Return the created product
            this.db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  }

  /**
   * Update product
   */
  updateProduct(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      this.db.run(
        `UPDATE products SET ${setClause} WHERE id = ?`,
        [...values, id],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null); // No product found
          } else {
            // Return updated product
            this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
              if (err) {
                reject(err);
              } else {
                resolve(row);
              }
            });
          }
        }
      );
    });
  }

  /**
   * Delete product
   */
  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * Get total count of products
   */
  getProductCount(search = '') {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as count FROM products';
      let params = [];

      if (search) {
        query += ' WHERE nome LIKE ? OR descricao LIKE ?';
        params = [`%${search}%`, `%${search}%`];
      }

      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
