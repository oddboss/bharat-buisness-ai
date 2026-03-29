import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface TallyConfig {
  serverUrl: string;
  companyName: string;
}

export const connectTally = async (organizationId: string, config: TallyConfig) => {
  // In a real app, this would call a backend endpoint to verify the connection
  // and start the sync process.
  
  const connectorData = {
    organizationId,
    type: 'tally',
    name: `Tally: ${config.companyName}`,
    status: 'connected',
    lastSynced: serverTimestamp(),
    config: {
      serverUrl: config.serverUrl,
      companyName: config.companyName
    }
  };

  const connectorsRef = collection(db, 'organizations', organizationId, 'data_connectors');
  return await addDoc(connectorsRef, connectorData);
};

export const syncTallyData = async (organizationId: string, connectorId: string) => {
  try {
    const response = await fetch(`/api/connectors/sync?orgId=${organizationId}&connectorId=${connectorId}&type=tally`);
    return await response.json();
  } catch (err) {
    console.error('Tally sync error:', err);
    return { success: false, message: 'Failed to connect to Tally server' };
  }
};
