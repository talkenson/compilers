import { Assignment } from './assignment'
import { Break } from './break'
import { Conditional } from './conditional'
import { Exit } from './exit'
import { Loop } from './loop'
import { Return } from './return'
import { Switch } from './switch'

export type Statement =
  | Assignment
  | Return
  | Break
  | Exit
  | Loop
  | Conditional
  | Switch
