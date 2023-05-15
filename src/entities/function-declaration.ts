import { Ctrl } from '../asm/controls'
import { LangEntity } from './base'
import { Block } from './block'

export type FunctionDeclarationParams = {
  name: string
  args: { name: string; type?: string }[]
  body: Block
}

export class FunctionDeclaration extends LangEntity<FunctionDeclarationParams> {
  constructor() {
    super({
      name: '',
      args: [],
      body: new Block(),
    })
  }

  toRpn() {
    return `// function ${this.params.name} (${this.params.args
      .map(({ name, type }) => `${type || 'unknown'} ${name}`)
      .join(', ')}) \n${this.params.body.toRpn()}\n// end function ${
      this.params.name
    }\n\n`
  }

  toASM(): string {
    return `// function ${this.params.name} (${this.params.args
      .map(({ name, type }) => `${type || 'unknown'} ${name}`)
      .join(', ')})
      ${Ctrl.DefineLabel} $FNCALL_${this.params.name}:
      ${this.params.args
        .map(({ name, type }) => `${Ctrl.Move} ${name} ${Ctrl.Pop}`)
        .join('\n')}
      //${Ctrl.StepIn} ${this.params.name}
      ${this.params.body.toASM()}
      // end function ${this.params.name}\n\n`
  }
}
