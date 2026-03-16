import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
  },
  amount: {
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    borderTop: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
  receiptImage: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
});

interface GroupData {
  group: any;
  members: any[];
  expenses: any[];
  settlements: any[];
}

const GroupReport = ({ data }: { data: GroupData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.group.name}</Text>
        <Text style={styles.subtitle}>
          Financial Report | Generated on {new Date().toLocaleDateString()}
        </Text>
        <Text style={styles.subtitle}>{data.group.description || 'No description'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Name</Text>
            <Text style={styles.tableCell}>Email</Text>
            <Text style={styles.tableCell}>Wallet Address</Text>
          </View>
          {data.members.map((m: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{m.users.name}</Text>
              <Text style={styles.tableCell}>{m.users.email || 'N/A'}</Text>
              <Text style={styles.tableCell}>{m.users.wallet_address || 'N/A'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Paid By</Text>
            <Text style={[styles.tableCell, styles.amount]}>Amount</Text>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Receipt</Text>
          </View>
          {data.expenses.map((e: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{e.description}</Text>
              <Text style={styles.tableCell}>
                {data.members.find((m: any) => m.users.id === e.created_by)?.users.name || e.created_by}
              </Text>
              <Text style={[styles.tableCell, styles.amount]}>
                {e.total_amount} {e.currency}
              </Text>
              <Text style={styles.tableCell}>{new Date(e.created_at).toLocaleDateString()}</Text>
              <View style={styles.tableCell}>
                {e.media?.[0]?.cid ? (
                  <Image
                    style={styles.receiptImage}
                    src={`https://w3s.link/ipfs/${e.media[0].cid}`}
                  />
                ) : (
                  <Text>No receipt</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settlements</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Payer</Text>
            <Text style={styles.tableCell}>Payee</Text>
            <Text style={[styles.tableCell, styles.amount]}>Amount</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Date</Text>
          </View>
          {data.settlements.map((s: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {data.members.find((m: any) => m.users.id === s.payer_id)?.users.name || s.payer_id}
              </Text>
              <Text style={styles.tableCell}>
                {data.members.find((m: any) => m.users.id === s.payee_id)?.users.name || s.payee_id}
              </Text>
              <Text style={[styles.tableCell, styles.amount]}>
                {s.amount} {s.currency}
              </Text>
              <Text style={styles.tableCell}>{s.status}</Text>
              <Text style={styles.tableCell}>{new Date(s.created_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        This report was generated by SplitFare. All data is verified on-chain.
      </Text>
    </Page>
  </Document>
);

export async function generatePdfStream(data: GroupData) {
  return await renderToStream(<GroupReport data={data} />);
}
