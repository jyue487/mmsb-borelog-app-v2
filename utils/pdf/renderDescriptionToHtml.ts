import { TEXT_SIZE_ANDROID, TEXT_SIZE_IOS, TEXT_SIZE_UNIT } from '@/constants/textSize';
import { Platform } from 'react-native';

export function renderDescriptionToHtml(numberOfTicksToRender: number, description: string) {
    const adjustFontSize = (): number => {
        if (Platform.OS === 'ios') {
            return Math.min(TEXT_SIZE_IOS, Math.floor(11 - description.length / numberOfTicksToRender / 10));
        }
        const fontSize: number = Math.min(
            TEXT_SIZE_ANDROID, 
            Math.max(
                3, 
                Math.floor(11 - description.length / numberOfTicksToRender / 10)
            )
        );
        console.log(`Font size: ${fontSize}${TEXT_SIZE_UNIT}`);
        return fontSize;
    };
    const adjustScale = (fontSize: number): number => {
        if (fontSize >= 5) {
            return 1;
        }
        return fontSize / 6;
    };

    const fontSize: number = adjustFontSize();
    const scale: number = adjustScale(fontSize);

    return (
        `
        <td class="description-cell" style="font-size: ${fontSize}${TEXT_SIZE_UNIT};">
            <span 
                style="
                    display: inline-block;
                    font-size: ${fontSize}${TEXT_SIZE_UNIT};
                    scale: ${scale};
                    width: ${(1 / scale) * 100}%;
                    transform-origin: left top;
                ">
                ${description}
            </span>    
        </td>
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