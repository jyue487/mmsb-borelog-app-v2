export function throwError(err: any): never {
  const errMsg: string = `Error: ${err}`;
  alert(errMsg);
  throw new Error(errMsg);
}