'use strict';

var React           = require('react');
var Draggable       = require('react-draggable');

var AboutTab        = require('js/components/window/about/aboutTab');
var CreditsTab      = require('js/components/window/about/creditsTab');

var StatsRPCActions = require('js/actions/rpc/stats');
var WindowActions   = require('js/actions/window');

var SurveyWindow = React.createClass({
    statics : {
        options : {
            title   : 'Survey',
            width   : 450,
            height  : 400
        }
    },

    closeWindow : function() {
        WindowActions.windowCloseByType('survey');
    },

    render : function() {
        return (
            <div>
              <p>The Lacuna Expanse (TLE) has been running for five years and there are many
              issues with the game that cannot be changed without a major change and a
              reboot (restart) of the game</p>

              <p>Also the current game is not generating enough revenue to pay the cost of
              the servers</p>

              <p>There are only two options, either TLE is shut down totally, or we try to
              regenerate the game by rebooting it with new features</p>
              <p>Please help us to decide what to do by filling in this survey</p>

              <div className="ui form">
                <div className="grouped fields">
                  <label for="survey">Please choose:</label>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="yes" />
                      <label>Yes! I will play in the reboot.</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="no" />
                      <label>No. If there is a reboot I will quit.</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="conditional" />
                      <label>Yes. I will play in the reboot if (insert comment below)</label>
                    </div>
                  </div>
                  <div className="field">
                    <label>Comment:</label>
                    <textarea rows="2"></textarea>
                  </div>
                </div>
              </div>

            </div>
        );
    }
});

module.exports = SurveyWindow;
