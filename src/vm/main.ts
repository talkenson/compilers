import { Stack } from './src/stack.ts'
import { Ctrl } from '../asm/controls.ts'
import { quotesRegular } from '../asm/utils.ts'

type RecursiveRecord<Value> = {
  [key: string]: Value | RecursiveRecord<Value>
}

type Heap = RecursiveRecord<string | number>

const stack = new Stack<string | number>()
const heapStore: Heap = {}
const shortcuts = new Map<string, number>()
const callStack = new Stack<number>()

let heap = heapStore

type Action = { action: 'jump'; line: number }

const interactive =
  Deno.args.includes('-i') || Deno.args.includes('--interactive')

const trace = Deno.args.includes('-t') || Deno.args.includes('--trace')

const debug = Deno.args.includes('-d') || Deno.args.includes('--debug')

const showStores =
  Deno.args.includes('-s') || Deno.args.includes('--show-stores')

const extractPrimitiveValue = (value: string | null): string | number => {
  const number = parseInt(value ?? '')
  if (number.toString() === value) return number
  return `'${value}'`
}

const getPassedArgs = () => {
  let args = Deno.args.find((v) => v.startsWith('--args='))
  if (args === undefined) return []
  return args
    .split('--args=')[1]
    .split(quotesRegular)
    .map((v) => extractPrimitiveValue(v))
    .reverse()
}

const args = getPassedArgs()
// --args="5 20 '40hello'"

const isFalsy = (value: unknown) => {
  if (typeof value === 'string') {
    return value === ''
  }
  if (typeof value === 'number') {
    return value === 0
  }
  return true
}

const findLabel = (label: string): Action => {
  const line = shortcuts.get(label)
  if (line === undefined) throw new Error(`Wanted label (${label}) not found`)
  return { action: 'jump', line }
}

const variableRegex = /^[a-z][0-9]{1,4}([a-zA-Z]+)$/

const heapSearch = (currentHeap: Heap, variableName: string) => {
  let delta = 0
  while (currentHeap['..']) {
    if (currentHeap[variableName] !== undefined) {
      if (showStores) console.log('Found', variableName, 'in', delta, 'steps')
      return currentHeap[variableName] as string | number
    }
    currentHeap = currentHeap['..'] as Heap
    delta++
  }
  return null
  //throw new Error(`Variable ${variableName} not found`)
}

const extractValue = (value?: string): string | number | undefined => {
  if (value === undefined) return undefined
  if (value.startsWith("'")) {
    return value.slice(1, -1)
  }
  if (value.startsWith('`')) {
    return value.slice(1, -1)
  }
  if (shortcuts.get(`$FNCALL_${value}:`)) {
    return value
  }
  if (variableRegex.test(value)) {
    return heapSearch(heap, value) ?? -1
  }
  if (value === Ctrl.Pop) {
    return stack.pop() ?? -1
  }
  const number = parseInt(value)
  if (isNaN(number)) {
    return value
  }
  return number
}

