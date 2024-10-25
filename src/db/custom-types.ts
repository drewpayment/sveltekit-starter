import { customType } from 'drizzle-orm/pg-core';

export const bytea = customType<{ data: Uint8Array, notNull: false, default: false }>({
  dataType() {
    return 'bytea';
  },
  // toDriver(value) {
  //   let newVal = value;
  //   if (value.startsWith("0x")) {
  //     newVal = value.slice(2);
  //   }
  //   return Buffer.from(newVal, "hex");
  // },
  // fromDriver(value: any) {
  //   return value.toString("hex");
  // },
})