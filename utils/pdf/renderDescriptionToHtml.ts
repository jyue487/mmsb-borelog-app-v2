import { TEXT_SIZE_ANDROID, TEXT_SIZE_IOS, TEXT_SIZE_UNIT } from '@/constants/textSize';
import { Platform } from 'react-native';

export function renderDescriptionToHtml(numberOfTicksToRender: number, description: string) {
    const adjustFontSize = (): string => {
        if (Platform.OS === 'ios') {
            return Math.min(TEXT_SIZE_IOS, Math.floor(11 - description.length / numberOfTicksToRender / 10)).toString() + TEXT_SIZE_UNIT;
        }
        return Math.min(TEXT_SIZE_ANDROID, Math.floor(11 - description.length / numberOfTicksToRender / 10)).toString() + TEXT_SIZE_UNIT;

        // if (numberOfTicksToRender <= 5) {
        //     return '4pt';
        // }
        // if (numberOfTicksToRender < 10) {
        //     return TEXT_SIZE_SMALL;
        // }
        // return description.length < 80 ? TEXT_SIZE : description.length < 160 ? TEXT_SIZE_SMALL : TEXT_SIZE_SMALLER;
    };
    return (
        `
        <td class="description-cell" style="font-size: ${adjustFontSize()};">${description}</td>
        `
    );
    // return (
    //     `
    //     <td class="description-cell" style="font-size: ${adjustFontSize()};">${description}</td>
    //     `
    // );
}

/*
8pt: 30chars per line, height 2 ticks
7pt: 40chars per line, height 2 ticks
6pt: 40
5pt: 50
4pt: 60 chars
3pt: 80
*/