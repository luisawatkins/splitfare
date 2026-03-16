import * as dagCbor from '@ipld/dag-cbor';
import { CarWriter } from '@ipld/car';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import { IPLDGroupBundle } from './ipld-schema';

export async function createBundleCar(bundle: IPLDGroupBundle): Promise<{ rootCid: CID; carBuffer: Uint8Array }> {
  // 1. Encode the bundle using DAG-CBOR
  const bytes = dagCbor.encode(bundle);

  // 2. Calculate the CID of the root node
  const hash = await sha256.digest(bytes);
  const rootCid = CID.createV1(dagCbor.code, hash);

  // 3. Create a CAR file
  const { writer, out } = CarWriter.create([rootCid]);

  // Write the root node to the CAR
  writer.put({ cid: rootCid, bytes });
  writer.close();

  // Collect the output into a single buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of out) {
    chunks.push(chunk);
  }

  const carBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    carBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  return { rootCid, carBuffer };
}
