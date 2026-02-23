import "dotenv/config";
import { supabaseAdmin } from "@supabase/admin";

async function clear() {
  await supabaseAdmin.from("shared_media").delete().neq("id", "");
  await supabaseAdmin.from("cid_anchors").delete().neq("id", "");
  await supabaseAdmin.from("settlements").delete().neq("id", "");
  await supabaseAdmin.from("expense_splits").delete().neq("id", "");
  await supabaseAdmin.from("expenses").delete().neq("id", "");
  await supabaseAdmin.from("group_members").delete().neq("id", "");
  await supabaseAdmin.from("groups").delete().neq("id", "");
  await supabaseAdmin.from("users").delete().neq("id", "");
}

async function seed() {
  await clear();

  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .insert([
      {
        email: "alice@example.com",
        name: "Alice",
        username: "alice",
        wallet_address: "0xalice",
        ens_name: "alice.splitfare.eth"
      },
      {
        email: "bob@example.com",
        name: "Bob",
        username: "bob",
        wallet_address: "0xbob",
        ens_name: "bob.splitfare.eth"
      },
      {
        email: "carol@example.com",
        name: "Carol",
        username: "carol",
        wallet_address: "0xcarol",
        ens_name: "carol.splitfare.eth"
      }
    ])
    .select();

  if (usersError) {
    console.error("Failed to seed users", usersError);
    process.exit(1);
  }

  const [alice, bob, carol] = users!;

  const { data: groups, error: groupsError } = await supabaseAdmin
    .from("groups")
    .insert({
      name: "NYC Trip",
      description: "Weekend in NYC",
      currency: "USDC",
      created_by: alice.id
    })
    .select();

  if (groupsError) {
    console.error("Failed to seed groups", groupsError);
    process.exit(1);
  }

  const group = groups![0];

  await supabaseAdmin.from("group_members").insert([
    {
      group_id: group.id,
      user_id: alice.id,
      role: "owner"
    },
    {
      group_id: group.id,
      user_id: bob.id,
      role: "member"
    },
    {
      group_id: group.id,
      user_id: carol.id,
      role: "member"
    }
  ]);

  const { data: expenses, error: expensesError } = await supabaseAdmin
    .from("expenses")
    .insert({
      group_id: group.id,
      created_by: alice.id,
      description: "SoHo dinner",
      total_amount: 132.4,
      currency: "USDC",
      category: "food",
      split_type: "equal"
    })
    .select();

  if (expensesError) {
    console.error("Failed to seed expenses", expensesError);
    process.exit(1);
  }

  const expense = expenses![0];

  const share = 132.4 / 3;

  await supabaseAdmin.from("expense_splits").insert([
    {
      expense_id: expense.id,
      user_id: alice.id,
      amount_owed: share
    },
    {
      expense_id: expense.id,
      user_id: bob.id,
      amount_owed: share
    },
    {
      expense_id: expense.id,
      user_id: carol.id,
      amount_owed: share
    }
  ]);

  const { data: settlements, error: settlementsError } = await supabaseAdmin
    .from("settlements")
    .insert({
      group_id: group.id,
      payer_id: bob.id,
      payee_id: alice.id,
      amount: share,
      currency: "USDC",
      status: "completed",
      tx_hash: "0xtxhash",
      chain: "base",
      manifest_cid: "bafy-sample-manifest-cid"
    })
    .select();

  if (settlementsError) {
    console.error("Failed to seed settlements", settlementsError);
    process.exit(1);
  }

  const settlement = settlements![0];

  await supabaseAdmin.from("cid_anchors").insert({
    group_id: group.id,
    root_cid: "bafy-root-cid",
    car_cid: "bafy-car-cid",
    anchor_tx_hash: "0xanchor"
  });

  await supabaseAdmin.from("shared_media").insert({
    group_id: group.id,
    expense_id: expense.id,
    uploader_id: alice.id,
    cid: "bafy-receipt-cid",
    media_type: "image",
    title: "Dinner receipt"
  });

  console.log("Seed completed successfully");
  console.log({ group, expense, settlement });
}

seed();
