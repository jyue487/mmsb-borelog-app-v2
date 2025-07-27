export function isNonNegativeInteger(numStr: string): boolean {
    return !isNaN(parseInt(numStr)) && parseInt(numStr) >= 0;
}

export function isNonNegativeFloat(numStr: string): boolean {
    return !isNaN(parseFloat(numStr)) && parseFloat(numStr) >= 0;
}

export function stringToDecimalPoint(numStr: string, numDp: number): number {
    return parseFloat(parseFloat(numStr).toFixed(numDp));
}

export function roundToDecimalPoint(x: number, numDp: number): number {
    return parseFloat(x.toFixed(numDp));
}

