export class TreeNode<T> {
  public readonly value: T;
  public readonly children = new Set<TreeNode<T>>();
  private parent: TreeNode<T> | null;

  constructor({ value, parent }: { value: T; parent: TreeNode<T> | null }) {
    this.value = value;
    this.parent = parent;
  }

  addChild(child: TreeNode<T>) {
      throw new Error("STUB");
  }

  removeChild(child: TreeNode<T>) {
      throw new Error("STUB");
  }

  relink(parent: TreeNode<T>) {
      throw new Error("STUB");
  }

  getDepth() {
      throw new Error("STUB");
  }

  hasCycleWith(target: T) {
      throw new Error("STUB");
  }
}
