import { LangEntity } from './base'
import { Statement } from './statement'

export type BlockParams = {
  statements: Statement[]
}

export class Block extends LangEntity<BlockParams> {
  constructor() {
    super({
      statements: [],
    })
  }

  toRpn() {
    return this.params.statements.map((s) => s.toRpn()).join('\n')
  }

  toASM(): string {
    return this.params.statements.map((s) => s.toASM()).join('\n')
  }
}
