import { Entity, BigInt, Bytes } from "@graphprotocol/graph-ts";

export function loadOrCreateEntity<T extends Entity>(
  id: Bytes,
  loadFn: (id: Bytes) => T | null,
  createFn: (id: Bytes) => T
): T {
  let entity = loadFn(id);
  if (entity == null) {
    entity = createFn(id);
  }
  return entity;
}

export const DEFAULT_BIGINT = BigInt.zero();
export const DEFAULT_BYTES = Bytes.empty();
export const CONTRACT_CONFIG_ID = Bytes.fromUTF8("default");