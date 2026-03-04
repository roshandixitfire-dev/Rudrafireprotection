import React from 'react'

interface ClientAssetsFieldsProps {
    getInit: (key: string) => any
}

export default function ClientAssetsFields_Backup({ getInit }: ClientAssetsFieldsProps) {
    return (
        <>
            <hr className="divider" />
            <h3>Site & Building Details</h3>
            <div className="form-row">
                <div className="form-group"><label>Wing</label><input name="wing" defaultValue={getInit('wing')} /></div>
                <div className="form-group"><label>Floor</label><input name="floorCount" defaultValue={getInit('floor_count')} /></div>
                <div className="form-group"><label>Basement</label><input name="basement" defaultValue={getInit('basement')} /></div>
                <div className="form-group"><label>Podium</label><input name="podiumCount" defaultValue={getInit('podium_count')} /></div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>System Type</label>
                    <select name="systemType" defaultValue={getInit('system_type')}>
                        <option value="">Select Type</option>
                        <option value="Down Comer">Down Comer</option>
                        <option value="Hydrant">Hydrant</option>
                        <option value="Hydrant & Sprinkler">Hydrant & Sprinkler</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Alarm System</label>
                    <select name="alarmSystem" defaultValue={getInit('alarm_system')}>
                        <option value="N/A">N/A</option>
                        <option value="Conventional">Conventional</option>
                        <option value="PA">PA</option>
                        <option value="Addressable">Addressable</option>
                    </select>
                </div>
            </div>

            <hr className="divider" />
            <h3>Fire Safety Assets (Counts)</h3>
            <div className="form-row">
                <div className="form-group"><label>Hydrant Pumps</label><input type="number" name="hydrantPumps" defaultValue={getInit('hydrant_pumps')} /></div>
                <div className="form-group"><label>Sprinkler Pumps</label><input type="number" name="sprinklerPumps" defaultValue={getInit('sprinkler_pumps')} /></div>
                <div className="form-group"><label>Jockey Pumps</label><input type="number" name="jockeyPumps" defaultValue={getInit('jockey_pumps')} /></div>
                <div className="form-group"><label>Booster Pumps</label><input type="number" name="boosterPumps" defaultValue={getInit('booster_pumps')} /></div>
                <div className="form-group"><label>Standby Pumps</label><input type="number" name="standbyPumps" defaultValue={getInit('standby_pumps')} /></div>
            </div>
            <div className="form-row">
                <div className="form-group"><label>Hose Boxes</label><input type="number" name="hoseBoxes" defaultValue={getInit('hose_boxes')} /></div>
                <div className="form-group"><label>Short Branch Pipe</label><input type="number" name="shortBranchPipes" defaultValue={getInit('short_branch_pipes')} /></div>
                <div className="form-group"><label>Courtyard Valve Type</label>
                    <select name="courtyardHydrantValves" defaultValue={getInit('courtyard_hydrant_valves')}>
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group"><label>Extinguisher ABC</label><input type="number" name="fireExtinguisherAbc" defaultValue={getInit('fire_extinguisher_abc')} /></div>
                <div className="form-group"><label>Extinguisher CO2</label><input type="number" name="fireExtinguisherCo2" defaultValue={getInit('fire_extinguisher_co2')} /></div>
                <div className="form-group"><label>Expiry Date</label><input type="date" name="extinguisherExpiryDate" defaultValue={getInit('extinguisher_expiry_date')} /></div>
            </div>
        </>
    )
}
