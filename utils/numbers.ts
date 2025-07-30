export function isNonNegative(x: number): boolean {
    return !isNaN(x) && x >= 0;
}

export function isPositive(x: number): boolean {
    return !isNaN(x) && x > 0;
}

export function stringIsNonNegativeInteger(numStr: string): boolean {
    return isNonNegative(parseInt(numStr));
}

export function stringIsPositiveInteger(numStr: string): boolean {
    return isPositive(parseInt(numStr));
}

export function stringIsNonNegativeFloat(numStr: string): boolean {
    return isNonNegative(parseFloat(numStr));
}

export function stringIsPositiveFloat(numStr: string): boolean {
    return isPositive(parseFloat(numStr));
}

export function stringIsFloat(numStr: string): boolean {
    return !isNaN(parseFloat(numStr));
}

export function stringToDecimalPoint(numStr: string, numDp: number): number {
    return parseFloat(parseFloat(numStr).toFixed(numDp));
}

export function roundToDecimalPoint(x: number, numDp: number): number {
    return parseFloat(x.toFixed(numDp));
}

