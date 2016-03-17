'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var Tabber                  = require('js/components/tabber');
var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var ProductionTab           = require('js/components/windows/building/productionTab');
var RepairTab               = require('js/components/windows/building/repairTab');

var StandardTabsMixin = {

    tabs : function(options) {
        var tabs = [];
        
        if (options.efficiency !== 100) {
            tabs.push(
                <Tab title="Repair" key="Repair" onSelect={this.loadProduction}>
                    <RepairTab />
                </Tab>
            );
        }

        tabs.push(
            <Tab title="Production" key="Production" onSelect={this.loadProduction}>
                <ProductionTab />
            </Tab>
        );

        return tabs;
    }
};

module.exports = StandardTabsMixin;
