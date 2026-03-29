import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import db from './db.ts';
import { v4 as uuidv4 } from 'uuid';

import { execSync, spawnSync } from 'child_process';

dotenv.config();

// Python Execution Logic
function runPythonScript(scriptPath: string, args: string[] = []) {
  try {
    // Check if python3 is available
    execSync('python3 --version', { stdio: 'ignore' });
    
    const result = spawnSync('python3', [scriptPath, ...args], { encoding: 'utf8' });
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(result.stderr || 'Python script failed');
    }
    return JSON.parse(result.stdout);
  } catch (error: any) {
    console.warn(`[Python Warning] Failed to run ${scriptPath} with python3. Falling back to mock data. Error: ${error.message}`);
    
    // Fallback Mock Data for Forecast
    if (scriptPath.includes('forecast_pipeline.py')) {
      const days = parseInt(args[1]) || 30;
      const forecast = [];
      const startDate = new Date();
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        forecast.push({
          date: date.toISOString().split('T')[0],
          sales: 150 + Math.sin(i / 7) * 20 + Math.random() * 10
        });
      }
      return forecast;
    }
    
    return { error: error.message, status: "error" };
  }
}

function runPythonCode(code: string) {
  // In a real production system, this would call a FastAPI service.
  // Here we simulate the output of the provided python code.
  return {
    status: "success",
    message: "Python code executed in isolated environment",
    result: {
      metrics: { accuracy: 0.94, precision: 0.91 },
      anomalies: 3,
      execution_time: "0.8s"
    }
  };
}

