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

{/*
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
*/}
              <p>Dear player,</p>
              <p>We have reworked the survey page, since it is no longer that applicable.  Instead a goodbye and if you want
                 to find out about any community projects, that info is included as well.</p>

              <a href="http://community.lacunaexpanse.com/forums/news/all-good-things" target="_blank">All Good Things</a>

              <p>The Lacuna Expanse will go offline as of October 1, 2016.</p>

              <p>We are keeping Lacuna alive for thes next couple of months so that you can spend down any remaining essentia,
                 and also so that you can gain a little closure as you complete your empires and say farewell to the friendships
                 you have formed through the game over the years.</p>

              <p>We would like to thank you for enriching this game with your presence and your participation. Eventhough The Lacuna Expanse
                 will be shut down by October 1st, we are fortunate that this game had become a community-driven open-source project which is
                 being developed by volunteers who are creating a spiritual successor!</p>

              <p>Therefore you are invited to "sign up to the newsletter" for&nbsp;<a href="http://kenoantigen.com" target="_blank">Keno Antigen</a>&nbsp;
                 that keeps you informed about progress of the current project called Kenó Antigen which is going to be an improved and enhanced game.
                 In addition you are welcome to help contribute to our game and client code that makes use of perl, html/javascript as found on Github:
                 <a href="https://github.com/Kantigen" target="_blank">Kantigen</a></p>

              <p>Another branch called Wolfsfriend Enterprises attempts to keep the current game alive. Contact them at nottaureell@gmail.com if you are interested.</p>

              <p>We are looking forward to see TLE players in Kantigen again! Spread the message wherever you can to attract more people to populate the game.</p>

              <p>I have not changed the survey below, but answering it will keep the popup from coming up again. ;) </p>
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
