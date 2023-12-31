export type I32 = 0x7F;
export const I32 = 0x7F;
export type I64 = 0x7e;
export type F32 = 0x7d;
export type F64 = 0x7c;
export type NumType = I32 | I64 | F32 | F64;
export type FuncRef = 0x70;
export type ExternRef = 0x6f;
export type RefType = FuncRef | ExternRef;
export type ValType = NumType | RefType;
export type TypeIdx = number;
export type S33 = number;
export type BlockType = 0x40 | ValType | S33;
export type LabelIdx = number;
export type FuncIdx = number;