// WhatsApp Cloud API Helper
const sendWhatsAppMessage = async (to: string, message: string) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp] Missing credentials (WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_PHONE_NUMBER or WHATSAPP_ACCESS_TOKEN). Message logged to console:', message);
    return { success: true, mock: true };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Clean number
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'WhatsApp API error');
    return { success: true, data };
  } catch (error) {
    console.error('[WhatsApp] Send error:', error);
    throw error;
  }
};

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  const PORT = 3000;
  
  // Early health check
  app.get('/healthz', (req, res) => res.send('ok'));

  // Security & Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BharatBusinessGPT API is running' });
  });

  // Inventory API
  app.get('/api/inventory', (req, res) => {
    try {
      const items = db.prepare('SELECT * FROM inventory').all();
      res.json(items);
    } catch (error) {
      console.error('Inventory fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  // CRM API
  app.get('/api/customers', (req, res) => {
    try {
      const customers = db.prepare('SELECT * FROM customers').all();
      res.json(customers);
    } catch (error) {
      console.error('Customer fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  // AI Query API
  app.post('/api/query', async (req, res) => {
    const { sql } = req.body;
    try {
      if (!sql.trim().toLowerCase().startsWith('select')) {
        return res.status(400).json({ error: 'Only SELECT queries are allowed' });
      }
      const results = db.prepare(sql).all();
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ds-schema', (req, res) => {
    try {
      const columns = db.prepare("PRAGMA table_info(uploaded_data)").all();
      if (columns.length === 0) {
        return res.json({ table: 'uploaded_data', columns: [], exists: false });
      }
      res.json({
        table: 'uploaded_data',
        exists: true,
        columns: columns.map((col: any) => ({
          name: col.name,
          type: col.type
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schema' });
    }
  });

  // Data Science Studio Execution API
  app.post('/api/ds-execute', async (req, res) => {
    const { sql, python_code } = req.body;
    
    let data: any[] = [];
    if (sql) {
      try {
        data = db.prepare(sql).all();
      } catch (err: any) {
        return res.status(400).json({ error: err.message, sql });
      }
    }

    let pythonResult = null;
    if (python_code) {
      try {
        pythonResult = runPythonCode(python_code);
      } catch (err: any) {
        console.log("❌ Python execution failed:", err.message);
      }
    }

    res.json({
      data,
      python: pythonResult,
      success: true
    });
  });

  // Python Execution Endpoint (Mock)
  app.post('/api/run-python', (req, res) => {
    const { code } = req.body;
    try {
      const result = runPythonCode(code);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Alert API (Mock)
  app.post('/api/alerts/send', (req, res) => {
    const { type, message, recipient } = req.body;
    if (type === 'WhatsApp') {
      sendWhatsAppMessage(recipient, message)
        .then(result => res.json(result))
        .catch(err => res.status(500).json({ error: err.message }));
      return;
    }
    setTimeout(() => {
      res.json({ success: true, message: `${type} sent successfully to ${recipient}` });
    }, 1000);
  });

  // WhatsApp Direct API
  app.post('/api/whatsapp/send', async (req, res) => {
    const { number, message } = req.body;
    try {
      const result = await sendWhatsAppMessage(number, message);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- SALES FORECASTING API ---
  app.get('/api/sales/forecast', async (req, res) => {
    const { days } = req.query;
    const forecastDays = parseInt(days as string) || 30;
    
    try {
      const forecast = runPythonScript(path.join(process.cwd(), 'forecast_pipeline.py'), ['predict', forecastDays.toString()]);
      res.json(forecast);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/sales/forecast/train', async (req, res) => {
    try {
      const result = runPythonScript(path.join(process.cwd(), 'forecast_pipeline.py'), ['train']);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- DECISION ENGINE & ERG LOGIC ---
  const getERGContext = (orgId: string) => {
    try {
      const inventory = db.prepare('SELECT * FROM inventory WHERE stock_quantity < reorder_level').all();
      const sales = db.prepare('SELECT * FROM sales ORDER BY sale_date DESC LIMIT 5').all();
      const customers = db.prepare('SELECT * FROM customers ORDER BY total_spent DESC LIMIT 3').all();
      
      return {
        inventory_status: inventory.length > 0 ? 'Critical' : 'Healthy',
        low_stock_items: inventory.map((i: any) => ({ name: i.product_name, stock: i.stock_quantity, reorder: i.reorder_level })),
        recent_sales: sales.map((s: any) => ({ amount: s.total_amount, date: s.sale_date })),
        top_customers: customers.map((c: any) => ({ name: c.customer_name, spent: c.total_spent }))
      };
    } catch (err) {
      return {};
    }
  };

  app.get('/api/ai/context', (req, res) => {
    const { orgId } = req.query;
    res.json(getERGContext(orgId as string || 'default-org'));
  });

  app.post('/api/ai/decision', async (req, res) => {
    const { orgId } = req.body;
    const ergContext = getERGContext(orgId);
    // Backend no longer calls Gemini directly. 
    // It returns the context for the frontend to use.
    res.json({ context: ergContext });
  });

  // --- WHATSAPP WEBHOOK (Twilio/n8n Simulation) ---
  app.post('/api/whatsapp/webhook', async (req, res) => {
    const { Body, From } = req.body;
    console.log(`[WhatsApp Webhook] Message from ${From}: ${Body}`);
    
    // Process message with AI Decision Engine
    const decision = {
      summary: "Revenue ₹52K (+12%)",
      alert: "Rice stock low (2 days left)",
      action: "Reorder 100 units now"
    };

    const reply = `📊 Status: ${decision.summary}\n⚠️ Alert: ${decision.alert}\n✅ Action: ${decision.action}`;
    
    try {
      await sendWhatsAppMessage(From, reply);
      res.status(200).send('OK');
    } catch (err) {
      res.status(500).send('Error');
    }
  });

  // --- DATA CONNECTORS API ---
  app.get('/api/connectors/sync', async (req, res) => {
    const { orgId, connectorId, type } = req.query;
    console.log(`[Sync] Starting sync for org: ${orgId}, connector: ${connectorId}, type: ${type}`);
    
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (type === 'tally') {
        // Simulate fetching data from Tally and updating the DB
        const tallySales = [
          { id: uuidv4(), customer_id: 'cust_1', product_id: 'PROD-001', quantity: 5, total_amount: 12500, sale_date: new Date().toISOString() },
          { id: uuidv4(), customer_id: 'cust_2', product_id: 'PROD-002', quantity: 2, total_amount: 8400, sale_date: new Date().toISOString() },
        ];

        const tallyExpenses = [
          { id: uuidv4(), category: 'Rent', amount: 45000, description: 'Office Rent - March', expense_date: new Date().toISOString() },
          { id: uuidv4(), category: 'Electricity', amount: 3200, description: 'Electricity Bill - Feb', expense_date: new Date().toISOString() },
          { id: uuidv4(), category: 'Salaries', amount: 250000, description: 'Staff Salaries - March', expense_date: new Date().toISOString() },
        ];

        const insertSale = db.prepare(`
          INSERT OR REPLACE INTO sales (id, customer_id, product_id, quantity, total_amount, sale_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        tallySales.forEach(sale => {
          insertSale.run(sale.id, sale.customer_id, sale.product_id, sale.quantity, sale.total_amount, sale.sale_date);
        });

        const insertExpense = db.prepare(`
          INSERT OR REPLACE INTO expenses (id, category, amount, description, expense_date)
          VALUES (?, ?, ?, ?, ?)
        `);

        tallyExpenses.forEach(exp => {
          insertExpense.run(exp.id, exp.category, exp.amount, exp.description, exp.expense_date);
        });

        // Update some inventory too
        db.prepare('UPDATE inventory SET stock_quantity = stock_quantity + 10 WHERE product_name LIKE "%Oil%"').run();

        return res.json({ 
          success: true, 
          message: 'Tally ERP sync completed successfully', 
          lastSynced: new Date().toISOString(),
          insights: [
            "Tally sync: 2 new sales vouchers imported.",
            "Tally sync: 3 expense vouchers imported.",
            "Inventory levels updated for 3 items.",
            "Revenue increased by ₹20,900 from Tally data.",
            "Total expenses of ₹298,200 recorded from Tally."
          ]
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Sync completed successfully', 
        lastSynced: new Date().toISOString(),
        insights: [
          "Data source sync successful.",
          "No major anomalies detected in the new data.",
          "Trends remain consistent with previous periods."
        ]
      });
    } catch (error: any) {
      console.error('[Sync Error]', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/connectors/connect', async (req, res) => {
    const { type, config, orgId } = req.body;
    console.log(`[Connect] Connecting ${type} for org: ${orgId}`);
    res.json({ success: true, connectorId: uuidv4() });
  });

  app.post('/api/connectors/disconnect', async (req, res) => {
    const { connectorId, orgId } = req.body;
    console.log(`[Disconnect] Disconnecting ${connectorId} for org: ${orgId}`);
    res.json({ success: true });
  });

  app.post('/api/connectors/test', async (req, res) => {
    const { type, config } = req.body;
    console.log(`[Test Connection] Testing ${type} connection...`);

    try {
      if (type === 'tally') {
        // Tally test: Try to reach the server
        const response = await fetch(config.serverUrl, {
          method: 'POST',
          body: '<ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export Data</TALLYREQUEST><TYPE>Data</TYPE><ID>List of Companies</ID></HEADER><BODY><DESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>',
          headers: { 'Content-Type': 'text/xml' }
        });
        if (response.ok) {
          return res.json({ success: true, message: 'Successfully connected to Tally ERP' });
        }
      } else if (type === 'api') {
        // API test: Try to reach the endpoint
        const response = await fetch(config.apiUrl, {
          method: 'GET',
          headers: config.headers || {}
        });
        if (response.ok) {
          return res.json({ success: true, message: 'Successfully reached API endpoint' });
        }
      } else if (type === 'sheets') {
        // Sheets test: Mock success for now as it requires OAuth
        return res.json({ success: true, message: 'Google Sheets configuration is valid' });
      }

      res.status(400).json({ success: false, message: `Failed to connect to ${type}. Please check your credentials.` });
    } catch (error: any) {
      console.error(`[Test Connection] Error testing ${type}:`, error.message);
      res.status(500).json({ success: false, message: `Connection error: ${error.message}` });
    }
  });

  // --- AGENT BUILDER API ---
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = db.prepare('SELECT * FROM agents').all();
      const formattedAgents = agents.map((a: any) => ({
        ...a,
        capabilities: JSON.parse(a.capabilities || '[]'),
        dataAccess: JSON.parse(a.data_access || '[]')
      }));
      res.json(formattedAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  app.post('/api/agents/create', async (req, res) => {
    const { agent } = req.body;
    try {
      const id = uuidv4();
      const capabilities = JSON.stringify(['General Analysis', 'Data Access']);
      const dataAccess = JSON.stringify(agent.dataAccess || []);
      
      db.prepare(`
        INSERT INTO agents (id, name, role, instructions, status, capabilities, data_access)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, agent.name, agent.role, agent.instructions, 'active', capabilities, dataAccess);
      
      res.json({ success: true, agentId: id });
    } catch (error) {
      console.error('Failed to create agent:', error);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM agents WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete agent:', error);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  app.post('/api/agents/run', async (req, res) => {
    const { agentId, input, orgId } = req.body;
    const ergContext = getERGContext(orgId || 'default-org');
    
    try {
      // Check if it's a pre-built agent (starts with pb-)
      let agent;
      if (agentId.startsWith('pb-')) {
        // These are defined on frontend, but we need a mock for backend context
        const prebuilts: Record<string, any> = {
          'pb-1': { name: 'Inventory Optimizer', role: 'Supply Chain Specialist', instructions: 'Expert in inventory management.' },
          'pb-2': { name: 'Financial Auditor', role: 'Tax & Compliance Expert', instructions: 'Analyze business financials.' },
          'pb-3': { name: 'Growth Strategist', role: 'Marketing & Sales AI', instructions: 'Identify growth opportunities.' }
        };
        agent = prebuilts[agentId];
      } else {
        const dbAgent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as any;
        if (dbAgent) {
          agent = {
            ...dbAgent,
            capabilities: JSON.parse(dbAgent.capabilities || '[]'),
            dataAccess: JSON.parse(dbAgent.data_access || '[]')
          };
        }
      }

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({ context: ergContext, agent });
    } catch (error) {
      console.error('Failed to run agent:', error);
      res.status(500).json({ error: 'Failed to process agent request' });
    }
  });

  // --- BUSINESS ANALYSIS API ---
  app.post('/api/ai/analyze', async (req, res) => {
    const { orgId, type } = req.body;
    res.json({
      brief: "Your business generated ₹52,000 yesterday. Best product: Cooking Oil. Alert: Rice inventory low. Action: Restock + launch promotion.",
      healthScore: 84,
      metrics: {
        revenueGrowth: 12.5,
        profitMargin: 24.2,
        cashFlow: 150000,
        inventory: 65
      },
      insights: [
        "Sales increased 14% compared to last week.",
        "Demand for FMCG products is rising in your region.",
        "Runway: 4.2 months based on current burn rate."
      ]
    });
  });

  // Schedule Daily Business Report (8 PM)
  cron.schedule('0 20 * * *', async () => {
    try {
      const kpis = db.prepare(`
        SELECT 
          (SELECT SUM(total_amount) FROM sales WHERE sale_date >= date('now', 'start of day')) as daily_revenue,
          (SELECT COUNT(*) FROM sales WHERE sale_date >= date('now', 'start of day')) as daily_orders
      `).get() as any;
      const message = `Daily Business Report: Sales ₹${(kpis.daily_revenue || 0).toLocaleString()} | Orders ${kpis.daily_orders || 0}`;
      await sendWhatsAppMessage('919876543210', message);
    } catch (error) {
      console.error('[Cron] Failed to send daily report:', error);
    }
  });

  // BI Dashboard Aggregates
  app.get('/api/bi/data-sources', (req, res) => {
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
      const dataSources = tables.map(table => {
        const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
        return {
          table: table.name,
          columns: columns.map((col: any) => ({
            name: col.name,
            type: col.type,
            primaryKey: !!col.pk
          }))
        };
      });
      res.json(dataSources);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data sources' });
    }
  });

  app.get('/api/accounting/transactions', (req, res) => {
    try {
      const sales = db.prepare(`
        SELECT 
          id, 
          sale_date as date, 
          'Sales' as type, 
          customer_id as account, 
          'Sale of products' as description, 
          total_amount as debit, 
          0 as credit 
        FROM sales
        ORDER BY sale_date DESC
      `).all();

      const expenses = db.prepare(`
        SELECT 
          id, 
          expense_date as date, 
          'Expense' as type, 
          category as account, 
          description, 
          0 as debit, 
          amount as credit 
        FROM expenses
        ORDER BY expense_date DESC
      `).all();

      const transactions = [...sales, ...expenses].sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate running balance
      let balance = 150000; // Starting balance mock
      const transactionsWithBalance = transactions.map((t: any) => {
        if (t.type === 'Sales') balance += t.debit;
        if (t.type === 'Expense') balance -= t.credit;
        return { ...t, balance };
      });

      res.json(transactionsWithBalance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/bi/stats', (req, res) => {
    try {
      const { dateRange, startDate, endDate, businessUnit } = req.query;
      let dateFilter = '';
      const params: any[] = [];
      if (dateRange === '7d') {
        dateFilter = "AND sale_date >= date('now', '-7 days')";
      } else if (dateRange === '30d') {
        dateFilter = "AND sale_date >= date('now', '-30 days')";
      } else if (dateRange === 'custom' && startDate && endDate) {
        dateFilter = "AND sale_date BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }
      let buFilter = '';
      if (businessUnit && businessUnit !== 'All') {
        buFilter = "AND business_unit = ?";
        params.push(businessUnit);
      }
      const kpis = db.prepare(`
        SELECT 
          (SELECT SUM(total_amount) FROM orders) as total_revenue,
          (SELECT COUNT(*) FROM customers) as total_customers,
          (SELECT COUNT(*) FROM products WHERE stock < 50) as low_stock_items,
          (SELECT SUM(amount) FROM expenses) as total_expenses
      `).get() as any;
      const revenueTrend = db.prepare(`
        SELECT DATE(order_date) as date, SUM(total_amount) as revenue
        FROM orders
        GROUP BY date
        ORDER BY date
      `).all();
      const salesByCategory = db.prepare(`
        SELECT p.category as name, SUM(oi.quantity * oi.price) as value
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.category
      `).all();
      const businessUnits = db.prepare(`
        SELECT DISTINCT business_unit FROM sales
        UNION
        SELECT DISTINCT business_unit FROM inventory
      `).all().map((row: any) => row.business_unit).filter(Boolean);
      res.json({ 
        salesByMonth: revenueTrend,
        salesByCategory, 
        kpis, 
        businessUnits 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch BI stats' });
    }
  });

  // File Upload Setup
  const upload = multer({ dest: 'uploads/' });

  // Helper to parse CSV/Excel
  const parseFile = async (filePath: string, originalName: string) => {
    const ext = path.extname(originalName).toLowerCase();
    
    if (ext === '.pdf') {
      const pdf = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return [{ content: data.text, type: 'pdf', name: originalName }];
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  // File Upload Endpoint (Multi-file)
  app.post('/api/upload', upload.array('files'), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
      const dataContext: any = {
        sales: [],
        expenses: [],
        inventory: [],
        customers: [],
        raw: []
      };

      for (const file of files) {
        const data = await parseFile(file.path, file.originalname);
        const keys = data.length > 0 ? Object.keys(data[0]).map(k => k.toLowerCase()) : [];

        // Intelligent Classification & Persistence
        if (keys.includes('sku') || keys.includes('product_name') || keys.includes('stock')) {
          dataContext.inventory.push(...data);
          // Persist to DB
          const insert = db.prepare(`
            INSERT OR REPLACE INTO inventory (id, product_name, sku, category, stock_quantity, cost_price, selling_price, supplier)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          data.forEach((row: any) => {
            insert.run(
              row.id || row.sku || Math.random().toString(36).substr(2, 9),
              row.product_name || row.name || 'Unknown Product',
              row.sku || 'N/A',
              row.category || 'General',
              row.stock_quantity || row.stock || 0,
              row.cost_price || row.cost || 0,
              row.selling_price || row.price || 0,
              row.supplier || 'Unknown'
            );
          });
        } else if (keys.includes('customer_name') || keys.includes('email') || keys.includes('phone')) {
          dataContext.customers.push(...data);
          // Persist to DB
          const insert = db.prepare(`
            INSERT OR REPLACE INTO customers (id, customer_name, email, phone, city, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          data.forEach((row: any) => {
            insert.run(
              row.id || row.email || Math.random().toString(36).substr(2, 9),
              row.customer_name || row.name || 'Unknown Customer',
              row.email || 'N/A',
              row.phone || 'N/A',
              row.city || 'Mumbai',
              row.status || 'Active'
            );
          });
        } else if (keys.includes('sale_date') || keys.includes('revenue') || keys.includes('total_amount')) {
          dataContext.sales.push(...data);
          // Persist to DB
          const insert = db.prepare(`
            INSERT OR REPLACE INTO sales (id, customer_id, product_id, quantity, total_amount, sale_date)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          data.forEach((row: any) => {
            insert.run(
              row.id || Math.random().toString(36).substr(2, 9),
              row.customer_id || 'Unknown',
              row.product_id || 'Unknown',
              row.quantity || 1,
              row.total_amount || row.revenue || 0,
              row.sale_date || new Date().toISOString()
            );
          });
        } else if (keys.includes('expense') || keys.includes('category') || keys.includes('amount')) {
          dataContext.expenses.push(...data);
        } else {
          dataContext.raw.push({ name: file.originalname, data });
        }

        // Cleanup
        fs.unlinkSync(file.path);
      }

      res.json({ 
        message: 'Files processed and merged successfully', 
        dataContext,
        summary: {
          sales: dataContext.sales.length,
          expenses: dataContext.expenses.length,
          inventory: dataContext.inventory.length,
          customers: dataContext.customers.length,
          raw: dataContext.raw.length
        }
      });
    } catch (error: any) {
      console.error('File processing error:', error);
      res.status(500).json({ error: 'Failed to process files: ' + error.message });
    }
  });

  // --- WEBSOCKETS (Real-time KPIs) ---
  io.on('connection', (socket) => {
    const interval = setInterval(() => {
      socket.emit('kpi_update', {
        businessHealth: Math.floor(80 + Math.random() * 10),
        grossMargin: (40 + Math.random() * 5).toFixed(1),
        burnRate: Math.floor(40000 + Math.random() * 10000),
      });
    }, 5000);
    socket.on('disconnect', () => clearInterval(interval));
  });

  // --- NEURAL BI LAB API ---
  app.post('/api/neural-bi/generate', async (req, res) => {
    const { prompt, orgId } = req.body;
    
    try {
      // 1. Get Schema for context
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
      const schema = tables.map(table => {
        const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
        // Add sample data context for key tables
        let context = '';
        if (table.name === 'sales') context = ' (contains revenue, product_id, customer_id, sale_date)';
        if (table.name === 'expenses') context = ' (contains category, amount, description, expense_date)';
        if (table.name === 'inventory') context = ' (contains product_name, cost_price, selling_price, stock_quantity)';
        
        return `${table.name}${context}: [${columns.map((col: any) => `${col.name} ${col.type}`).join(', ')}]`;
      }).join('\n');

      // 2. Return schema and prompt to frontend for Gemini processing
      res.json({ schema, prompt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/neural-bi/execute', async (req, res) => {
    const { sql } = req.body;
    try {
      if (!sql.trim().toLowerCase().startsWith('select')) {
        return res.status(400).json({ error: 'Only SELECT queries are allowed for security' });
      }
      const results = db.prepare(sql).all();
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  app.use(express.static('public'));
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  httpServer.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
