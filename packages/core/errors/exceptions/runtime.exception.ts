export class RuntimeException extends Error {
  constructor(message = ``) {
    super(message);
  }

  public what() {
      throw new Error("STUB");
  }
}
