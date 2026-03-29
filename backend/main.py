# FastAPI Backend for Live ERP Ingestion Pipeline
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
import pandas as pd
import io
import json
from typing import List, Dict
import xgboost as xgb
import joblib
# import psycopg2 # For real DB connection

app = FastAPI()

# 1. DATA INGESTION API
@app.post("/api/ingest")
async def ingest_data(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Step 1: Read file
    contents = await file.read()
    
    # Step 2: Parsing (Excel/CSV)
    if file.filename.endswith('.csv'):
        df = pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith(('.xls', '.xlsx')):
        df = pd.read_excel(io.BytesIO(contents))
    else:
        return {"error": "Unsupported file format"}

    # Step 3: AI-Assisted Schema Detection & Classification
    # In a real app, we'd send df.columns to an LLM for mapping
    domain = detect_domain(df)
    
    # Step 4: Database Mapping & Activation
    # background_tasks.add_task(process_and_store, df, domain)
    
    return {
        "status": "success",
        "filename": file.filename,
        "domain_detected": domain,
        "rows_count": len(df),
        "columns": list(df.columns)
    }

def detect_domain(df: pd.DataFrame) -> str:
    cols = [c.lower() for c in df.columns]
    if any(k in cols for k in ['sku', 'stock', 'warehouse']):
        return "inventory"
    if any(k in cols for k in ['revenue', 'order', 'customer']):
        return "sales"
    if any(k in cols for k in ['salary', 'employee', 'department']):
        return "hr"
    return "finance"

# 2. AI FORECASTING PIPELINE
def train_forecast_model(df: pd.DataFrame, target: str = 'revenue'):
    """
    Trains an XGBoost model for sales forecasting.
    Schema: date, revenue, marketing_spend, is_holiday
    """
    # 1. Preprocessing
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # 2. Feature Engineering
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['lag_1'] = df[target].shift(1)
    df['lag_7'] = df[target].shift(7)
    df['rolling_mean_7'] = df[target].rolling(window=7).mean()
    
    # Drop rows with NaN from shifts/rolling
    df = df.dropna()
    
    # 3. Features and Target
    features = ['marketing_spend', 'is_holiday', 'day_of_week', 'month', 'lag_1', 'lag_7', 'rolling_mean_7']
    X = df[features]
    y = df[target]
    
    # 4. Split (Time-series split)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # 5. Training
    model = xgb.XGBRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='reg:squarederror'
    )
    model.fit(X_train, y_train)
    
    # 6. Evaluation
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    import numpy as np
    
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    
    # 7. Save Model
    # joblib.dump(model, f'models/{target}_xgb_model.joblib')
    
    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "feature_importance": dict(zip(features, model.feature_importances_.tolist()))
    }

@app.get("/api/forecast/metrics")
async def get_forecast_metrics():
    # Mock metrics for the UI demo
    return {
        "mae": 12.45,
        "rmse": 18.92,
        "model": "XGBoost Regressor",
        "last_trained": "2026-03-13 14:00:00",
        "status": "Healthy"
    }

# 3. AUTOMATIC DASHBOARD GENERATOR LOGIC
@app.get("/api/dashboard/config")
async def get_dashboard_config(domain: str):
    # Returns ECharts configurations based on the detected domain
    configs = {
        "sales": [
            {"type": "line", "title": "Revenue Trends", "data_source": "sales_orders"},
            {"type": "bar", "title": "Top Products", "data_source": "sales_order_items"},
            {"type": "pie", "title": "Customer Distribution", "data_source": "sales_orders"}
        ],
        "inventory": [
            {"type": "gauge", "title": "Stock Health", "data_source": "inventory_products"},
            {"type": "treemap", "title": "Inventory Value", "data_source": "inventory_products"}
        ]
    }
    return configs.get(domain, [])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
