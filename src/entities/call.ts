import { LangEntity } from '.'
import { Const } from './const'
import { Expression } from './expression'
import { Id } from './id'

export type CallParams = {
  name: string
  args: (Expression | Const | Id)[]
}

export class Call extends LangEntity<CallParams> {
  constructor(
    params: CallParams = {
      name: '',
      args: [],
    }
  ) {
    super(params)
  }

  toRpn() {
    return `${this.params.args.map((arg) => arg.toRpn()).join(' ')} !Call_${
      this.params.name
    }!`
  }

  toASM(): string {
    console.log(this.params.args)
    return [
      ...[...this.params.args].reverse().map((arg, i) => `${arg.toASM()}`),
      `CALL ${this.params.name} ${this.params.args.length}`,
    ].join('\n')
  }
}
