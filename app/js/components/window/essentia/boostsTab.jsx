'use strict';

var React                   = require('react');
var Reflux                  = require('reflux');

var EmpireRPCStore          = require('js/stores/rpc/empire');
var BoostsEmpireRPCStore    = require('js/stores/rpc/empire/boosts');

var Boost                   = require('js/components/window/essentia/boost');

var BoostsTab = React.createClass({
    mixins : [
        Reflux.connect(EmpireRPCStore, 'empireStore'),
        Reflux.connect(BoostsEmpireRPCStore, 'boostsStore'),
    ],

    render : function() {
        return (
            <div className="ui grid">

                <div className="centered row">
                    <div className="ui large green labels">
                        <div className="ui label">
                            Essentia
                            <div className="detail">
                                {this.state.empireStore.exactEssentia}
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
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="water"
                            description="+25% Water / hr"
                            iconName="theme"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="happiness"
                            description="+25% Happiness / hr"
                            iconName="smile"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="building"
                            description="+25% Building Construction Speed"
                            iconName="building outline"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                    </div>

                    <div className="eight wide column">
                        <Boost
                            type="ore"
                            description="+25% Ore / hr"
                            iconName="diamond"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="energy"
                            description="+25% Energy / hr"
                            iconName="lightning"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="storage"
                            description="+25% Storage"
                            iconName="archive"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                        <Boost
                            type="spy_training"
                            description="+50% Spy Training Speed"
                            iconName="protect"
                            boosts={this.state.boostsStore}
                            essentia={this.state.empireStore.essentia}
                        />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = BoostsTab;
