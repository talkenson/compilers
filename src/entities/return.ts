import { Ctrl } from '../asm/controls'
import { LangEntity } from './base'
import { Expression } from './expression'

export type ReturnParams = {
  value: Expression
}

export class Return extends LangEntity<ReturnParams> {
  constructor() {
    super({
      value: new Expression(),
    })
  }

  toRpn() {
    return `// return ${this.params.value.toRpn()}`
  }

  toASM(): string {
    return [this.params.value.toASM(), `${Ctrl.Return} ${Ctrl.Pop}`].join('\n')
  }
}
