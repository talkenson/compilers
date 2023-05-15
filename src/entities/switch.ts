import { Ctrl } from '../asm/controls'
import { Command } from '../command'
import { LangEntity } from './base'
import { Expression } from './expression'
import { Statement } from './statement'

export type SwitchBlockParams = {
  statements: Statement[]
}

export class SwitchBlock extends LangEntity<SwitchBlockParams> {
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

export type SwitchCaseParams = {
  values: Expression[]
  body: SwitchBlock
}

export class SwitchCase extends LangEntity<SwitchCaseParams> {
  constructor() {
    super({
      values: [],
      body: new SwitchBlock(),
    })
  }

  toRpn() {
    // is handled by Switch itself
    return ''
  }

  toASM(): string {
    // is handled by Switch itself
    return ''
  }
}

export type SwitchParams = {
  value: Expression
  cases: SwitchCase[]
  default?: SwitchBlock
}

export class Switch extends LangEntity<SwitchParams> {
  constructor() {
    super({
      value: new Expression(),
      cases: [],
    })
  }

  toRpn() {
    return [
      Command.StepIn,

      this.params.cases.flatMap((c) => [
        ...c.params.values.flatMap((v, i) => [
          this.params.value.toRpn(),
          v.toRpn(),
          '==',
          i !== 0 ? '||' : '',
        ]),
        '\n',
        c.getLabel('Skip'),
        Command.JumpElse,
        '\n',
        c.params.body.toRpn(),
        '\n',
        c.getLabel('Skip'),
      ]),

      this.params.default?.toRpn() ?? '',
      '\n',
      this.getLabel('Exit'),

      Command.StepOut,
    ]
      .flat()
      .join(' ')
  }

  toASM(): string {
    return [
      //Ctrl.StepIn,
      //this.asmId,

      this.params.cases.flatMap((c, j) => [
        ...c.params.values.flatMap((v, i) => [
          this.params.value.toASM(),
          '\n',
          v.toASM(),
          '\n',
          Ctrl.NotEqual,
          Ctrl.Pop,
          Ctrl.Pop,
          '\n',
          Ctrl.JumpFalse,
          c.getLabel('Case'),
        ]),
        '\n',
        Ctrl.Jump,
        c.getLabel('Skip'),
        '\n',
        Ctrl.DefineLabel,
        c.getLabel('Case'),
        '\n',
        c.params.body.toASM(),
        '\n',
        Ctrl.DefineLabel,
        c.getLabel('Skip'),
        '\n',
      ]),

      this.params.default?.toASM() ?? '',
      '\n',
      Ctrl.DefineLabel,
      this.getLabel('Exit'),

      //Ctrl.StepOut,
      //this.asmId,
    ]
      .flat()
      .join(' ')
  }
}
