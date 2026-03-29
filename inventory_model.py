import json
import random
import datetime
import math
import sys

def create_sample_dataset(n_days=365):
    """
    Creates a sample dataset for inventory demand prediction using standard libraries.
    """
    data = []
    start_date = datetime.datetime(2023, 1, 1)
    
    for i in range(n_days):
        date = start_date + datetime.timedelta(days=i)
        
        # Base sales (Poisson-like simulation)
        base_sales = random.randint(15, 25)
        
        # Seasonality (higher demand in Nov, Dec)
        month = date.month
        multiplier = 1.5 if month in [11, 12] else 1.0
        historical_sales = int(base_sales * multiplier)
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'historical_sales': historical_sales,
            'stock_levels': random.randint(50, 200),
            'lead_times': random.randint(2, 10),
            'supplier_reliability': random.uniform(0.7, 1.0),
            'is_weekend': 1 if date.weekday() >= 5 else 0,
            'month': month,
            'day_of_year': date.timetuple().tm_yday,
            'day_index': i
        })
    
    # Add target demand (next day's sales)
    for i in range(len(data) - 1):
        data[i]['target_demand'] = data[i+1]['historical_sales']
    
    return data[:-1] # Remove last row as it has no target

def train_and_evaluate():
    # 1. Load and Prepare Data
    data = create_sample_dataset()
    
    # 2. Simple Linear Regression for Demand Prediction
    # Target = m1*sales + m2*is_weekend + b
    # For simplicity, let's just do a weighted average of recent sales and seasonality
    
    print("--- Simple Demand Model (Standard Library) ---")
    
    # Calculate simple metrics
    y_true = [d['target_demand'] for d in data]
    
    # Simple prediction: yesterday's sales * seasonality factor
    y_pred = []
    for d in data:
        # Very simple heuristic: 90% yesterday's sales + 10% random noise
        pred = d['historical_sales'] * 1.02 + random.uniform(-2, 2)
        y_pred.append(pred)
    
    # Evaluation
    mae = sum(abs(t - p) for t, p in zip(y_true, y_pred)) / len(y_true)
    mse = sum((t - p)**2 for t, p in zip(y_true, y_pred)) / len(y_true)
    rmse = math.sqrt(mse)
    
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    
    # 3. Output as JSON for potential integration
    result = {
        "status": "success",
        "metrics": {
            "mae": mae,
            "rmse": rmse
        },
        "model_type": "Heuristic-Baseline"
    }
    return result

if __name__ == "__main__":
    print("Starting Inventory Demand Prediction Pipeline...")
    res = train_and_evaluate()
    # print(json.dumps(res))
