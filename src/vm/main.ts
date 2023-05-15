import { Stack } from './src/stack.ts'
import { Ctrl } from '../asm/controls.ts'

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

const findLabel = (label: string): Action => {
  const line = shortcuts.get(label)
  if (!line) throw new Error(`Wanted label (${label}) not found`)
  return { action: 'jump', line }
}

const variableRegex = /^[a-z][0-9]{1,4}([a-zA-Z]+)$/

const extractPrimitiveValue = (value: string | null): string | number => {
  const number = parseInt(value ?? '')
  if (number.toString() === value) return number
  return `'${value}'`
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
    return (heap[value] as string | number) ?? -1
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
      //heap[lhs] = { '..': heap }
      //heap = heap[lhs] as Heap
      break
    }
    case Ctrl.StepOut: {
      //heap = heap['..'] as Heap
      if (callStack.length > 0) {
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
        console.log(stack.pop())
        break
      }
      if (lhs == 'read') {
        const value = extractPrimitiveValue(prompt('> '))
        if (debug) console.log('[LOG]: Read', value, typeof value)
        stack.push(value)
        break
      }
      callStack.push(line)
      return findLabel(`$FNCALL_${lhs}:`)
    }
    case Ctrl.Print: {
      console.log(lhs)
      break
    }
    case Ctrl.Jump: {
      return findLabel(lhs as string)
    }
    case Ctrl.JumpFalse: {
      if (stack.pop() == 0) return findLabel(lhs as string)
      break
    }
    // Maths
    case Ctrl.Add: {
      stack.push((lhs as number) + (rhs as number))
      break
    }
    case Ctrl.Sub: {
      stack.push((lhs as number) - (rhs as number))
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

  if (showStores) console.log('Labels:', shortcuts)

  for (let i = 0; i < program.length; ) {
    if (debug) console.log(JSON.stringify(stack))
    if (trace) console.log(`[${i + 1}]:\t`, program[i])
    if (interactive && trace) prompt('')

    //@ts-ignore
    const result = handle(i, ...program[i].split(/\s+/))
    if (result !== null && result.action === 'jump') {
      i = result.line
      continue
    }
    i++
  }
}

if (debug) console.log(JSON.stringify(stack, null, 2))
