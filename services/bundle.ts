import { supabaseAdmin } from '@/supabase/admin';
import { CID } from 'multiformats/cid';
import { createBundleCar } from '@/lib/car-builder';
import { IPLDGroupBundle, IPLDMember, IPLDExpense, IPLDSettlement } from '@/lib/ipld-schema';
import { StorachaService } from '@/lib/storacha';

export class GroupBundleService {
  constructor(private storacha: StorachaService) {}

  async createBundle(groupId: string): Promise<string> {
    // 1. Fetch group details
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      throw new Error(`Group not found: ${groupError?.message}`);
    }

    // 2. Fetch all data in parallel
    const [membersRes, expensesRes, settlementsRes] = await Promise.all([
      supabaseAdmin
        .from('group_members')
        .select('users(id, name, email, wallet_address)')
        .eq('group_id', groupId),
      supabaseAdmin
        .from('expenses')
        .select(`
          id,
          description,
          total_amount,
          currency,
          created_at,
          created_by,
          category,
          splits:expense_splits(user_id, amount_owed),
          media:shared_media(cid)
        `)
        .eq('group_id', groupId),
      supabaseAdmin
        .from('settlements')
        .select('id, payer_id, payee_id, amount, currency, created_at, tx_hash, manifest_cid')
        .eq('group_id', groupId)
        .eq('status', 'completed')
    ]);

    if (membersRes.error) throw new Error(`Failed to fetch members: ${membersRes.error.message}`);
    if (expensesRes.error) throw new Error(`Failed to fetch expenses: ${expensesRes.error.message}`);
    if (settlementsRes.error) throw new Error(`Failed to fetch settlements: ${settlementsRes.error.message}`);

    const members = membersRes.data;
    const expenses = expensesRes.data;
    const settlements = settlementsRes.data;

    const ipldMembers: IPLDMember[] = members.map((m: any) => ({
      id: m.users.id,
      name: m.users.name,
      email: m.users.email ?? null,
      walletAddress: m.users.wallet_address ?? null,
    }));

    const ipldExpenses: IPLDExpense[] = expenses.map((e: any) => ({
      id: e.id,
      description: e.description,
      amount: Number(e.total_amount),
      currency: e.currency,
      date: e.created_at,
      paidBy: e.created_by,
      splits: e.splits.map((s: any) => ({
        userId: s.user_id,
        amount: Number(s.amount_owed),
      })),
      category: e.category,
      receiptCid: e.media && e.media[0] ? CID.parse(e.media[0].cid) : null,
    }));

    const ipldSettlements: IPLDSettlement[] = settlements.map((s: any) => ({
      id: s.id,
      payerId: s.payer_id,
      payeeId: s.payee_id,
      amount: Number(s.amount),
      currency: s.currency,
      date: s.created_at,
      transactionHash: s.tx_hash ?? null,
      manifestCid: s.manifest_cid ? CID.parse(s.manifest_cid) : null,
    }));

    // 5. Construct the bundle
    const bundle: IPLDGroupBundle = {
      groupId,
      groupName: group.name,
      timestamp: Math.max(
        ...ipldExpenses.map(e => new Date(e.date).getTime()),
        ...ipldSettlements.map(s => new Date(s.date).getTime()),
        0
      ),
      members: ipldMembers.sort((a, b) => a.id.localeCompare(b.id)),
      expenses: ipldExpenses.sort((a, b) => a.id.localeCompare(b.id)),
      settlements: ipldSettlements.sort((a, b) => a.id.localeCompare(b.id)),
      version: '1.0.0',
    };

    // 6. Create the CAR file
    const { rootCid, carBuffer } = await createBundleCar(bundle);

    // 7. Upload to Storacha
    // Use any cast to avoid weird TypeScript BlobPart issues in some environments
    const carBlob = new Blob([carBuffer as any], { type: 'application/vnd.ipld.car' });
    await this.storacha.uploadCar(carBlob);

    return rootCid.toString();
  }
}
