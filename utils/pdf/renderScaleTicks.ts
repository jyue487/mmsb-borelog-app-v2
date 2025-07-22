export function renderScaleTicks(numberOfTicksToRender: number, scaleTickIndexWrapper: number[]) {
    let result: string = ``;
    for (let i = 0; i < numberOfTicksToRender - 1; ++i) {
        ++scaleTickIndexWrapper[0];
        if (scaleTickIndexWrapper[0] % 10 === 0) {
            result += (
                `
                <div style="width: 21px; height: 6px; border-bottom: 1px solid #000; text-align: right; line-height: 1em; font-size: 6px;">${scaleTickIndexWrapper[0] / 10}</div>
                `
            );
        } else {
            result += (
                `
                <div style="width: 7px; height: 6px; border-bottom: 1px solid #000;"></div>
                `
            );
        }
    }
    ++scaleTickIndexWrapper[0];
    if (scaleTickIndexWrapper[0] % 10 === 0) {
        result += (
            `
            <div style="width: 21px; height: 6px; text-align: right; line-height: 1em; font-size: 6px;">${scaleTickIndexWrapper[0] / 10}</div>
            `
        );
    } else {
        result += (
            `
            <div style="width: 7px; height: 6px;"></div>
            `
        );
    }
    return result;
}