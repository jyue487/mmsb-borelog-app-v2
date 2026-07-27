export function getYear(date: Date): string {
    return date.getFullYear().toString();
}

export function getMonth(date: Date): string {
    return (date.getMonth() + 1).toString().padStart(2, '0');
}

export function getDayOfMonth(date: Date): string {
    return (date.getDate()).toString().padStart(2, '0');
}

export function getHours(date: Date): string {
    return (date.getHours()).toString().padStart(2, '0');
}

export function getMinutes(date: Date): string {
    return (date.getMinutes()).toString().padStart(2, '0');
}

export function getDate(date: Date): string {
    return `${getYear(date)}/${getMonth(date)}/${getDayOfMonth(date)}`;
}

export function getTime(time: Date): string {
    return `${getHours(time)}:${getMinutes(time)}`;
}

export function getDateTime(date: Date, time: Date): string {
    return `${getDate(date)} ${getTime(time)}`;
}
