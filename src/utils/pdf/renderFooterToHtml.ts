import { Borehole } from "@/src/interfaces/Borehole";
import { getDate } from "../datetime";

export function renderFooterToHtml(borehole: Borehole, dateStarted: Date | null, dateFinished: Date | null) {
    return (
        `
        <table class="footer-info" style="font-size: 4pt;">
            <tr>
                <td style="width: 26%;">NOTES:</td>
                <td style="width: 14%;">Cohesive Soil (N)</td>
                <td style="width: 17%;">Non Cohesive Soil (N)</td>
                <td rowspan="9" style="text-align: left; padding: 5pt;">
                    <table style="font-size: 4pt; table-layout: auto;">
                        <tr>
                            <td style="border: 0; height: 25pt; text-align: left; vertical-align: top; padding: 0;">
                                Driller: ${borehole.drillerName}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 0; height: 25pt; text-align: left; vertical-align: top; padding: 0;">
                                Logged by: IZWAN
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 0; height: 25pt; text-align: left; vertical-align: top; padding: 0;">
                                Date Started: ${(!dateStarted) ? '' : getDate(dateStarted)}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 0; text-align: left; vertical-align: top; padding: 0;">
                                Date Finished: ${(!dateFinished) ? '' : getDate(dateFinished)}
                            </td>
                        </tr>
                    </table>
                </td>
                <td rowspan="9" style="text-align: left; vertical-align: top; padding: 5pt;">
                    <table style="font-size: 4pt; table-layout: auto;">
                        <tr>
                            <td colspan="2" style="border: 0; height: 15pt; text-align: left; vertical-align: top; padding: 0;">
                                Checked by: ${(borehole.verifierName.length === 0) ? '' : borehole.verifierName}
                            </td>
                        </tr>
                        <tr>
                            <td style="border: 0; height: 60pt; white-space: nowrap; width: 1%; text-align: left; vertical-align: middle; padding: 0;">
                                Signature:
                            </td>
                            <td style="border: 0; height: 60pt; text-align: left; vertical-align: top; padding: 0;">
                                ${(borehole.verifierSignatureBase64.length === 0) ? '' : `<img src=${borehole.verifierSignatureBase64} style="max-height: 95%; max-width: 95%; width: auto;">`}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border: 0; text-align: left; vertical-align: middle; padding: 0;">
                                Date: ${(borehole.verifierSignDate === null) ? '' : getDate(borehole.verifierSignDate)}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td rowspan="8">
                    <div style="display: inline-block; text-align: right;">
                        <div style="white-space: pre;">P </div>
                        <div style="white-space: pre;">UD </div>
                        <div style="white-space: pre;">PS </div>
                        <div style="white-space: pre;">MZ </div>
                        <div style="white-space: pre;">D </div>
                        <div style="white-space: pre;">VS </div>
                        <div style="white-space: pre;">W </div>
                        <div style="white-space: pre;">C </div>
                    </div>
                    <div style="display: inline-block; text-align: left;">
                        <div>= Standard Penetration Test (SPT)</div>
                        <div>= 50mm dia. undisturbed sample</div>
                        <div>= Piston Sample</div>
                        <div>= Mazier Sample</div>
                        <div>= Disturbed Sample</div>
                        <div>= Vane Shear Test</div>
                        <div>= Water Sample</div>
                        <div>= Core Sample (Rock)</div>
                    </div>
                </td>
                <td rowspan="8">
                    <div style="display: inline-block; text-align: right; vertical-align: top;">
                        <div style="white-space: pre;"> 0</div>
                        <div style="white-space: pre;"> 2</div>
                        <div style="white-space: pre;"> 4</div>
                        <div style="white-space: pre;"> 8</div>
                        <div style="white-space: pre;">15</div>
                    </div>
                    <div style="display: inline-block; text-align: center;">
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> > </div>
                    </div>
                    <div style="display: inline-block;">
                        <div style="white-space: pre;">2</div>
                        <div style="white-space: pre;">4</div>
                        <div style="white-space: pre;">8</div>
                        <div style="white-space: pre;">15</div>
                        <div style="white-space: pre;">30</div>
                        <div style="white-space: pre;">30</div>
                    </div>
                    <div style="display: inline-block; text-align: left;">
                        <div style="white-space: pre;">   Very Soft</div>
                        <div style="white-space: pre;">   Soft</div>
                        <div style="white-space: pre;">   Firm</div>
                        <div style="white-space: pre;">   Stiff</div>
                        <div style="white-space: pre;">   Very Stiff</div>
                        <div style="white-space: pre;">   Hard</div>
                    </div>
                </td>
                <td rowspan="8">
                    <div style="display: inline-block; text-align: right; vertical-align: top">
                        <div style="white-space: pre;"> 0</div>
                        <div style="white-space: pre;"> 4</div>
                        <div style="white-space: pre;">10</div>
                        <div style="white-space: pre;">30</div>
                    </div>
                    <div style="display: inline-block; text-align: center;">
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> > </div>
                    </div>
                    <div style="display: inline-block;">
                        <div style="white-space: pre;">4</div>
                        <div style="white-space: pre;">10</div>
                        <div style="white-space: pre;">30</div>
                        <div style="white-space: pre;">50</div>
                        <div style="white-space: pre;">50</div>
                    </div>
                    <div style="display: inline-block; text-align: left">
                        <div style="white-space: pre;">   Very Loose</div>
                        <div style="white-space: pre;">   Loose</div>
                        <div style="white-space: pre;">   Medium Dense</div>
                        <div style="white-space: pre;">   Dense</div>
                        <div style="white-space: pre;">   Very Dense</div>
                    </div>
                </td>
            </tr>
        </table>
        `
    )
}