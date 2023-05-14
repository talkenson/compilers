import { LangEntity } from './base'
import { Expression } from './expression'

export type AssignmentParams = {
  name: string
  value: Expression
}

export class Assignment extends LangEntity<AssignmentParams> {
  constructor() {
    super({
      name: '',
      value: new Expression(),
    })
  }

  toRpn() {
    return `${this.params.name} ${this.params.value.toRpn()} =`
  }

  toASM(): string {
    return [this.params.value.toASM(), `MOV ${this.params.name} POP`].join('\n')
  }
}
