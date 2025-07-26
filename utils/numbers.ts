export function isNonNegativeInteger(numStr: string) {
    return !isNaN(parseInt(numStr)) && parseInt(numStr) >= 0;
}

export function isNonNegativeFloat(numStr: string) {
    return !isNaN(parseFloat(numStr)) && parseFloat(numStr) >= 0;
}

export function stringToDecimalPoint(numStr: string, numDp: number) {
    return parseFloat(parseFloat(numStr).toFixed(numDp));
}