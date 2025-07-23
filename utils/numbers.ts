export function checkNonNegativeInteger(numStr: string) {
    return !isNaN(parseInt(numStr)) && parseInt(numStr) >= 0;
}

export function checkNonNegativeFloat(numStr: string) {
    console.log(numStr);
    return !isNaN(parseFloat(numStr)) && parseFloat(numStr) >= 0;
}

export function stringToDecimalPoint(numStr: string, numDp: number) {
    return parseFloat(parseFloat(numStr).toFixed(numDp));
}