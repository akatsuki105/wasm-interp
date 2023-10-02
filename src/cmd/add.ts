#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import { Command } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts';

const main = async () => {
  await new Command()
    .name('add.ts')
    .version('1.0.0')
    .parse(Deno.args);

  const wasmCode = await Deno.readFile('data/add.wasm');
  const wasmModule = new WebAssembly.Module(wasmCode);
  const wasmInstance = new WebAssembly.Instance(wasmModule);
  const add = wasmInstance.exports.add as (a: number, b: number) => number;
  console.log(add(40, 2));
};

await main();
