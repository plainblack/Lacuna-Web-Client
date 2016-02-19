'use strict';

var React    = require('react');

var Tabber   = require('js/components/tabber');
var Tab      = Tabber.Tab;

var DrainTab = require('js/components/buildings/essentiaVein/drainTab');

var essentiaVein = function(building) {
    if (building.drain_capable && building.drain_capable > 0) {
        return [(
            <Tab title="Drain" key="Drain">
                <DrainTab building={building} />
            </Tab>
        )];
    } else {
        return [];
    }
};

module.exports = essentiaVein;
