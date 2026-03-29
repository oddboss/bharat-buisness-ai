import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface APIConfig {
  apiUrl: string;
  headers: Record<string, string>;
  mapping: Record<string, string>;
}

export const connectCustomAPI = async (organizationId: string, config: APIConfig) => {
  const connectorData = {
    organizationId,
    type: 'api',
    name: `Custom API: ${config.apiUrl}`,
    status: 'connected',
    lastSynced: serverTimestamp(),
    config: {
      apiUrl: config.apiUrl,
      headers: config.headers,
      mapping: config.mapping
    }
  };

  const connectorsRef = collection(db, 'organizations', organizationId, 'data_connectors');
  return await addDoc(connectorsRef, connectorData);
};

export const syncAPIData = async (organizationId: string, connectorId: string) => {
  // Simulate sync
  console.log(`Syncing Custom API data for ${connectorId}...`);
  return new Promise((resolve) => setTimeout(resolve, 2000));
};
