'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var Tabber                  = require('js/components/tabber');
var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var ProductionTab           = require('js/components/window/building/productionTab');
var RepairTab               = require('js/components/window/building/repairTab');

var StandardTabs = {

    tabs : function(options, building) {
        var tabs = [];
        
        if (building.efficiency !== 100 && building.id) {
            tabs.push(
                <Tab title="Repair" key="Repair">
                    <RepairTab building={building} />
                </Tab>
            );
        }

        tabs.push(
            <Tab title="Production" key="Production">
                <ProductionTab building={building} />
            </Tab>
        );

        return tabs;
    }
};

module.exports = StandardTabs;
