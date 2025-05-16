import { Entity, BigInt, Bytes, BigDecimal } from "@graphprotocol/graph-ts";

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

export const ZERO_ADDRESS = Bytes.fromHexString("0x0000000000000000000000000000000000000000");
export const DEFAULT_BIGINT = BigInt.zero();
export const DEFAULT_BYTES = Bytes.empty();
export const DEFAULT_DECIMAL = BigDecimal.zero();
export const CONTRACT_CONFIG_ID = Bytes.fromUTF8("default");