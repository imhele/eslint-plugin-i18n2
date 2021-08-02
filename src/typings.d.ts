import type { Rule } from 'eslint';

declare module 'estree' {
  interface BaseNode extends Rule.NodeParentExtension {}
}
