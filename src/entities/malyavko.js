//Этот пример работоспособен только в нисходящем парсере, восходящий выполняет действия не так, как хотелось бы
//пример формирования ПФЗ, преобразования ПФЗ в псевдокод, некоторых элементов семантического анализа и интерпретации псевдокода
//вот возможный пример правильного текста для тестирования:
//int f( real a ){ char c; if( a > 3.14 ) c=3x201; else c='%'; return c; }
//а вот пример текста с семантическими ошибками
//int f( real a ){ char c; if( a > 3.14) x=3x201; else c=-a; }

var ignoreLastWord
var startForRun //позиция в массиве tracer.history, с которой надо начинать интерпретацию
var curType = '' // для временного хранения типа данных в множественных объявлениях
var opStk = [] //постфиксная форма записи транслируемой программы
var operatorCnt = 0 //счетчик управляющих операторов, для которых в ПФЗ нужно формировать уникальные метки
var ctlStk = [] //стек номеров управляющих операторов для формирования уникальных меток
var onStk = [] //стек номеров веток переключателей для формирования уникальных меток
var operandStk = [] //стек имен операндов для формирования операторов псевдокода
var userSignTbl = ['return', 'defVar'] //таблица имен функций как знаков операций, объявляемых пользователем
var idTbl = ['return', 'defVar'] //таблица идентификаторов
var valTbl = [0, 0] //параллельная таблица текущих значений переменных
var typeTbl = ['', ''] //параллельная таблица типов переменных (тип данных "" будет означать "любой",
//но для оператора return - тот, с которым объявлена функция, как и для defVar - тот, который является вторым ее операндом)
var hasReturn = false

function Tracer() {
  this.history = []
}
Tracer.prototype = {
  put: function (b) {
    this.history.push(b)
  },
  getAll: function () {
    var r = ''
    for (var i = 0; i < this.history.length; i++) r += ' ' + this.history[i]
    return r
  },
  clear: function () {
    this.history = []
  },
}
var tracer = new Tracer()

function clear() {
  tracer.history = []
  opStk = []
  ctlStk = []
  onStk = []
  userSignStk = []
  operandStk = []
  idTbl = []
  typeTbl = []
  operatorCnt = 0
}

function toPFR(x) {
  tracer.put(x)
}

function peek(o) {
  return o[o.length - 1]
}

function getPriority(s) {
  if (s == '(') return 0
  if (s == '>') return 3
  if (s == '+') return 5
  if (s == '-') return 5
  if (s == '*') return 10
  if (s == '/') return 10
  return 0
}

function toPseudoCode() {
  toPFR('\n\n')
  toPFR('Псевдокод:\n')
  var label = false
  var expr = false
  var lim = tracer.history.length
  startForRun = lim + 1
  for (var i = 0; i < lim; i++) {
    var word = tracer.history[i]
    var type = getType(word)
    if (type == 0 && userSignTbl.indexOf(word) >= 0) type = 5
    if (type === 0)
      if (word.indexOf(':') > 0) {
        //имя переменной или метка
        label = true
        toPFR('\n')
        toPFR(word)
      } else {
        if (word.search(/[a-zA-Z]/) == 0) {
          if (
            idTbl.indexOf(word) < 0 &&
            ['char', 'int', 'real'].indexOf(word) < 0 &&
            word.search(/[A-Z]/) < 0
          ) {
            startForRun = -1
            toPFR("\nНеобъявленная переменная: '" + word + "'\n")
          }
          if (word === 'testReturn') {
            if (!hasReturn) {
              toPFR('\nВ теле функции нет оператора возврата значения')
              startForRun = -1
            } else hasReturn = false
          } else operandStk.push(word)
        } else operandStk.push(constToInt(word))
      }
    if (type === 5) {
      //имя функции
      expr = true
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      toPFR(word)
      toPFR(operandStk.pop())
      toPFR('STACK')
      operandStk.push('STACK')
    }
    if (type === 10 || type === 11) {
      expr = true
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      toPFR('move')
      toPFR(operandStk.pop())
      toPFR('STACK')
      toPFR('\n')
      toPFR('_')
      toPFR(word)
      toPFR(operandStk.pop())
      toPFR('STACK')
    }
    if (type == 20) {
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      if (!expr) {
        toPFR('move')
        toPFR(operandStk.pop())
        toPFR('STACK')
        toPFR('\n')
        toPFR('_')
      }
      toPFR('move')
      toPFR('STACK')
      toPFR(operandStk.pop())
      expr = false
    }
    if (type == 30) {
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      toPFR(word)
      toPFR(operandStk.pop())
      toPFR(operandStk.pop())
    }
    if (type == 40 || type == 41) {
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      toPFR(word)
      if (type === 40) toPFR('---')
      else toPFR('STACK')
      toPFR(operandStk.pop())
      expr = false
    }
    if (type === 50) {
      if (label === false) {
        toPFR('\n')
        toPFR('_')
      } else label = false
      if (!expr) {
        toPFR('move')
        toPFR(operandStk.pop())
        toPFR('STACK')
        toPFR('\n')
        toPFR('_')
      }
      toPFR(word)
      toPFR('STACK')
      toPFR('---')
      expr = false
    }
  }
}

