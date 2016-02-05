'use strict';

var React = require('react');
var Reflux = require('reflux');

var NotesActions = require('js/actions/window/notes');

var NotesWindowStore = require('js/stores/window/notes');
var NotesRPCStore = require('js/stores/rpc/body/notes');

var Panel = require('js/components/panel');

var NotesWindow = React.createClass({
    mixins: [
        Reflux.connect(NotesWindowStore, 'show'),
        Reflux.connect(NotesRPCStore, 'notes')
    ],
    handleClose: function() {
        NotesActions.save();
        NotesActions.hide();
    },
    handleChange: function(e) {
        NotesActions.set(e.target.value);
    },
    render: function() {
        return (
            <Panel show={this.state.show} onClose={this.handleClose} title="Notes">
                <div className="ui attached info message">
                    <i className="info icon"></i>
                    Closing this window will save your notes.
                </div>
                <form className="ui form">
                    <div className="field">
                        <textarea
                            value={this.state.notes}
                            onChange={this.handleChange}
                            style={{
                                height: '450px'
                            }}>
                        </textarea>
                    </div>
                </form>
            </Panel>
        );
    }
});

module.exports = NotesWindow;
