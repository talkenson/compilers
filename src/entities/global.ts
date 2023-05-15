import { Ctrl } from '../asm/controls'
import { LangEntity } from './base'
import { FunctionDeclaration } from './function-declaration'

export type GlobalParams = {
  functions: FunctionDeclaration[]
}

export class Global extends LangEntity<GlobalParams> {
  constructor() {
    super({
      functions: [],
    })
  }

  toRpn() {
    return this.params.functions.map((f) => f.toRpn()).join('\n')
  }

  toASM(): string {
    return [
      ...this.params.functions.map((f) => f.toASM()),
      [Ctrl.DefineLabel, '$GLOBAL__program_end:'].join(' '),
    ].join('\n')
  }
}
