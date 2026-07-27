export const DARK_YELLOW = '#FFCC00' as const;
export const MEDIUM_YELLOW = '#FFFF00' as const;
export const LIGHT_YELLOW = '#FFFF66' as const;
export const PALE_YELLOW = '#FFFF99' as const;
export const DARK_GREY = '#1C1C1C' as const;
export const MEDIUM_GREY = '#4D4D4D' as const;
export const LIGHT_GREY = '#969696' as const;
export const PALE_GREY = '#C0C0C0' as const;
export const DARK_BROWN = '#993300' as const;
export const MEDIUM_BROWN = '#CC3300' as const;
export const LIGHT_BROWN = '#FF9966' as const;
export const PALE_BROWN = '#FFCC99' as const;
export const DARK_RED = '#CC0000' as const;
export const MEDIUM_RED = '#FF0000' as const;
export const LIGHT_RED = '#FF5050' as const;
export const PALE_RED = '#FFCCCC' as const;
export const DARK_PURPLE = '#660066' as const;
export const MEDIUM_PURPLE = '#990099' as const;
export const LIGHT_PURPLE = '#FF99FF' as const;
export const PALE_PURPLE = '#FFCCFF' as const;
export const DARK_ORANGE = '#FF6600' as const;
export const MEDIUM_ORANGE = '#FF9933' as const;
export const LIGHT_ORANGE = '#FFCC66' as const;
export const PALE_ORANGE = '#FFE499' as const;
export const DARK_GREEN = '#006600' as const;
export const MEDIUM_GREEN = '#00B000' as const;
export const LIGHT_GREEN = '#66FF33' as const;
export const PALE_GREEN = '#CCFF66' as const;
export const DARK_BLUE = '#0000CC' as const;
export const MEDIUM_BLUE = '#0033CC' as const;
export const LIGHT_BLUE = '#3399FF' as const;
export const PALE_BLUE = '#CCECFF' as const;

export type ColourCode = [
    typeof DARK_YELLOW,
    typeof MEDIUM_YELLOW,
    typeof LIGHT_YELLOW,
    typeof PALE_YELLOW,
    typeof DARK_GREY,
    typeof MEDIUM_GREY,
    typeof LIGHT_GREY,
    typeof PALE_GREY,
    typeof DARK_BROWN,
    typeof MEDIUM_BROWN,
    typeof LIGHT_BROWN,
    typeof PALE_BROWN,
    typeof DARK_RED,
    typeof MEDIUM_RED,
    typeof LIGHT_RED,
    typeof PALE_RED,
    typeof DARK_PURPLE,
    typeof MEDIUM_PURPLE,
    typeof LIGHT_PURPLE,
    typeof PALE_PURPLE,
    typeof DARK_ORANGE,
    typeof MEDIUM_ORANGE,
    typeof LIGHT_ORANGE,
    typeof PALE_ORANGE,
    typeof DARK_GREEN,
    typeof MEDIUM_GREEN,
    typeof LIGHT_GREEN,
    typeof PALE_GREEN,
    typeof DARK_BLUE,
    typeof MEDIUM_BLUE,
    typeof LIGHT_BLUE,
    typeof PALE_BLUE,
][number];

export interface Colour {
    level: number;
    colourTag: string;
    colourTagFontColour: string;
    colourNameForSoilDescription: string;
    colourCode: ColourCode;
    colourFamily: string;
}

