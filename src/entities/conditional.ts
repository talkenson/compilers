import { Ctrl } from '../asm/controls'
import { Command } from '../command'
import { LangEntity } from './base'
import { Block } from './block'
import { Expression } from './expression'

export type ConditionalParams = {
  condition: Expression
  trulyBody: Block
  falsyBody?: Block
}

export class Conditional extends LangEntity<ConditionalParams> {
  constructor() {
    super({
      condition: new Expression(),
      trulyBody: new Block(),
    })
  }

  toRpn() {
    return [
      this.params.condition.toRpn(),
      '\n',
      this.getLabel('Else'),
      Command.JumpElse,
      '\n',
      this.params.trulyBody.toRpn(),
      '\n',
      this.getLabel('Exit'),
      Command.Jump,
      '\n',
      this.getLabel('Else'),
      this.params.falsyBody?.toRpn() ?? '',
      '\n',
      this.getLabel('Exit'),
    ].join(' ')
  }

  toASM(): string {
    return [
      this.params.condition.toASM(),
      '\n',
      Ctrl.JumpFalse,
      this.getLabel('Else'),
      '\n',
      this.params.trulyBody.toASM(),
      '\n',
      Ctrl.Jump,
      this.getLabel('Exit'),
      '\n',
      Ctrl.DefineLabel,
      this.getLabel('Else'),
      '\n',
      this.params.falsyBody?.toASM() ?? '',
      '\n',
      Ctrl.DefineLabel,
      this.getLabel('Exit'),
    ].join(' ')
  }
}
