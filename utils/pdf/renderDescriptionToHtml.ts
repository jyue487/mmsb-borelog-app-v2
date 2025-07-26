import { TEXT_SIZE } from "@/constants/textSize";

export function renderDescriptionToHtml(description: string) {
    return (
        `
        <td class="description-cell" style="font-size: ${description.length > 100 ? '5pt' : TEXT_SIZE};">${description}</td>
        `
    );
}