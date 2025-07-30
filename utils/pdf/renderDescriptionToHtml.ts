import { TEXT_SIZE, TEXT_SIZE_SMALL, TEXT_SIZE_SMALLER } from "@/constants/textSize";

export function renderDescriptionToHtml(numberOfTicksToRender: number, description: string) {
    const adjustFontSize = (): string => {
        return Math.min(8, Math.floor(11 - description.length / numberOfTicksToRender / 10)).toString() + 'pt';

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