const handle = (
  line: number,
  action: string,
  _lhs: string,
  _rhs: string
): Action | null => {
  const lhs = extractValue(_lhs)
  const rhs = extractValue(_rhs)
  switch (action) {
    case Ctrl.StepIn: {
      heap['deep'] = { '..': heap }
      heap = heap['deep']
      break
    }
    case Ctrl.StepOut: {
      if (callStack.length > 0) {
        heap = heap['..'] as Heap
        delete heap['deep']
        return { action: 'jump', line: callStack.pop()! + 1 }
      } else {
        return findLabel('$GLOBAL__program_end:')
      }
    }
    case Ctrl.Push: {
      if (debug) console.log('pushing', lhs)
      stack.push(lhs)
      break
    }
    case Ctrl.Move: {
      heap[_lhs] = rhs
      if (debug) console.log('moving', _lhs, rhs, 'result', heap[_lhs])
      break
    }
    case Ctrl.Call: {
      if (lhs == 'print') {
        console.log(
          stack
            .popMany(rhs as number)
            .reverse()
            .join(' ')
        )
        stack.push(0)
        break
      }
      if (lhs == 'read') {
        const value = extractPrimitiveValue(prompt('> '))
        if (debug) console.log('[LOG]: Read', value, typeof value)
        stack.push(value)
        break
      }
      if (lhs == 'env') {
        const value = Deno.env.get(stack.pop()! as string)
        if (debug) console.log('[LOG]: Env', value, typeof value)
        stack.push(value === undefined ? '' : value)
        break
      }
      if (lhs == 'getArg') {
        const argVal = args.pop()
        if (debug) console.log('[LOG]: getArg', argVal, typeof argVal)
        stack.push(argVal === undefined ? '' : argVal)
        break
      }
      callStack.push(line)
      return findLabel(`$FNCALL_${_lhs}:`)
    }
    case Ctrl.Jump: {
      return findLabel(lhs as string)
    }
    case Ctrl.JumpFalse: {
      if (isFalsy(stack.pop())) return findLabel(lhs as string)
      break
    }
    // Maths
    case Ctrl.Add: {
      stack.push((rhs as number) + (lhs as number))
      break
    }
    case Ctrl.Sub: {
      stack.push((rhs as number) - (lhs as number))
      break
    }
    case Ctrl.Mul: {
      stack.push((lhs as number) * (rhs as number))
      break
    }
    case Ctrl.Div: {
      stack.push((lhs as number) / (rhs as number))
      break
    }
    case Ctrl.LeftDiv: {
      stack.push((rhs as number) / (lhs as number))
      break
    }
    case Ctrl.Mod: {
      stack.push((rhs as number) % (lhs as number))
      break
    }
    case Ctrl.And: {
      stack.push((lhs as number) & (rhs as number))
      break
    }
    case Ctrl.Or: {
      stack.push((lhs as number) | (rhs as number))
      break
    }
    case Ctrl.Not: {
      stack.push(~(lhs as number))
      break
    }
    case Ctrl.Equal: {
      stack.push(lhs == rhs ? 1 : 0)
      break
    }
    case Ctrl.NotEqual: {
      stack.push(lhs != rhs ? 1 : 0)
      break
    }
    case Ctrl.Less: {
      stack.push(lhs > rhs ? 1 : 0)
      break
    }
    case Ctrl.LessOrEqual: {
      stack.push(lhs >= rhs ? 1 : 0)
      break
    }
    case Ctrl.Greater: {
      stack.push(lhs < rhs ? 1 : 0)
      break
    }
    case Ctrl.GreaterOrEqual: {
      stack.push(lhs <= rhs ? 1 : 0)
      break
    }
    case Ctrl.Negate: {
      stack.push(-(lhs as number))
      break
    }
    case Ctrl.NegateBool: {
      stack.push(lhs == 0 ? 1 : 0)
      break
    }
    case Ctrl.Return: {
      stack.push(lhs)
      break
    }
    case Ctrl.DefineLabel: {
      // Does nothing
      break
    }
  }
  return null
}

if (import.meta.main) {
  const program = Deno.readTextFileSync(Deno.args[0])
    .split('\n')
    .filter((v) => v.length > 2 && !v.startsWith('//'))

  for (let i = 0; i < program.length; i++) {
    if (program[i].startsWith(Ctrl.DefineLabel)) {
      shortcuts.set(program[i].split(/\s+/)[1], i)
    }
  }

  // console.debug('Parameters will be automatically passed')
  // console.debug(JSON.stringify(args))

  if (showStores) console.log('Labels:', shortcuts)

  const entryPoint = shortcuts.get('$__ENTRYPOINT:')

  if (entryPoint === undefined) {
    throw new Error('No Entrypoint (function named `main`)')
  }

  for (let i = entryPoint; i < program.length; ) {
    if (debug) console.log(JSON.stringify(stack))
    if (trace) console.log(`[${i + 1}]:\t`, program[i])
    if (interactive && trace) prompt('')

    const result = handle(
      i,
      //@ts-ignore
      ...program[i].split(quotesRegular)
    )
    if (result !== null && result.action === 'jump') {
      i = result.line
      continue
    }
    i++
  }
}

if (debug) console.log(JSON.stringify(stack, null, 2))
