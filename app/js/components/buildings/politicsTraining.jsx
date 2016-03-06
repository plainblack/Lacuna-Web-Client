'use strict';

var React             = require('react');

var Tabber            = require('js/components/tabber');
var Tab               = Tabber.Tab;

var SpyTrainingStatus = require('js/components/buildings/spyTraining/spyTrainingStatus');

var politicsTraining = function(building) {
    if (building.extraViewData.spies) {
        return [(
            <Tab title="Spy Training" key="Spy Training">
                <SpyTrainingStatus
                    inTraining={building.extraViewData.spies.in_training}
                    pointsPerHour={building.extraViewData.spies.points_per}
                    maxPoints={building.extraViewData.spies.max_points}
                />
            </Tab>
        )];
    }
};

module.exports = politicsTraining;
