import { Buffer, StackBuffer } from './buffer.ts';
import { CodeNode, FuncTypeNode, ModuleNode } from './node.ts';

export class Instance {
  #module: ModuleNode;
  #exports: { [key: string]: any }; // モジュールの Export セクション から compile() で生成
  #context: Context; // モジュールの Function セクション から compile() で生成

  // 例: inst.exports.add(1, 2)
  get exports(): { [key: string]: any } {
    return this.#exports;
  }

  constructor(module: ModuleNode) {
    this.#module = module;
    this.#exports = {};
    this.#context = new Context();
  }

  compile() {
    const typeSection = this.#module.typeSection;
    const functionSection = this.#module.functionSection;
    const codeSection = this.#module.codeSection;
    functionSection?.typeIdxs.forEach((typeIdx, i) => {
      const func = new WasmFunction(typeSection!.funcTypes[typeIdx], codeSection!.codes[i]);
      this.#context.functions.push(func);
    });

    const exportSection = this.#module.exportSection;
    exportSection?.exports.forEach((exp) => {
      if (exp.exportDesc?.tag === 0x00) { // funcidx
        this.#exports[exp.name!] = (...args: number[]) => {
          const result = this.#context.functions[exp.exportDesc!.index!].invoke(this.#context, ...args);
          return result;
        };
      }
    });
  }
}

class LocalValue {
  #type: number;
  value: number;

  constructor(type: number, value: number) {
    this.#type = type;
    this.value = value;
  }
}

// シグネチャと処理内容
class WasmFunction {
  #funcType: FuncTypeNode;
  #code: CodeNode;

  constructor(funcType: FuncTypeNode, code: CodeNode) {
    this.#funcType = funcType;
    this.#code = code;
  }

  invoke(context: Context, ...args: number[]) {
    console.log(`args:${args}`);
    // 実際にはここでthis.#codeの持つwasm命令列を使用して処理を実行する
  }
}

// Instanceのコンテキスト
export class Context {
  stack: Buffer;
  functions: WasmFunction[];
  locals: LocalValue[];

  constructor() {
    this.stack = new StackBuffer({ buffer: new ArrayBuffer(1024) });
    this.functions = [];
    this.locals = [];
  }
}
