import { Ctrl } from '../asm/controls'
import { Command } from '../command'
import { LangEntity } from './base'
import { Block } from './block'
import { Expression } from './expression'

export type LoopParams = {
  iterator: string
  from: Expression
  to: Expression
  step?: Expression
  body: Block
}

export class Loop extends LangEntity<LoopParams> {
  constructor() {
    super({
      iterator: '',
      from: new Expression(),
      to: new Expression(),
      body: new Block(),
    })
  }

  toRpn(): string {
    return [
      Command.StepIn,
      '\n',
      this.params.iterator,
      this.params.from.toRpn(),
      '=',
      '\n',
      this.getLabel('Condition'),
      this.params.iterator,
      this.params.to.toRpn(),
      '<=',
      '\n',
      this.getLabel('Exit'),
      Command.JumpElse,
      '\n',
      this.params.body.toRpn(),
      '\n',
      this.params.iterator,
      this.params.iterator,
      this.params.step?.toRpn() ?? '1',
      '+',
      '=',
      '\n',
      this.getLabel('Condition'),
      Command.Jump,
      '\n',
      this.getLabel('Exit'),
      Command.StepOut,
    ].join(' ')
  }

  toASM(): string {
    return [
      Ctrl.StepIn,
      this.asmId,
      '\n',
      this.params.from.toASM(),
      '\n',
      Ctrl.Move,
      this.params.iterator,
      Ctrl.Pop,
      '\n',
      Ctrl.DefineLabel,
      this.getLabel('Condition'),
      '\n',
      this.params.to.toASM(),
      '\n',
      Ctrl.LessOrEqual,
      this.params.iterator,
      Ctrl.Pop,
      '\n',
      Command.JumpElse,
      this.getLabel('Exit'),
      '\n',
      this.params.body.toASM(), // body
      '\n',
      Ctrl.Push,
      this.params.iterator,
      '\n',
      Ctrl.Add,
      Ctrl.Peek,
      this.params.step?.toASM() ?? '1',
      '\n',
      Ctrl.Move,
      this.params.iterator,
      Ctrl.Pop,
      '\n',
      Ctrl.Jump,
      this.getLabel('Condition'),
      '\n',
      Ctrl.DefineLabel,
      this.getLabel('Exit'),
      Ctrl.StepOut,
      this.asmId,
    ].join(' ')
  }
}
