import { Buffer, StackBuffer } from './buffer.ts';
import { CodeNode, FuncTypeNode, InstrNode, ModuleNode } from './node.ts';

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
  #instructions: InstructionSeq;

  constructor(funcType: FuncTypeNode, code: CodeNode) {
    this.#funcType = funcType;
    this.#code = code;
    this.#instructions = new InstructionSeq(this.#code.func?.expr?.instrs);
  }

  invoke(context: Context, ...args: number[]) {
    // 1. 引数の読み込み
    const params = [...args];
    const paramTypes = this.#funcType.paramType.valTypes;
    // args 引数の数が命令に必要な引数の数よりも少なければ内部(wasm)から呼ばれていると判断してスタックから引数を取り出します。(外部=JavaScript)
    for (let i = 0; i < paramTypes.length - args.length; i++) {
      const param = context.stack.readI32(); // 本来であればvaltypeを確認(f64とかのときはreadI32じゃダメなので)
      params.push(param);
    }

    // 2. ローカル変数に引数を設定
    params.forEach((v, i) => {
      context.locals[i] = new LocalValue(paramTypes[i], v);
    });

    // 3. ローカル変数の設定
    const localses = this.#code.func?.localses;
    if (localses) {
      for (let i = 0; i < localses.length; i++) {
        const locals = localses[i];
        for (let j = 0; j < (locals.num || 0); j++) {
          context.locals.push(new LocalValue(locals.valType!, 0));
        }
      }
    }

    // 4. コードの実行
    let instr = this.#instructions.top;
    while (instr) {
      instr = instr.invoke(context);
    }

    // 5. 返り値の返却
    const resultTypes = this.#funcType.resultType.valTypes;
    if (resultTypes.length === 0) {
      return null;
    } else {
      return context.stack.readI32();
    }
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

class Instruction {
  parent?: Instruction;
  #next?: Instruction;

  constructor(parent?: Instruction) {
    this.parent = parent;
  }

  get next(): Instruction | undefined {
    if (this.#next) {
      return this.#next;
    } else {
      return this.parent?.next;
    }
  }

  set next(instr: Instruction | undefined) {
    this.#next = instr;
  }

  // InstrNodeに対応するInstructionを返す
  static create(node: InstrNode, parent?: Instruction): Instruction {
    return new Instruction();
  }

  // Context を受け取って自身の命令を実行した後で、次に実行する命令を返す
  invoke(context: Context): Instruction | undefined {
    throw new Error(`subclass responsibility; ${this.constructor.name}`);
  }
}

// 構造化命令などでひとかたまりの Instruction を扱う場合がたびたびあるため、 連続した Instruction を扱う InstructionSeq クラスを作る
class InstructionSeq extends Instruction {
  #instructions: Instruction[] = [];

  constructor(nodes: InstrNode[] = [], parent?: Instruction) {
    super();
    if (nodes.length === 0) return;
    let prev = Instruction.create(nodes[0], parent);
    this.#instructions.push(prev);

    for (let i = 1; i < nodes.length; i++) {
      prev.next = Instruction.create(nodes[i], parent);
      this.#instructions.push(prev);
      prev = prev.next;
    }
  }

  get top(): Instruction | undefined {
    return this.#instructions[0];
  }

  invoke(context: Context): Instruction | undefined {
    return this.top;
  }
}
