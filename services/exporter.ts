import { supabaseAdmin } from '@/supabase/admin';
import { GroupBundleService } from './bundle';
import { StorachaService } from '@/lib/storacha';
import Papa from 'papaparse';
import { CID } from 'multiformats/cid';

export type ExportFormat = 'car' | 'json' | 'csv' | 'pdf';

export interface ExportHistoryEntry {
  id: string;
  groupId: string | null;
  userId: string;
  format: ExportFormat;
  status: 'pending' | 'completed' | 'failed';
  rootCid?: string;
  fileUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export class ExporterService {
  private bundleService: GroupBundleService;

  constructor(storacha: StorachaService) {
    this.bundleService = new GroupBundleService(storacha);
  }

  async logExport(userId: string, format: ExportFormat, groupId: string | null = null) {
    const { data, error } = await supabaseAdmin
      .from('export_history')
      .insert({
        user_id: userId,
        group_id: groupId,
        format,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateExportStatus(exportId: string, status: 'completed' | 'failed', options?: { rootCid?: string; fileUrl?: string; errorMessage?: string }) {
    await supabaseAdmin
      .from('export_history')
      .update({
        status,
        root_cid: options?.rootCid,
        file_url: options?.fileUrl,
        error_message: options?.errorMessage,
      })
      .eq('id', exportId);
  }

  async getGroupData(groupId: string) {
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) throw new Error('Group not found');

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
        .eq('group_id', groupId)
        .is('deleted_at', null),
      supabaseAdmin
        .from('settlements')
        .select('id, payer_id, payee_id, amount, currency, created_at, tx_hash, status')
        .eq('group_id', groupId)
    ]);

    return {
      group,
      members: membersRes.data || [],
      expenses: expensesRes.data || [],
      settlements: settlementsRes.data || [],
    };
  }

  async exportToJson(groupId: string) {
    const data = await this.getGroupData(groupId);
    return JSON.stringify(data, null, 2);
  }

  async exportToCsv(groupId: string) {
    const { expenses, settlements } = await this.getGroupData(groupId);

    const expenseRows = expenses.map((e: any) => ({
      id: e.id,
      description: e.description,
      amount: e.total_amount,
      currency: e.currency,
      date: e.created_at,
      paid_by: e.created_by,
      category: e.category,
      receipt_cid: e.media?.[0]?.cid || '',
    }));

    const settlementRows = settlements.map((s: any) => ({
      id: s.id,
      payer_id: s.payer_id,
      payee_id: s.payee_id,
      amount: s.amount,
      currency: s.currency,
      date: s.created_at,
      tx_hash: s.tx_hash || '',
      status: s.status,
    }));

    const expensesCsv = Papa.unparse(expenseRows);
    const settlementsCsv = Papa.unparse(settlementRows);

    return {
      expenses: expensesCsv,
      settlements: settlementsCsv,
    };
  }

  async exportToCar(groupId: string) {
    const rootCid = await this.bundleService.createBundle(groupId);
    return rootCid;
  }

  async exportAllGroups(userId: string) {
    const { data: groups, error } = await supabaseAdmin
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', userId);

    if (error) throw error;

    const allData = await Promise.all(
      groups.map(async (g: any) => {
        const data = await this.getGroupData(g.group_id);
        return {
          groupId: g.group_id,
          groupName: g.groups.name,
          data,
        };
      })
    );

    return JSON.stringify(allData, null, 2);
  }

  async getExportHistory(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('export_history')
      .select('*, groups(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}
