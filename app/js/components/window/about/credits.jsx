'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var _               = require('lodash');

var CreditsRPCStore = require('js/stores/rpc/stats/credits');

var CreditsSection  = require('js/components/window/about/creditsSection');


var CreditsTab = React.createClass({

    mixins: [
        Reflux.connect(CreditsRPCStore, 'credits')
    ],

    render: function() {
        return (
            <div>
                <h1>
                    Credits
                </h1>

                {
                    _.map(this.state.credits, function(names, header) {
                        return (
                            <CreditsSection
                                key={header}
                                header={header}
                                names={names}
                            />
                        );
                    })
                }
            </div>
        );
    }
});

module.exports = CreditsTab;
