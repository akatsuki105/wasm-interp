import { Buffer } from "./buffer.ts";

type I32 = 0x7f;
type I64 = 0x7e;
type F32 = 0x7d;
type F64 = 0x7c;
type NumType = I32 | I64 | F32 | F64;
type FuncRef = 0x70;
type ExternRef = 0x6f;
type RefType = FuncRef | ExternRef;
type ValType = NumType | RefType;
type TypeIdx = number;

export class ModuleNode {
  magic?: Uint8Array;
  version?: Uint8Array;
  sections: SectionNode[] = [];

  load(buffer: Buffer) {
    this.magic = buffer.readBytes(4);
    this.version = buffer.readBytes(4);

    while (true) {
      if (buffer.eof) break;
      const section = this.loadSection(buffer);
      this.sections.push(section);
    }
  }

  loadSection(buffer: Buffer): SectionNode {
    const sectionId = buffer.readByte();
    const sectionSize = buffer.readU32();
    const sectionsBuffer = buffer.readBuffer(sectionSize);
    const section = SectionNode.create(sectionId);
    section.load(sectionsBuffer);
    return section;
  }
}

/*
  各セクションクラスの抽象親クラス
  いわゆる、 Abstract Factory パターン
*/
abstract class SectionNode {
  static create(sectionId: number): SectionNode {
    switch (sectionId) {
      case 1: {
        return new TypeSectionNode();
      }
      case 3: {
        return new FunctionSectionNode();
      }
      case 10: {
        return new CodeSectionNode();
      }
      default: {
        throw new Error(`invaild section id: ${sectionId}`);
      }
    }
  }

  abstract load(buffer: Buffer): void;
}

export class TypeSectionNode extends SectionNode {
  funcTypes: FuncTypeNode[] = [];

  load(buffer: Buffer) {
    this.funcTypes = buffer.readVec<FuncTypeNode>((): FuncTypeNode => {
      const functype = new FuncTypeNode();
      functype.load(buffer);
      return functype;
    });
  }
}

export class FuncTypeNode extends SectionNode {
  static get TAG() {
    return 0x60;
  }

  paramType = new ResultTypeNode();
  resultType = new ResultTypeNode();

  load(buffer: Buffer) {
    if (buffer.readByte() !== FuncTypeNode.TAG) {
      throw new Error("invalid functype");
    }

    this.paramType = new ResultTypeNode();
    this.paramType.load(buffer);
    this.resultType = new ResultTypeNode();
    this.resultType.load(buffer);
  }
}

export class ResultTypeNode extends SectionNode {
  valTypes: ValType[] = [];

  load(buffer: Buffer) {
    this.valTypes = buffer.readVec<ValType>((): ValType => {
      return buffer.readByte() as ValType;
    });
  }
}

export class FunctionSectionNode extends SectionNode {
  // typeidx は先ほど の Type セクションの何番目に位置するかを表す数値
  typeIdxs: TypeIdx[] = [];

  load(buffer: Buffer) {
    this.typeIdxs = buffer.readVec<TypeIdx>((): TypeIdx => {
      return buffer.readU32();
    });
  }
}

export class CodeSectionNode extends SectionNode {
  load(buffer: Buffer) {}
}
