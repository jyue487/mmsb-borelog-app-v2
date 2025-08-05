export function renderFooterToHtml() {
    return (
        `
        <table class="footer-info" style="font-size: 4pt;">
            <tr>
                <td style="width: 26%;">NOTES:</td>
                <td style="width: 14%;">Cohesive Soil (N)</td>
                <td style="width: 17%;">Non Cohesive Soil (N)</td>
                <td rowspan="9" style="text-align: left; padding: 5pt;">
                    Contractor:
                    <br>
                    <br>
                    <br>
                    Date Started:
                    <br>
                    <br>
                    <br>
                    Date Finished:
                    <br>
                    <br>
                    <br>
                </td>
                <td rowspan="9" style="text-align: left; padding: 5pt;">
                    Logged by:
                    <br>
                    <br>
                    <br>
                    Checked by:
                    <br>
                    <br>
                    <br>
                    Date:
                    <br>
                    <br>
                    <br>
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