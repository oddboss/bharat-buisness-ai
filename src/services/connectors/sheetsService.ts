import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface SheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  mapping: {
    revenue: string;
    expenses: string;
    date: string;
  };
}

export const connectGoogleSheets = async (organizationId: string, config: SheetsConfig) => {
  const connectorData = {
    organizationId,
    type: 'sheets',
    name: `Google Sheets: ${config.sheetName}`,
    status: 'connected',
    lastSynced: serverTimestamp(),
    config: {
      spreadsheetId: config.spreadsheetId,
      sheetName: config.sheetName,
      mapping: config.mapping
    }
  };

  const connectorsRef = collection(db, 'organizations', organizationId, 'data_connectors');
  return await addDoc(connectorsRef, connectorData);
};

export const syncSheetsData = async (organizationId: string, connectorId: string) => {
  // Simulate sync
  console.log(`Syncing Google Sheets data for ${connectorId}...`);
  return new Promise((resolve) => setTimeout(resolve, 2000));
};
