import { TEXT_SIZE, TEXT_SIZE_SMALL, TEXT_SIZE_SMALLER } from "@/constants/textSize";

export function renderDescriptionToHtml(numberOfTicksToRender: number, description: string) {
    const adjustFontSize = (): string => {
        if (numberOfTicksToRender <= 5) {
            return '4pt';
        }
        if (numberOfTicksToRender < 10) {
            return TEXT_SIZE_SMALL;
        }
        return description.length < 80 ? TEXT_SIZE : description.length < 160 ? TEXT_SIZE_SMALL : TEXT_SIZE_SMALLER;
    };
    return (
        `
        <td class="description-cell" style="font-size: ${adjustFontSize()};">${description}</td>
        `
    );
}