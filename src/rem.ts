#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import { WasmBuffer, WasmModule } from './wasm.ts';
import { I32RemSInstrNode } from './core/node.ts';

const code = await Deno.readFile('data/add.wasm');
const wasmBuffer = new WasmBuffer(code);
const wasmModule = new WasmModule();
wasmModule.load(wasmBuffer);

wasmModule.exportSection.exports[0].name = 'rem';
wasmModule.codeSection.codes[0].func!.expr!.instrs[2] = new I32RemSInstrNode(0x6f);

const u8s = new Uint8Array(code.byteLength);
const outBuffer = new WasmBuffer(u8s);
wasmModule.store(outBuffer);
Deno.writeFile('data/rem.wasm', new Uint8Array(outBuffer.buffer));
