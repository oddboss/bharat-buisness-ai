import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'business_os.db');
console.log('Connecting to database at:', dbPath);
const db = new Database(dbPath);
console.log('Database connected successfully');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    product_name TEXT,
    sku TEXT,
    category TEXT,
    stock_quantity INTEGER,
    cost_price REAL,
    selling_price REAL,
    supplier TEXT,
    warehouse TEXT,
    business_unit TEXT DEFAULT 'Main Unit',
    reorder_level INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    email TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Mumbai',
    total_orders INTEGER,
    total_spent REAL,
    last_purchase TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category TEXT,
    amount REAL,
    description TEXT,
    expense_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    business_unit TEXT DEFAULT 'Main Unit'
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    product_id TEXT,
    quantity INTEGER,
    total_amount REAL,
    business_unit TEXT DEFAULT 'Main Unit',
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(product_id) REFERENCES inventory(id)
  );

  -- New Data Sources for BI
  CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    stock INTEGER
  );

  CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount REAL,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(order_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER,
    price REAL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    department TEXT,
    salary REAL,
    joining_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Active'
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    instructions TEXT,
    status TEXT DEFAULT 'active',
    capabilities TEXT, -- JSON string
    data_access TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Sample Data
const seedData = () => {
  const customerCount = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
  if (customerCount.count === 0) {
    console.log('Seeding sample data...');
    
    // Employees
    db.exec(`
      INSERT INTO employees (id, name, role, department, salary) VALUES
      ('emp_1', 'Rajesh Kumar', 'Sales Manager', 'Sales', 75000),
      ('emp_2', 'Sneha Patil', 'Inventory Head', 'Logistics', 65000),
      ('emp_3', 'Vikram Singh', 'Accountant', 'Finance', 60000);
    `);

    // Customers
    db.exec(`
      INSERT INTO customers (id, customer_name, email, phone, status) VALUES
      ('cust_1', 'Amit Sharma', 'amit@gmail.com', '919876543210', 'Active'),
      ('cust_2', 'Priya Singh', 'priya@gmail.com', '919876543211', 'Active'),
      ('cust_3', 'Rahul Verma', 'rahul@gmail.com', '919876543212', 'Active');
    `);

    // Products
    db.exec(`
      INSERT INTO products (name, category, price, stock) VALUES
      ('iPhone 15', 'Electronics', 80000, 50),
      ('Nike Shoes', 'Fashion', 5000, 100),
      ('Laptop HP', 'Electronics', 60000, 30),
      ('T-Shirt', 'Fashion', 1000, 200);
    `);

    // Orders
    db.exec(`
      INSERT INTO orders (customer_id, total_amount) VALUES
      ('cust_1', 85000),
      ('cust_2', 6000),
      ('cust_3', 61000),
      ('cust_1', 1000);
    `);

    // Order Items
    db.exec(`
      INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
      (1, 1, 1, 80000),
      (1, 2, 1, 5000),
      (2, 4, 6, 1000),
      (3, 3, 1, 60000),
      (4, 4, 1, 1000);
    `);
    
    console.log('Sample data seeded successfully.');
  }
};

seedData();

// Migration: Ensure business_unit column exists (in case tables were created before it was added)
try {
  const inventoryInfo = db.prepare("PRAGMA table_info(inventory)").all();
  const hasBusinessUnit = inventoryInfo.some((col: any) => col.name === 'business_unit');
  if (!hasBusinessUnit) {
    db.exec("ALTER TABLE inventory ADD COLUMN business_unit TEXT DEFAULT 'Main Unit'");
    console.log('Added business_unit column to inventory table');
  }

  const salesInfo = db.prepare("PRAGMA table_info(sales)").all();
  const hasBusinessUnitSales = salesInfo.some((col: any) => col.name === 'business_unit');
  if (!hasBusinessUnitSales) {
    db.exec("ALTER TABLE sales ADD COLUMN business_unit TEXT DEFAULT 'Main Unit'");
    console.log('Added business_unit column to sales table');
  }

  const customerInfo = db.prepare("PRAGMA table_info(customers)").all();
  const hasOutstandingBalance = customerInfo.some((col: any) => col.name === 'outstanding_balance');
  if (!hasOutstandingBalance) {
    db.exec("ALTER TABLE customers ADD COLUMN outstanding_balance REAL DEFAULT 0");
    console.log('Added outstanding_balance column to customers table');
  }
} catch (err) {
  console.error('Migration error:', err);
}

export default db;
