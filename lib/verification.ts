import { nexusService } from './nexus';

export type SettlementVerificationResult = {
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
  explorerUrl?: string;
  error?: string;
};

export async function verifySettlementTransaction(
  transactionHash: string
): Promise<SettlementVerificationResult> {
  try {
    const status = await nexusService.getTransferStatus(transactionHash);

    // Normalize status mapping from Nexus to SplitFare
    let mappedStatus: 'pending' | 'completed' | 'failed';
    switch (status.status.toUpperCase()) {
      case 'COMPLETED':
        mappedStatus = 'completed';
        break;
      case 'FAILED':
        mappedStatus = 'failed';
        break;
      default:
        mappedStatus = 'pending';
    }

    return {
      status: mappedStatus,
      txHash: transactionHash,
      explorerUrl: status.explorerUrl,
    };
  } catch (error: any) {
    console.error('Failed to verify settlement transaction:', error);
    return {
      status: 'pending',
      txHash: transactionHash,
      error: error.message || 'Unknown error during verification',
    };
  }
}
