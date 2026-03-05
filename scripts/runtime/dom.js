export function queryOne(selector, root = document) {
  return root.querySelector(selector);
}

export function queryLast(selector, root = document) {
  const nodes = root.querySelectorAll(selector);
  return nodes.length ? nodes[nodes.length - 1] : null;
}
