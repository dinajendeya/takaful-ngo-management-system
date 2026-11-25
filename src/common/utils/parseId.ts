export const parseId = (id: string) => {
  if (!/^\d+$/.test(id)) throw new Error("Invalid user ID");
  return BigInt(id);
};