export const DOMINANT_COLOUR_LIST: Colour[] = [
    { level: 1, colourTag: 'Dark Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellow', colourCode: DARK_YELLOW, colourFamily: 'yellow' }, 
    { level: 2, colourTag: 'Medium Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellow', colourCode: MEDIUM_YELLOW, colourFamily: 'yellow' }, 
    { level: 3, colourTag: 'Light Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellow', colourCode: LIGHT_YELLOW, colourFamily: 'yellow' }, 
    { level: 4, colourTag: 'Pale Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellow', colourCode: PALE_YELLOW, colourFamily: 'yellow' },
    { level: 1, colourTag: 'Dark Grey', colourTagFontColour: 'white', colourNameForSoilDescription: 'grey', colourCode: DARK_GREY, colourFamily: 'grey' },
    { level: 2, colourTag: 'Medium Grey', colourTagFontColour: 'white', colourNameForSoilDescription: 'grey', colourCode: MEDIUM_GREY, colourFamily: 'grey' },
    { level: 3, colourTag: 'Light Grey', colourTagFontColour: 'black', colourNameForSoilDescription: 'grey', colourCode: LIGHT_GREY, colourFamily: 'grey' },
    { level: 4, colourTag: 'Pale Grey', colourTagFontColour: 'black', colourNameForSoilDescription: 'grey', colourCode: PALE_GREY, colourFamily: 'grey' },
    { level: 1, colourTag: 'Dark Brown', colourTagFontColour: 'white', colourNameForSoilDescription: 'brown', colourCode: DARK_BROWN, colourFamily: 'brown' },
    { level: 2, colourTag: 'Medium Brown', colourTagFontColour: 'white', colourNameForSoilDescription: 'brown', colourCode: MEDIUM_BROWN, colourFamily: 'brown' },
    { level: 3, colourTag: 'Light Brown', colourTagFontColour: 'black', colourNameForSoilDescription: 'brown', colourCode: LIGHT_BROWN, colourFamily: 'brown' },
    { level: 4, colourTag: 'Pale Brown', colourTagFontColour: 'black', colourNameForSoilDescription: 'brown', colourCode: PALE_BROWN, colourFamily: 'brown' },
    { level: 1, colourTag: 'Dark Red', colourTagFontColour: 'white', colourNameForSoilDescription: 'red', colourCode: DARK_RED, colourFamily: 'red' },
    { level: 2, colourTag: 'Medium Red', colourTagFontColour: 'white', colourNameForSoilDescription: 'red', colourCode: MEDIUM_RED, colourFamily: 'red' },
    { level: 3, colourTag: 'Light Red', colourTagFontColour: 'black', colourNameForSoilDescription: 'red', colourCode: LIGHT_RED, colourFamily: 'red' },
    { level: 4, colourTag: 'Pale Red', colourTagFontColour: 'black', colourNameForSoilDescription: 'red', colourCode: PALE_RED, colourFamily: 'red' },
    { level: 1, colourTag: 'Dark Purple', colourTagFontColour: 'white', colourNameForSoilDescription: 'purple', colourCode: DARK_PURPLE, colourFamily: 'purple' },
    { level: 2, colourTag: 'Medium Purple', colourTagFontColour: 'white', colourNameForSoilDescription: 'purple', colourCode: MEDIUM_PURPLE, colourFamily: 'purple' },
    { level: 3, colourTag: 'Light Purple', colourTagFontColour: 'black', colourNameForSoilDescription: 'purple', colourCode: LIGHT_PURPLE, colourFamily: 'purple' },
    { level: 4, colourTag: 'Pale Purple', colourTagFontColour: 'black', colourNameForSoilDescription: 'purple', colourCode: PALE_PURPLE, colourFamily: 'purple' },
    { level: 1, colourTag: 'Dark Orange', colourTagFontColour: 'white', colourNameForSoilDescription: 'orange', colourCode: DARK_ORANGE, colourFamily: 'orange' },
    { level: 2, colourTag: 'Medium Orange', colourTagFontColour: 'white', colourNameForSoilDescription: 'orange', colourCode: MEDIUM_ORANGE, colourFamily: 'orange' },
    { level: 3, colourTag: 'Light Orange', colourTagFontColour: 'black', colourNameForSoilDescription: 'orange', colourCode: LIGHT_ORANGE, colourFamily: 'orange' },
    { level: 4, colourTag: 'Pale Orange', colourTagFontColour: 'black', colourNameForSoilDescription: 'orange', colourCode: PALE_ORANGE, colourFamily: 'orange' },
    { level: 1, colourTag: 'Dark Green', colourTagFontColour: 'white', colourNameForSoilDescription: 'green', colourCode: DARK_GREEN, colourFamily: 'green' },
    { level: 2, colourTag: 'Medium Green', colourTagFontColour: 'white', colourNameForSoilDescription: 'green', colourCode: MEDIUM_GREEN, colourFamily: 'green' },
    { level: 3, colourTag: 'Light Green', colourTagFontColour: 'black', colourNameForSoilDescription: 'green', colourCode: LIGHT_GREEN, colourFamily: 'green' },
    { level: 4, colourTag: 'Pale Green', colourTagFontColour: 'black', colourNameForSoilDescription: 'green', colourCode: PALE_GREEN, colourFamily: 'green' },
    { level: 1, colourTag: 'Dark Blue', colourTagFontColour: 'white', colourNameForSoilDescription: 'blue', colourCode: DARK_BLUE, colourFamily: 'blue' },
    { level: 2, colourTag: 'Medium Blue', colourTagFontColour: 'white', colourNameForSoilDescription: 'blue', colourCode: MEDIUM_BLUE, colourFamily: 'blue' },
    { level: 3, colourTag: 'Light Blue', colourTagFontColour: 'black', colourNameForSoilDescription: 'blue', colourCode: LIGHT_BLUE, colourFamily: 'blue' },
    { level: 4, colourTag: 'Pale Blue', colourTagFontColour: 'black', colourNameForSoilDescription: 'blue', colourCode: PALE_BLUE, colourFamily: 'blue' },
] as const;

