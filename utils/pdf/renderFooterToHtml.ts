export function renderFooterToHtml() {
    return (
        `
        <div class="footer-info">
            <div style="display: flex; flex: 1; flex-direction: column;">
                <div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">NOTES: </div>
                <div style="display: flex; flex-direction: row; padding: 5px;">
                    <div style="text-align: right;">
                        <div style="white-space: pre;">P </div>
                        <div style="white-space: pre;">UD </div>
                        <div style="white-space: pre;">PS </div>
                        <div style="white-space: pre;">MZ </div>
                        <div style="white-space: pre;">D </div>
                        <div style="white-space: pre;">VS </div>
                        <div style="white-space: pre;">W </div>
                        <div style="white-space: pre;">C </div>
                    </div>
                    <div>
                        <div>= Standard Penetration Test (SPT)</div>
                        <div>= 50 mm dia. undisturbed sample</div>
                        <div>= Piston Sample</div>
                        <div>= Mazier Sample</div>
                        <div>= Disturbed Sample</div>
                        <div>= Vane Shear Test</div>
                        <div>= Water Sample</div>
                        <div>= Core Sample (Rock)</div>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
                <div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Cohesive Soil (N)</div>
                <div style="display: flex; flex-direction: row; padding: 5px;">
                    <div style="text-align: right;">
                        <div style="white-space: pre;"> 0</div>
                        <div style="white-space: pre;"> 2</div>
                        <div style="white-space: pre;"> 4</div>
                        <div style="white-space: pre;"> 8</div>
                        <div style="white-space: pre;">15</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> > </div>
                    </div>
                    <div>
                        <div style="white-space: pre;">2</div>
                        <div style="white-space: pre;">4</div>
                        <div style="white-space: pre;">8</div>
                        <div style="white-space: pre;">15</div>
                        <div style="white-space: pre;">30</div>
                        <div style="white-space: pre;">30</div>
                    </div>
                    <div>
                        <div style="white-space: pre;">   Very Soft</div>
                        <div style="white-space: pre;">   Soft</div>
                        <div style="white-space: pre;">   Firm</div>
                        <div style="white-space: pre;">   Stiff</div>
                        <div style="white-space: pre;">   Very Stiff</div>
                        <div style="white-space: pre;">   Hard</div>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex: 0.8; flex-direction: column; border-left: 1px solid #000">
                <div style="display: flex; align-items: center; justify-content: center; height: 2em; border-bottom: 1px solid #000;">Non Cohesive Soil (N)</div>
                <div style="display: flex; flex-direction: row; padding: 5px;">
                    <div style="text-align: right;">
                        <div style="white-space: pre;"> 0</div>
                        <div style="white-space: pre;"> 4</div>
                        <div style="white-space: pre;">10</div>
                        <div style="white-space: pre;">30</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> - </div>
                        <div style="white-space: pre;"> > </div>
                    </div>
                    <div>
                        <div style="white-space: pre;">4</div>
                        <div style="white-space: pre;">10</div>
                        <div style="white-space: pre;">30</div>
                        <div style="white-space: pre;">50</div>
                        <div style="white-space: pre;">50</div>
                    </div>
                    <div>
                        <div style="white-space: pre;">   Very Loose</div>
                        <div style="white-space: pre;">   Loose</div>
                        <div style="white-space: pre;">   Medium Dense</div>
                        <div style="white-space: pre;">   Dense</div>
                        <div style="white-space: pre;">   Very Dense</div>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
                <div style="display: flex; flex-direction: column; flex: 1;">Contractor: </div>
                <div style="display: flex; flex-direction: column; flex: 1;">Date Started: </div>
                <div style="display: flex; flex-direction: column; flex: 1;">Date Finished: </div>
            </div>
            <div style="display: flex; flex: 1; flex-direction: column; border-left: 1px solid #000; padding: 5px;">
                <div style="display: flex; flex-direction: column; flex: 1;">Logged by: </div>
                <div style="display: flex; flex-direction: column; flex: 1;">Checked by: </div>
                <div style="display: flex; flex-direction: column; flex: 1;">Date: </div>
            </div>
        </div>
        `
    )
}