export function renderScaleTicksToHtml(numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    let result: string = ``;
    for (let i = 0; i < numberOfTicksToRender - 1; ++i) {
        ++scaleTickIndexWrapper[0];
        if (scaleTickIndexWrapper[0] % 10 === 0) {
            result += (
                `
                <div style="width: 21px; height: 7px; border-bottom: 0.7px solid #000; text-align: right; line-height: 1em; font-size: 6px;">${scaleTickIndexWrapper[0] / 10}</div>
                `
            );
        } else {
            result += (
                `
                <div style="width: 7px; height: 7px; border-bottom: 0.7px solid #000;"></div>
                `
            );
        }
    }
    ++scaleTickIndexWrapper[0];
    if (scaleTickIndexWrapper[0] % 10 === 0) {
        result += (
            `
            <div style="width: 21px; height: 7px; text-align: right; line-height: 1em; font-size: 6px;">${scaleTickIndexWrapper[0] / 10}</div>
            `
        );
    } else {
        result += (
            `
            <div style="width: 7px; height: 7px;"></div>
            `
        );
    }
    return (
        `
        <td class="scale" style="padding: 0;">
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
                ${result}
            </div>
        </td>
        `
    );
}