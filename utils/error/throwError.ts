export function throwError(errMsg: string): never {
    alert(errMsg);
    throw new Error(errMsg);
}