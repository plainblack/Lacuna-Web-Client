'use strict';

var React          = require('react');
var Reflux         = require('reflux');

var EmpireRPCStore = require('js/stores/rpc/empire');

var Boost          = require('js/components/windows/essentia/boost');

var BoostsTab = React.createClass({
    mixins : [
        Reflux.connect(EmpireRPCStore, 'empire')
    ],

    render : function() {
        return (
            <div className="ui grid">

                <div className="centered row">
                    <div className="ui large green labels">
                        <div className="ui label">
                            Essentia
                            <div className="detail">
                                {this.state.empire.exactEssentia}
                            </div>
                        </div>
                        <div className="ui label">
                            Boost Cost
                            <div className="detail">
                                5 Essentia
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ui centered row">
                    <div className="eight wide column">
                        <Boost
                            type="food"
                            description="+25% Food / hr"
                            iconName="food"
                        />
                        <Boost
                            type="water"
                            description="+25% Water / hr"
                            iconName="theme"
                        />
                        <Boost
                            type="happiness"
                            description="+25% Happiness / hr"
                            iconName="smile"
                        />
                        <Boost
                            type="building"
                            description="+25% Building Construction Speed"
                            iconName="building outline"
                        />
                    </div>

                    <div className="eight wide column">
                        <Boost
                            type="ore"
                            description="+25% Ore / hr"
                            iconName="diamond"
                        />
                        <Boost
                            type="energy"
                            description="+25% Energy / hr"
                            iconName="lightning"
                        />
                        <Boost
                            type="storage"
                            description="+25% Storage"
                            iconName="archive"
                        />
                        <Boost
                            type="spy_training"
                            description="+50% Spy Training Speed"
                            iconName="protect"
                        />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BoostsTab;
