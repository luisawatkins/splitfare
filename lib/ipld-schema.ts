import { CID } from 'multiformats/cid';

export interface IPLDMember {
  id: string;
  name: string;
  email?: string | null;
  walletAddress?: string | null;
}

export interface IPLDExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
  splits: {
    userId: string;
    amount: number;
  }[];
  category: string;
  receiptCid?: CID | null; // Link to the receipt file on IPFS
}

export interface IPLDSettlement {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  date: string;
  transactionHash?: string | null;
  manifestCid?: CID | null; // Link to the settlement manifest on IPFS
}

export interface IPLDGroupBundle {
  groupId: string;
  groupName: string;
  timestamp: number;
  members: IPLDMember[];
  expenses: IPLDExpense[];
  settlements: IPLDSettlement[];
  version: string;
}