function getType(w) {
  switch (w) {
    case '+':
    case '-':
    case '>':
      return 10 //знак арифметической операции
    case '==':
      return 11 //знак операции сравнения
    case '=':
      return 20 //знак операции присваивания
    case 'defVar':
      return 30 //знак операции объявления переменной
    case 'jmp':
      return 40 //знак операции безусловной передачи управления
    case 'jmpOnFalse':
      return 41 //знак операции передачи управления по условию
    case 'return':
      return 50 //знак операции значения управления из функции
    // ...
  }
  return 0
}

function constToInt(w) {
  if (w.substring(0, 2) === '3x') {
    var val = 0,
      base = 1
    for (var i = w.length - 1; i > 1; i -= 1) {
      val += base * (w.charAt(i) - '0')
      base *= 3
    }
    if (val === 0) return '0'
    var rez = ''
    while (val > 0) {
      rez = '' + (val % 10) + rez
      val = (val - (val % 10)) / 10
    }
    return rez
  } else return w
}
function run() {
  if (startForRun < 0) {
    toPFR(
      '\n\nТестируемая программа содержит ошибки, интерпретация ее невозможна.'
    )
    return
  }
  toPFR('\n\nРезультаты выполнения операторов псевдокода')
  toPFR('\n(только в примере, в курсовой работе это формировать не нужно)\n')
  var pCode = tracer.history
  var lim = pCode.length
  var stack = []
  var ind, rez
  for (var i = startForRun; i < lim; i += 5) {
    var codeOp = pCode[i + 1]
    var jmpCondition = true
    switch (codeOp) {
      case '>':
        ind = idTbl.indexOf(pCode[i + 2])
        if (ind >= 0) rez = valTbl[ind] > stack.pop() ? true : false
        else rez = pCode[i + 2] > stack.pop() ? true : false
        stack.push(rez)
        toPFR(rez)
        toPFR('\n')
        break
      case 'move':
        if (pCode[i + 3] === 'STACK') stack.push(pCode[i + 2])
        else {
          var j = idTbl.indexOf(pCode[i + 3])
          if (j < 0) {
            toPFR(
              '\nПопытка записи в несуществующую переменную ' + pCode[i + 3]
            )
            return
          }
          valTbl[j] = pCode[i + 2]
        }
        ind = idTbl.indexOf(pCode[i + 2])
        if (ind >= 0) toPFR(valTbl[ind])
        else if (pCode[i + 2] === 'STACK') toPFR(peek(stack))
        else toPFR(pCode[i + 2])
        toPFR('\n')
        break
      case 'jmpOnFalse':
        jmpCondition = !stack.pop()
      case 'jmp':
        if (jmpCondition) {
          i = pCode.lastIndexOf(pCode[i + 3] + ':') - 5
          if (i < 0) {
            toPFR('\nПередача управления на несуществующую метку.')
            return
          }
        }
        break
    }
  }
}
