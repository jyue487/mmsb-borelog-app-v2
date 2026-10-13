/**
 * Python's number formatting and parsing, where it differs from JavaScript's.
 *
 * The borelog's text is whatever the Python program printed, so the port has to print it
 * the same way: `round()` and `f'{x:.2f}'` round half to even where JS rounds half up,
 * `str(1.0)` is `'1.0'` where `String(1.0)` is `'1'`, and `float()` accepts strings that
 * `Number()` does not (and the reverse).
 */

/** Python 3 `round(x)` on a float: half to even, on the exact binary value. */
export function pyRound(x: number): number {
	const floor = Math.floor(x);
	const diff = x - floor;
	if (diff < 0.5) return floor;
	if (diff > 0.5) return floor + 1;
	return floor % 2 === 0 ? floor : floor + 1;
}

/** Python `f'{x:.{digits}f}'`: correctly rounded, ties to even. */
export function pyFixed(x: number, digits: number): string {
	if (!Number.isFinite(x)) return Number.isNaN(x) ? 'nan' : x > 0 ? 'inf' : '-inf';
	const negative = x < 0 || Object.is(x, -0);
	const exact = Math.abs(x).toFixed(100);
	const point = exact.indexOf('.');
	const kept = exact.slice(0, point + 1 + digits);
	const rest = exact.slice(point + 1 + digits);
	// toFixed already rounds correctly except on an exact tie, where it rounds up. Python
	// rounds that tie to even.
	let result = Math.abs(x).toFixed(digits);
	if (/^50*$/.test(rest)) {
		const lastDigit = Number(kept.replace('.', '').slice(-1));
		if (lastDigit % 2 === 0) result = digits === 0 ? kept.slice(0, -1) : kept;
	}
	// Python keeps the sign even when the digits round to zero: f'{-0.001:.2f}' == '-0.00'.
	return negative ? `-${result}` : result;
}

/** Python `repr(float)` / `str(float)`: shortest round-trip digits, `1.0` not `1`, `1e+16` not `10000000000000000`. */
export function pyFloatStr(x: number): string {
	if (Number.isNaN(x)) return 'nan';
	if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
	if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
	const [mantissa, exponentText] = x.toExponential().split('e');
	const exponent = Number(exponentText);
	const sign = mantissa.startsWith('-') ? '-' : '';
	const digits = mantissa.replace('-', '').replace('.', '');
	if (exponent >= -4 && exponent < 16) {
		if (exponent < 0) return `${sign}0.${'0'.repeat(-exponent - 1)}${digits}`;
		const intPart = digits.slice(0, exponent + 1).padEnd(exponent + 1, '0');
		const fracPart = digits.slice(exponent + 1);
		return `${sign}${intPart}.${fracPart === '' ? '0' : fracPart}`;
	}
	const mant = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
	const expAbs = String(Math.abs(exponent)).padStart(2, '0');
	return `${sign}${mant}e${exponent < 0 ? '-' : '+'}${expAbs}`;
}

/** Python's whitespace, for `str.strip()` and `str.split()`. */
export const PY_WHITESPACE = ' \t\n\r\x0b\x0c\x1c\x1d\x1e\x1f\x85\xa0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000';
const WS_CLASS = `[${PY_WHITESPACE.replace(/[\]\\^-]/g, '\\$&')}]`;
const LEADING_WS = new RegExp(`^${WS_CLASS}+`);
const TRAILING_WS = new RegExp(`${WS_CLASS}+$`);
const WS_RUN = new RegExp(`${WS_CLASS}+`);

/** Python `str.strip()` */
export function pyStrip(text: string): string {
	return text.replace(LEADING_WS, '').replace(TRAILING_WS, '');
}

/** Python `str.split()` with no separator. */
export function pySplit(text: string): string[] {
	const stripped = pyStrip(text);
	return stripped === '' ? [] : stripped.split(WS_RUN);
}

const PY_FLOAT_RE = /^[+-]?(?:(?:\d(?:_?\d)*)?\.?\d(?:_?\d)*(?:[eE][+-]?\d(?:_?\d)*)?|\d(?:_?\d)*\.|inf|infinity|nan)$/i;

/** Python `float(text)`, or `null` where Python raises `ValueError`. */
export function pyParseFloat(text: string): number | null {
	const stripped = pyStrip(text);
	if (!PY_FLOAT_RE.test(stripped)) return null;
	const normalised = stripped.replace(/_/g, '').toLowerCase();
	const sign = normalised.startsWith('-') ? -1 : 1;
	const unsigned = normalised.replace(/^[+-]/, '');
	if (unsigned === 'inf' || unsigned === 'infinity') return sign * Infinity;
	if (unsigned === 'nan') return NaN;
	return Number(normalised);
}

/** Python `int(text)`, or `null` where Python raises `ValueError`. */
export function pyParseInt(text: string): number | null {
	const stripped = pyStrip(text);
	if (!/^[+-]?\d(?:_?\d)*$/.test(stripped)) return null;
	return Number(stripped.replace(/_/g, ''));
}
