#!/usr/bin/env -S deno run --allow-read --allow-write --unstable

import { WasmBuffer, WasmModule } from "../wasm.ts";
import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

const main = async () => {
  const { args } = await new Command()
    .name("howasm.ts")
    .version("1.0.0")
    .arguments("<filename:string>")
    .parse(Deno.args);

  const code = await Deno.readFile(args[0]);
  const wasmBuffer = new WasmBuffer(code);
  const wasmModule = new WasmModule();
  wasmModule.load(wasmBuffer);
  console.log(JSON.stringify(wasmModule, null, "  "));
};

await main();
