import { createAsciiTable } from './asm/utils'
import {
  Assignment,
  Block,
  Break,
  Call,
  Conditional,
  Const,
  Exit,
  Expression,
  FunctionDeclaration,
  Global,
  Id,
  LangEntity,
  Loop,
  Operator,
  Return,
  Switch,
  SwitchBlock,
  SwitchCase,
} from './entities'
import { Tracer } from './tracer'

const reset = () => {
  const tracer = new Tracer<LangEntity<any>>()
  const debug = console.log

  let asmdiv = document.getElementById('asmBlock')
  if (!asmdiv) {
    asmdiv = document.createElement('div')
    document.body.appendChild(asmdiv)
  }
  asmdiv.id = 'asmBlock'
  asmdiv.style.position = 'fixed'
  asmdiv.style.bottom = '0'
  asmdiv.style.right = '0'
  asmdiv.style.width = '30%'
  asmdiv.style.height = '50%'
  asmdiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  asmdiv.style.color = 'white'
  asmdiv.style.padding = '1rem'
  asmdiv.style.overflow = 'scroll'
  asmdiv.style.zIndex = '99'
  asmdiv.style.fontFamily = 'monospace'
  asmdiv.style.fontSize = '1.5rem'
  asmdiv.style.whiteSpace = 'pre-wrap'
  asmdiv.style.wordBreak = 'break-word'
  asmdiv.style.cursor = 'pointer'

  asmdiv.onclick = function () {
    document.execCommand('copy')
  }

  asmdiv.addEventListener('copy', function (event) {
    event.preventDefault()
    if (event.clipboardData) {
      event.clipboardData.setData('text/plain', asmdiv.innerText)
      console.log(event.clipboardData.getData('text'))
    }
  })

  const getAll = () => {
    console.warn(tracer.current)
    const asm = createAsciiTable(tracer.current.toASM())
    asmdiv.innerHTML = asm
    return `${tracer.current.toRpn()}\n\n\n${asm}`
  }

  const pushGlobal = () => tracer.push(new Global())
  const pushAssignment = () => tracer.push(new Assignment())
  const pushConst = (value: string, type: string) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression
    ) as Expression

    if (!expression) {
      console.error('No expression found while pushing', value)
      return
    }

    expression.addToken(new Const({ value, type }))
  }
  const pushExpression = () => {
    const isAlreadyParsingExpression = tracer.peek() instanceof Expression
    //tracer.findLast((entity) => entity instanceof Expression) !== undefined

    if (isAlreadyParsingExpression) {
      return
    }

    tracer.push(new Expression())
  }
  const pushUnaryOperator = (operator: string) => pushOperator(operator, true)
  const pushOperator = (operator: string, isUnary: boolean) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression
    ) as Expression

    if (!expression) {
      console.error('No expression found while pushing', operator)
      console.error('Current tracer', tracer.current)
      return
    }

    expression.addToken(operator as Operator, isUnary)
  }
  const pushCall = (call: Call) => {
    const expression = tracer.findLast(
      (entity) => entity instanceof Expression
    ) as Expression

    if (!expression) {
      console.error('No expression found while pushing call', call)
      return
    }

    expression.addToken(call)
  }
  const pushId = () => tracer.push(new Id())
  const pushBlock = () => tracer.push(new Block())
  const pushFunction = () => tracer.push(new FunctionDeclaration())
  const pushFnArg = (name: string, type?: string) =>
    tracer.current.params.args.push({ type, name })
  const pushReturn = () => tracer.push(new Return())
  const pushBreak = () => {
    const latest = tracer.findLast((entity) => entity instanceof Switch)

    if (!latest) {
      console.error('No switch found')
    }

    tracer.push(new Break({ entityId: latest?.id }))
  }
  const pushExit = () => {
    const latest = tracer.findLast((entity) => entity instanceof Loop)

    if (!latest) {
      console.error('No loop found')
    }

    tracer.push(new Exit({ entityId: latest?.id }))
  }
  const pushLoop = () => tracer.push(new Loop())
  const pushConditional = () => tracer.push(new Conditional())
  const pushSwitch = () => tracer.push(new Switch())
  const pushSwitchCase = (expr?: Expression) => {
    const existingCase = tracer.current

    if (existingCase instanceof SwitchCase) {
      if (!expr) {
        console.error('No expression found')
        return
      }

      existingCase.params.values.push(expr)
    } else if (expr) {
      tracer.push(new SwitchCase())
      tracer.current.set('values', [expr])
    } else {
      const latestSwitch = tracer.findLast(
        (entity) => entity instanceof Switch
      ) as Switch

      if (!latestSwitch) {
        console.error('No switch found')
        return
      }

      latestSwitch.set('default', new SwitchBlock())
    }
  }

  const endCase = () => {
    const latestSwitch = tracer.findLast(
      (entity) => entity instanceof Switch
    ) as Switch

    if (!latestSwitch) {
      console.error('No switch found')
      return
    }

    const block = tracer.pop()
    tracer.current.set('body', block)

    if (!latestSwitch.params.default) {
      const _case = tracer.pop()
      tracer.current.params.cases.push(_case)
    } else {
      latestSwitch.set('default', block)
    }
  }

  const pushSwitchBlock = () => tracer.push(new SwitchBlock())

  const handleBinaryExpr = () => {
    const children = tracer.rewind()

    const expr = tracer.pop()

    expr.set('tokens', [
      ...children
        .map((c) => (c instanceof Expression ? c.params.tokens : c))
        .flat(),
    ])

    if (!(expr instanceof Expression)) return

    if (tracer.current instanceof Expression) {
      tracer.current.set('tokens', [
        ...expr.params.tokens,
        ...tracer.current.params.tokens,
      ])
    } else {
      tracer.push(expr)
    }

    console.log(tracer.current)
  }

  const idToCall = () => {
    const id = tracer.pop()
    if (!(id instanceof Id)) return

    tracer.push(new Call({ name: id.params.name, args: [] }))
  }

  return {
    get stack() {
      return tracer.stack
    },

    waypoint: tracer.waypoint.bind(tracer),
    rewind: tracer.rewind.bind(tracer),
    push: tracer.push.bind(tracer),
    pop: tracer.pop.bind(tracer),

    set: (...any: Parameters<LangEntity['set']>) => tracer.current.set(...any),

    get current() {
      return tracer.current
    },

    pushGlobal,
    pushFunction,
    pushFnArg,
    pushBlock,
    pushAssignment,
    pushReturn,
    pushBreak,
    pushExit,
    pushLoop,
    pushConditional,
    pushSwitch,
    pushSwitchCase,
    pushSwitchBlock,

    pushConst,
    pushOperator,
    pushUnaryOperator,
    pushExpression,
    pushId,
    pushCall,

    endCase,
    handleBinaryExpr,
    idToCall,

    getAll,

    debug,
    reset,
  }
}

const $$ = reset()

declare global {
  interface Window {
    ignoreLastWord: boolean
    tracer: typeof $$
    $$: typeof $$
  }
}

window.ignoreLastWord = false
window.tracer = $$
window.$$ = $$
