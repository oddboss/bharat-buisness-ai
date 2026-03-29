import json
import random
import uuid
from datetime import datetime, timedelta

def generate_inventory_data(count=500):
    categories = ['Electronics', 'Groceries', 'Clothing', 'Furniture', 'Stationery', 'Automotive']
    suppliers = ['Reliance Retail', 'Tata Consumer', 'Adani Wilmar', 'ITC Limited', 'Hindustan Unilever', 'Amazon India']
    warehouses = ['Mumbai-North', 'Delhi-South', 'Bangalore-East', 'Chennai-West', 'Kolkata-Central', 'Hyderabad-Hub']
    
    products = {
        'Electronics': ['Smartphone', 'Laptop', 'Headphones', 'Smartwatch', 'Tablet', 'Camera'],
        'Groceries': ['Rice', 'Cooking Oil', 'Sugar', 'Flour', 'Lentils', 'Spices'],
        'Clothing': ['T-Shirt', 'Jeans', 'Jacket', 'Socks', 'Dress', 'Sweater'],
        'Furniture': ['Chair', 'Table', 'Sofa', 'Bed', 'Desk', 'Cabinet'],
        'Stationery': ['Notebook', 'Pen', 'Pencil', 'Marker', 'Eraser', 'Stapler'],
        'Automotive': ['Engine Oil', 'Tires', 'Brake Pads', 'Battery', 'Wiper Blades', 'Air Filter']
    }

    inventory = []
    for i in range(count):
        category = random.choice(categories)
        product_name = random.choice(products[category])
        sku = f"{category[:3].upper()}-{product_name[:3].upper()}-{random.randint(1000, 9999)}"
        
        cost_price = random.randint(10, 5000)
        selling_price = int(cost_price * random.uniform(1.2, 2.0))
        stock_quantity = random.randint(0, 500)
        reorder_level = random.randint(10, 50)
        
        inventory.append({
            'id': str(uuid.uuid4()),
            'product_name': product_name,
            'sku': sku,
            'category': category,
            'stock_quantity': stock_quantity,
            'cost_price': cost_price,
            'selling_price': selling_price,
            'supplier': random.choice(suppliers),
            'warehouse': random.choice(warehouses),
            'reorder_level': reorder_level,
            'last_updated': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
        })
    return inventory

def generate_customer_data(count=100):
    names = ['Rahul Sharma', 'Anita Desai', 'Priya Singh', 'Amit Patel', 'Suresh Kumar', 'Meena Gupta', 'Vikram Rao', 'Sneha Reddy', 'Karan Malhotra', 'Deepika Iyer']
    statuses = ['Active', 'Inactive', 'Lead']
    
    customers = []
    for i in range(count):
        name = random.choice(names) + " " + str(i)
        email = f"{name.lower().replace(' ', '.')}@example.com"
        
        customers.append({
            'id': str(uuid.uuid4()),
            'customer_name': name,
            'email': email,
            'phone': f"+91 {random.randint(7000000000, 9999999999)}",
            'total_orders': random.randint(1, 50),
            'total_spent': random.randint(1000, 200000),
            'last_purchase': (datetime.now() - timedelta(days=random.randint(0, 180))).isoformat(),
            'status': random.choice(statuses)
        })
    return customers

def generate_sales_data(count=1000):
    products = ['Rice', 'Cooking Oil', 'Sugar', 'Smartphone', 'Laptop', 'T-Shirt', 'Chair']
    
    sales = []
    for i in range(count):
        date = (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat()
        product = random.choice(products)
        units_sold = random.randint(1, 20)
        price = random.randint(50, 5000)
        
        sales.append({
            'id': str(uuid.uuid4()),
            'date': date,
            'product': product,
            'units_sold': units_sold,
            'price': price,
            'revenue': units_sold * price
        })
    return sales

if __name__ == "__main__":
    inventory = generate_inventory_data(500)
    customers = generate_customer_data(100)
    sales = generate_sales_data(1000)
    
    with open('public/inventory_data.json', 'w') as f:
        json.dump(inventory, f, indent=2)
        
    with open('public/customer_data.json', 'w') as f:
        json.dump(customers, f, indent=2)
        
    with open('public/sales_data.json', 'w') as f:
        json.dump(sales, f, indent=2)
        
    print("Mock data generated successfully in public/ directory.")
