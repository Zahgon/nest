import { Module } from '../module';
import { TreeNode } from './tree-node';

export class TopologyTree {
  private root: TreeNode<Module>;
  private links: Map<Module, TreeNode<Module>> = new Map();

  constructor(moduleRef: Module) {
      throw new Error("STUB");
  }

  public walk(callback: (value: Module, depth: number) => void) {
    function walkNode(node: TreeNode<Module>, depth = 1) {
      callback(node.value, depth);
      node.children.forEach(child => { throw new Error("STUB"); });
    }
    walkNode(this.root);
  }

  private traverseAndMapToTree(node: TreeNode<Module>, depth = 1) {
      throw new Error("STUB");
  }
}
