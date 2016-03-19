'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');

var WindowActions           = require('js/actions/window');
var IntelTrainingRPCActions = require('js/actions/rpc/intelTraining');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var SpyTrainingStatus       = require('js/components/buildings/spyTraining/spyTrainingStatus');
var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var IntelTraining = React.createClass({
    statics : {
        options : {
            title   : 'Intel Training',
            width   : 700,
            height  : 420
        }
    },
    mixins : [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore')
    ],
    componentWillMount : function() {
        IntelTrainingRPCActions.requestIntelTrainingRPCView( this.props.options.id );
    },

    closeWindow : function() {
        WindowActions.windowClose(IntelTraining);
    },

    render : function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options);
        if (building.extraViewData.spies) {
            tabs.push(
                <Tab title="Spy Training" key="Spy Training">
                    <SpyTrainingStatus
                        inTraining      = {building.extraViewData.spies.in_training}
                        pointsPerHour   = {building.extraViewData.spies.points_per}
                        maxPoints       = {building.extraViewData.spies.max_points}
                    />
                </Tab>
            );
        }

        return (
            <div>
                <BuildingInformation
                    options={this.props.options}
                />
                <div>
                    <Tabs>
                        {tabs}
                    </Tabs>
                </div>
            </div>
        );
    }
});

module.exports = IntelTraining;
