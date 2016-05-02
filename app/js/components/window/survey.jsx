'use strict';

var React               = require('react');
var Reflux              = require('reflux');

var SurveyActions       = require('js/actions/survey');
var EmpireRPCActions    = require('js/actions/rpc/empire');
var WindowActions       = require('js/actions/window');

var SurveyRPCStore      = require('js/stores/rpc/survey');


var SurveyWindow = React.createClass({
    statics : {
        options : {
            title   : 'Survey',
            width   : 450,
            height  : 500
        }
    },

    mixins : [
        Reflux.connect(SurveyRPCStore,  'surveyRPCStore')
    ],

    closeWindow : function() {
        WindowActions.windowCloseByType('survey');
    },

    handleRadioChange : function(e) {
        var choice = e.currentTarget.value;
        SurveyActions.surveyUpdateChoice(choice);
    },

    handleTextAreaChange : function(e) {
        var comment = this.refs.comment.value;
        SurveyActions.surveyUpdateComment(comment);
    },

    handleSubmitButton : function() {
        EmpireRPCActions.requestEmpireRPCSetSurvey( {
            choice :    this.state.surveyRPCStore.choice,
            comment :   this.state.surveyRPCStore.comment
        });
        WindowActions.windowCloseByType('survey');
    },

    render : function() {
        return (
            <div>
              <p>Dear player,</p>

              <p>In 2010 Lacuna Expanse Corp created this addictive multiplayer game that allows people to enjoy 
              themselves by playing cooperatively against the AI or against each other, participating in the 
              open-source development, and chatting all day long.</p>

              <p>TLE's design worked well in its early stages but who knew that it would run for nearly six years 
              and gain thousands of players? This is the reason why we are facing a challenge to rework mechanics 
              in order to scale better with large numbers of players and to introduce a better balance of power 
              between low and high level empires. After careful planning we came to the conclusion that this 
              undertaking requires a reboot to wipe the current state of game. This gives us the opportunity to 
              improve the game by fixing persistent issues and by adding new features.</p>

              <p>At this point it must be pointed out that TLE has remained a niche game that is free-to-play and must 
              pay for itself to keep the servers running. For this purpose we gave you a means of funding the game 
              by purchasing Essentia but the economy requires an overhaul too. Though the reboot makes sense only 
              if a sufficient number of players wants to populate and support the new Expanse.</p>

              <p>For this reason we are asking you to fill in the following survey.</p>

              <div className="ui form">
                <div className="grouped fields">
                  <label for="survey">Please choose:</label>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="1" ref="choice" onChange={this.handleRadioChange}
                        checked={this.state.surveyRPCStore.choice === 1}
                      />
                      <label>Yes! I will play in the reboot.</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="2" ref="choice" onChange={this.handleRadioChange}
                        checked={this.state.surveyRPCStore.choice === 2}
                      />
                      <label>No. If there is a reboot I will quit.</label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="ui radio checkbox">
                      <input type="radio" name="survey" value="3" ref="choice" onChange={this.handleRadioChange}
                        checked={this.state.surveyRPCStore.choice === 3}
                      />
                      <label>Yes. I will play in the reboot if (insert comment below)</label>
                    </div>
                  </div>
                  <div className="field">
                    <label>Comment:</label>
                    <textarea rows="2" ref="comment" onChange={this.handleTextAreaChange} >{this.state.surveyRPCStore.comment}</textarea>
                  </div>
                </div>
                <div className="ui button" onClick={this.handleSubmitButton}><span>Submit</span></div>
              </div>

            </div>
        );
    }
});

module.exports = SurveyWindow;
