#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import { WasmBuffer, WasmModule } from '../wasm.ts';
import { Command } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts';

const main = async () => {
  const { args, options } = await new Command()
    .name('howasm.ts')
    .version('1.0.0')
    .arguments('<filename:string>')
    .option('-l, --load', 'Load wasm')
    .option('-s, --store', 'Store wasm')
    .parse(Deno.args);

  const code = await Deno.readFile(args[0]);
  const wasmBuffer = new WasmBuffer(code);
  const wasmModule = new WasmModule();
  wasmModule.load(wasmBuffer);

  if (options.load) {
    console.log(JSON.stringify(wasmModule, null, '  '));
    return;
  }
  if (options.store) {
    const u8s = new Uint8Array(code.byteLength);
    const outBuffer = new WasmBuffer(u8s);
    wasmModule.store(outBuffer);
    Deno.writeFile('out.wasm', new Uint8Array(outBuffer.buffer));
  }
};

await main();
