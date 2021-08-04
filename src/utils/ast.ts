import type ESTree from 'estree';

/**
 * Determines whether the given node is a `null` literal.
 * @param {ASTNode} node The node to check
 * @returns {boolean} `true` if the node is a `null` literal
 */
export function isNullLiteral(node: ESTree.Node): node is ESTree.SimpleLiteral & { value: null } {
  /*
   * Checking `node.value === null` does not guarantee that a literal is a null literal.
   * When parsing values that cannot be represented in the current environment (e.g. unicode
   * regexes in Node 4), `node.value` is set to `null` because it wouldn't be possible to
   * set `node.value` to a unicode regex. To make sure a literal is actually `null`, check
   * `node.regex` instead. Also see: https://github.com/eslint/eslint/issues/8020
   */
  return (
    node.type === 'Literal' && node.value === null && !('regex' in node) && !('bigint' in node)
  );
}

/**
 * Returns the result of the string conversion applied to the evaluated value of the given expression node,
 * if it can be determined statically.
 *
 * This function returns a `string` value for all `Literal` nodes and simple `TemplateLiteral` nodes only.
 * In all other cases, this function returns `null`.
 * @param node Expression node.
 * @returns String value if it can be determined. Otherwise, `null`.
 */
export function getStaticStringValue(node: ESTree.Node): string | null {
  switch (node.type) {
    case 'Literal':
      if (node.value !== null) return String(node.value);
      // NullLiteral
      if (isNullLiteral(node)) return String(node.value); // "null"
      // RegExpLiteral
      if ('regex' in node) return `/${node.regex.pattern}/${node.regex.flags}`;
      // BigIntLiteral
      if ('bigint' in node) return node.bigint;

      // Otherwise, this is an unknown literal. The function will return null.
      break;
    case 'TemplateLiteral':
      if (node.expressions.length === 0 && node.quasis.length === 1)
        return node.quasis[0].value.cooked ?? null;

      break;

    // no default
  }

  return null;
}

/**
 * Retrieve `ChainExpression#expression` value if the given node a `ChainExpression` node. Otherwise, pass through it.
 * @param node The node to address.
 * @returns  The `ChainExpression#expression` value if the node is a `ChainExpression` node. Otherwise, the node.
 */
export function skipChainExpression<Node extends Exclude<ESTree.Node, ESTree.ChainExpression>>(
  node: Node | ESTree.ChainExpression,
): Node | ESTree.ChainExpression['expression'] {
  return node.type === 'ChainExpression' ? node.expression : node;
}

/**
 * 收集对象的访问路径。
 * @param node Expression or Identifier node.
 */
export function collectObjectPath(root: ESTree.Node): readonly (string | null)[] {
  const queue = [root];
  const path: (string | null)[] = [];

  let node: ESTree.Node | undefined;

  while ((node = queue.pop())) {
    if (node.type === 'Identifier') {
      path.push(node.name);
      continue;
    }

    if (node.type === 'ThisExpression') {
      path.push('this');
      continue;
    }

    node = skipChainExpression(node);

    if (node.type === 'MemberExpression') {
      // 右侧表达式
      if (node.property.type === 'Identifier') {
        // object.prop object?.prop
        path.push(node.property.name);
      } else if (node.computed) {
        // object['123'] object[123] object[`template`]
        path.push(getStaticStringValue(node.property));
      } else {
        // 未知的访问形式
        path.push(null);
      }

      // 左侧表达式
      queue.push(node.object);
    }
  }

  return path.reverse();
}
