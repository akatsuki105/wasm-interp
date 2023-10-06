# wasm-interp

[作って学ぶWebAssembly TypeScriptとDenoで作るWasmランタイム](https://techbookfest.org/product/5689941050785792) の勉強レポジトリです。

本と同様に[ユークリッドの互除法](data/gcd.wat)が実行できます。

```ts
  // Deno REPL
  const wasm = await import("./src/wasm.ts");
  const code = await Deno.readFile("data/gcd.wasm"); // wat2wasm data/gcd.wat -o data/gcd.wasm
  const wasmBuffer = new wasm.WasmBuffer(code);
  const wasmModule = new wasm.WasmModule();
  wasmModule.load(wasmBuffer);
  const instance = wasmModule.instantiate();
  
  instance.exports.gcd(42, 12); // -> 6
  instance.exports.gcd(42, 28); // -> 14
```

## 参考

- [作って学ぶWebAssembly　ーTypeScriptとDenoで作るWasmランタイムー](https://techbookfest.org/product/5689941050785792)
- [technohippy/makewasm](https://github.com/technohippy/makewasm)
