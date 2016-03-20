'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var GenericBuildingStore    = require('js/stores/genericBuilding.js');
var BodyRPCStore            = require('js/stores/rpc/body');

var WindowActions           = require('js/actions/window');
var BuildingWindowActions   = require('js/actions/windows/building');
var PoliticsTrainingRPCActions = require('js/actions/rpc/politicsTraining');

var StandardTabs            = require('js/components/window/building/standardTabs');
var BuildingInformation     = require('js/components/window/building/information');
var SpyTrainingStatus       = require('js/components/window/spyTraining/spyTrainingStatus');
var Tabber                  = require('js/components/tabber');

var Tabs                    = Tabber.Tabs;
var Tab                     = Tabber.Tab;

var PoliticsTraining = React.createClass({
    statics : {
        options : {
            title   : 'Politics Training',
            width   : 700,
            height  : 420
        }
    },
    mixins : [
        Reflux.connect(GenericBuildingStore, 'genericBuildingStore'),
        Reflux.connect(BodyRPCStore, 'bodyStore')
    ],
    componentWillMount : function() {
        BuildingWindowActions.buildingWindowClear();
        PoliticsTrainingRPCActions.requestPoliticsTrainingRPCView( this.props.options.id );
    },

    closeWindow : function() {
        WindowActions.windowClose(PoliticsTraining);
    },

    render : function() {
        var building = this.state.genericBuildingStore;
        var tabs = StandardTabs.tabs(this.props.options, this.state.bodyStore, building);
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

module.exports = PoliticsTraining;
