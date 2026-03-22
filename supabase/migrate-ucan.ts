import "dotenv/config";
import { supabaseAdmin } from "../supabase/admin";
import { createServerStorachaService } from "../lib/storacha-server";
import { createDelegation } from "../lib/delegation";

async function migrate() {
  console.log("Starting UCAN migration...");

  const { data: groups, error: groupError } = await supabaseAdmin
    .from("groups")
    .select("*")
    .is("space_did", null);

  if (groupError) {
    console.error("Error fetching groups:", groupError);
    return;
  }

  console.log(`Found ${groups.length} groups to migrate.`);

  const storacha = await createServerStorachaService();

  for (const group of groups) {
    try {
      console.log(`Migrating group: ${group.name} (${group.id})`);
      const spaceName = `splitfare-group-${group.id}`;
      const space = await storacha.createSpace(spaceName) as any;
      const spaceDid = typeof space?.did === 'function' ? space.did() : space?.did || space?.toString();

      if (spaceDid) {
        await supabaseAdmin
          .from("groups")
          .update({ space_did: spaceDid })
          .eq("id", group.id);
        
        console.log(`Created space for group ${group.id}: ${spaceDid}`);

        const { data: members, error: memberError } = await supabaseAdmin
          .from("group_members")
          .select("*, users(wallet_address)")
          .eq("group_id", group.id);

        if (memberError) {
          console.error(`Error fetching members for group ${group.id}:`, memberError);
          continue;
        }

        for (const member of members) {
          const walletAddress = (member.users as any)?.wallet_address;
          if (walletAddress) {
            try {
              const delegation = await createDelegation(
                storacha,
                spaceDid,
                `did:pkh:eip155:1:${walletAddress}`,
                member.role as any
              );

              await supabaseAdmin
                .from("group_members")
                .update({ ucan_proof: delegation })
                .eq("id", member.id);
              
              console.log(`Delegated access to member ${member.user_id} (${member.role})`);
            } catch (delError) {
              console.error(`Failed to delegate to member ${member.user_id}:`, delError);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to migrate group ${group.id}:`, err);
    }
  }

  const { data: groupsWithSpace, error: spaceGroupError } = await supabaseAdmin
    .from("groups")
    .select("id, space_did")
    .not("space_did", "is", null);

  if (spaceGroupError) {
    console.error("Error fetching groups with space:", spaceGroupError);
  } else {
    for (const group of groupsWithSpace) {
      const { data: members, error: memberError } = await supabaseAdmin
        .from("group_members")
        .select("*, users(wallet_address)")
        .eq("group_id", group.id)
        .is("ucan_proof", null);

      if (memberError) continue;

      for (const member of members) {
        const walletAddress = (member.users as any)?.wallet_address;
        if (walletAddress && group.space_did) {
          try {
            const delegation = await createDelegation(
              storacha,
              group.space_did,
              `did:pkh:eip155:1:${walletAddress}`,
              member.role as any
            );

            await supabaseAdmin
              .from("group_members")
              .update({ ucan_proof: delegation })
              .eq("id", member.id);
            
            console.log(`Delegated access to existing member ${member.user_id} in group ${group.id}`);
          } catch (delError) {
            console.error(`Failed to delegate to member ${member.user_id}:`, delError);
          }
        }
      }
    }
  }

  console.log("UCAN migration complete.");
}

migrate().catch(console.error);
