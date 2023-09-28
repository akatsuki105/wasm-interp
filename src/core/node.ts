import { Buffer } from "./buffer.ts";

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
      default: {
        throw new Error(`invaild section id: ${sectionId}`);
      }
    }
  }

  abstract load(buffer: Buffer): void;
}