export const SECONDARY_COLOUR_LIST: Colour[] = [
    { level: 1, colourTag: 'Dark Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellowish', colourCode: DARK_YELLOW, colourFamily: 'yellow' }, 
    { level: 2, colourTag: 'Medium Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellowish', colourCode: MEDIUM_YELLOW, colourFamily: 'yellow' }, 
    { level: 3, colourTag: 'Light Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellowish', colourCode: LIGHT_YELLOW, colourFamily: 'yellow' }, 
    { level: 4, colourTag: 'Pale Yellow', colourTagFontColour: 'black', colourNameForSoilDescription: 'yellowish', colourCode: PALE_YELLOW, colourFamily: 'yellow' },
    { level: 1, colourTag: 'Dark Grey', colourTagFontColour: 'white', colourNameForSoilDescription: 'greyish', colourCode: DARK_GREY, colourFamily: 'grey' },
    { level: 2, colourTag: 'Medium Grey', colourTagFontColour: 'white', colourNameForSoilDescription: 'greyish', colourCode: MEDIUM_GREY, colourFamily: 'grey' },
    { level: 3, colourTag: 'Light Grey', colourTagFontColour: 'black', colourNameForSoilDescription: 'greyish', colourCode: LIGHT_GREY, colourFamily: 'grey' },
    { level: 4, colourTag: 'Pale Grey', colourTagFontColour: 'black', colourNameForSoilDescription: 'greyish', colourCode: PALE_GREY, colourFamily: 'grey' },
    { level: 1, colourTag: 'Dark Brown', colourTagFontColour: 'white', colourNameForSoilDescription: 'brownish', colourCode: DARK_BROWN, colourFamily: 'brown' },
    { level: 2, colourTag: 'Medium Brown', colourTagFontColour: 'white', colourNameForSoilDescription: 'brownish', colourCode: MEDIUM_BROWN, colourFamily: 'brown' },
    { level: 3, colourTag: 'Light Brown', colourTagFontColour: 'black', colourNameForSoilDescription: 'brownish', colourCode: LIGHT_BROWN, colourFamily: 'brown' },
    { level: 4, colourTag: 'Pale Brown', colourTagFontColour: 'black', colourNameForSoilDescription: 'brownish', colourCode: PALE_BROWN, colourFamily: 'brown' },
    { level: 1, colourTag: 'Dark Red', colourTagFontColour: 'white', colourNameForSoilDescription: 'reddish', colourCode: DARK_RED, colourFamily: 'red' },
    { level: 2, colourTag: 'Medium Red', colourTagFontColour: 'white', colourNameForSoilDescription: 'reddish', colourCode: MEDIUM_RED, colourFamily: 'red' },
    { level: 3, colourTag: 'Light Red', colourTagFontColour: 'black', colourNameForSoilDescription: 'reddish', colourCode: LIGHT_RED, colourFamily: 'red' },
    { level: 4, colourTag: 'Pale Red', colourTagFontColour: 'black', colourNameForSoilDescription: 'reddish', colourCode: PALE_RED, colourFamily: 'red' },
    { level: 1, colourTag: 'Dark Purple', colourTagFontColour: 'white', colourNameForSoilDescription: 'purplish', colourCode: DARK_PURPLE, colourFamily: 'purple' },
    { level: 2, colourTag: 'Medium Purple', colourTagFontColour: 'white', colourNameForSoilDescription: 'purplish', colourCode: MEDIUM_PURPLE, colourFamily: 'purple' },
    { level: 3, colourTag: 'Light Purple', colourTagFontColour: 'black', colourNameForSoilDescription: 'purplish', colourCode: LIGHT_PURPLE, colourFamily: 'purple' },
    { level: 4, colourTag: 'Pale Purple', colourTagFontColour: 'black', colourNameForSoilDescription: 'purplish', colourCode: PALE_PURPLE, colourFamily: 'purple' },
    { level: 1, colourTag: 'Dark Orange', colourTagFontColour: 'white', colourNameForSoilDescription: 'orangish', colourCode: DARK_ORANGE, colourFamily: 'orange' },
    { level: 2, colourTag: 'Medium Orange', colourTagFontColour: 'white', colourNameForSoilDescription: 'orangish', colourCode: MEDIUM_ORANGE, colourFamily: 'orange' },
    { level: 3, colourTag: 'Light Orange', colourTagFontColour: 'black', colourNameForSoilDescription: 'orangish', colourCode: LIGHT_ORANGE, colourFamily: 'orange' },
    { level: 4, colourTag: 'Pale Orange', colourTagFontColour: 'black', colourNameForSoilDescription: 'orangish', colourCode: PALE_ORANGE, colourFamily: 'orange' },
    { level: 1, colourTag: 'Dark Green', colourTagFontColour: 'white', colourNameForSoilDescription: 'greenish', colourCode: DARK_GREEN, colourFamily: 'green' },
    { level: 2, colourTag: 'Medium Green', colourTagFontColour: 'white', colourNameForSoilDescription: 'greenish', colourCode: MEDIUM_GREEN, colourFamily: 'green' },
    { level: 3, colourTag: 'Light Green', colourTagFontColour: 'black', colourNameForSoilDescription: 'greenish', colourCode: LIGHT_GREEN, colourFamily: 'green' },
    { level: 4, colourTag: 'Pale Green', colourTagFontColour: 'black', colourNameForSoilDescription: 'greenish', colourCode: PALE_GREEN, colourFamily: 'green' },
    { level: 1, colourTag: 'Dark Blue', colourTagFontColour: 'white', colourNameForSoilDescription: 'bluish', colourCode: DARK_BLUE, colourFamily: 'blue' },
    { level: 2, colourTag: 'Medium Blue', colourTagFontColour: 'white', colourNameForSoilDescription: 'bluish', colourCode: MEDIUM_BLUE, colourFamily: 'blue' },
    { level: 3, colourTag: 'Light Blue', colourTagFontColour: 'black', colourNameForSoilDescription: 'bluish', colourCode: LIGHT_BLUE, colourFamily: 'blue' },
    { level: 4, colourTag: 'Pale Blue', colourTagFontColour: 'black', colourNameForSoilDescription: 'bluish', colourCode: PALE_BLUE, colourFamily: 'blue' },
] as const;
