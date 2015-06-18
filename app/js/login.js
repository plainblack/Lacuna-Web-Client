'use strict';

var UserActions = require('js/actions/user');

YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Login == "undefined" || !YAHOO.lacuna.Login) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Cookie = Util.Cookie,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Login = function() {
        this.id = "login";
        this.createEvent("onLoginSuccessful");

        var container = document.createElement("div");
        container.id = this.id;
        Dom.addClass(container, "hidden");

        // currently have to turn off autocomplete.  Firefox asks to
        // remember login but is unable to fill in the saved values later.
        container.innerHTML = [
        '    <div class="hd">Login</div>',
        '    <div class="bd">',
        '        <div class="loginWrapper">',
        '            <div class="loginMain">',
        '                <form id="loginForm" name="loginForms" autocomplete="off">',
        '                    <ul>',
        '                        <li><label for="loginName">Empire Name</label><input type="text" id="loginName" /></li>',
        '                        <li><label for="loginPass">Password</label><input type="password" id="loginPass"  /></li>',
        '                        <li><label for="loginRemember">Remember Empire?</label><input type="checkbox" id="loginRemember" /> <button type="submit">Login</button></li>',
        '                    </ul>',
        '                    <ul class="loginExtras">',
        '                        <li><a id="loginReset" href="#">Forgotten your password?</a></li>',
        '                    </ul>',
        '                </form>',
        '            </div>',
        '            <div class="loginCreate">',
        '                <ul>',
        '                    <li><strong>Have a Facebook account?</strong></li>',
        '                    <li>Log in or Create Empire</li>',
        '                    <li><a href="/facebook/authorize"><img src="' + Lib.AssetUrl + 'ui/web/facebook-login-button.png" /></a></li>',
        '                </ul>',
        '                <hr />',
        '                <ul>',
        '                    <li><strong>Don\'t have an account?</strong></li>',
        '                    <li><button id="loginCreate" type="button">Create an Empire</button></li>',
        '                </ul>',
        '            </div>',
        '        </div>',
        '        <div style="border-top:1px solid #52ACFF;padding:15px 5px;text-align:center;">',
        '            New to the Lacuna Expanse?  Want to find out more before signing up? <a href="http://www.lacunaexpanse.com" target="_blank">Click here.</a>',
        '        </div>',
        '    </div>'
        ].join('');
        document.body.insertBefore(container, document.body.firstChild);
        Dom.addClass(container, "nofooter");

        this.Dialog = new YAHOO.widget.Panel(this.id, {
            constraintoviewport:true,
            fixedcenter:true,
            visible:false,
            draggable:false,
            effect:Game.GetContainerEffect(),
            modal:false,
            close:false,
            width:"650px",
            underlay:false,
            zIndex:9999
        });
        this.Dialog.renderEvent.subscribe(function(){
            //get el's after rendered
            this.elName = Dom.get("loginName");
            this.elPass = Dom.get("loginPass");
            this.elCreate = Dom.get("loginCreate");
            this.elRemember = Dom.get("loginRemember");
            this.elForm = Dom.get("loginForm");
            this.elCreate = Dom.get("loginCreate");
            this.elReset = Dom.get("loginReset");

            Event.addListener(this.elCreate, "click", function(e){Event.stopEvent(e);this.createEmpire();}, this, true);
            Event.addListener(this.elReset, "click", function(e){Event.stopEvent(e);this.resetPassword();}, this, true);
            Event.addListener(this.elForm, "submit", function(e){Event.stopEvent(e);this.handleLogin();}, this, true);
            Dom.removeClass(this.id, Lib.Styles.HIDDEN);
        }, this, true);

        this.Dialog.render();
        Game.OverlayManager.register(this.Dialog);
    };
    Login.prototype = {
        handleLogin : function() {
            require('js/actions/menu/loader').show();
            this.setMessage("");
            var EmpireServ = Game.Services.Empire;
            EmpireServ.login({name:this.elName.value, password:this.elPass.value, api_key:Lib.ApiKey},{
                success : function(o){
                    YAHOO.log(o, "info", "Login.handleLogin.success");
                    //clear the session just in case
                    Game.RemoveCookie("session");

                    if(this.elRemember.checked) {
                        var now = new Date();
                        Cookie.set("lacunaEmpireName", this.elName.value, {
                            domain: Game.domain,
                            expires: new Date(now.setFullYear(now.getFullYear() + 1))
                        });
                    }
                    else {
                        Cookie.remove("lacunaEmpireName");
                    }

                    this.fireEvent("onLoginSuccessful",o);
                    UserActions.signIn({
                        name: this.elName.value,
                        password: this.elPass.value
                    });

                    this.elForm.reset();
                    this.hide();
                },
                failure : function(o){
                    if(o.error.code == 1100) {
                        //haven't founded empire yet so take them to species
                        this.hide();
                        this.initEmpireCreator();
                        Game.OverlayManager.hideAll();
                        Game.SpeciesCreator.show(o.error.data.empire_id);
                    }
                    else if(o.error.code == 1200) {
                        alert(o.error.message);
                        window.location = o.error.data;
                    }
                    else {
                        this.setMessage(o.error.message || "There was a problem logging in.  Please try again.");
                    }
                    return true;
                },
                scope:this
            });
        },
        show : function(error) {
            if(!this.Dialog.cfg.getProperty("visible")) {
                Game.OverlayManager.hideAll();
                this.elForm.reset();
                this.Dialog.show();
                var str = Cookie.get("lacunaEmpireName");
                if(str) {
                    this.elName.value = str;
                    this.elRemember.checked = true;
                    this.elPass.focus();
                }
                else {
                    this.elName.focus();
                }
                if(error) {
                    this.setMessage(error.message);
                }
            }
        },
        hide : function() {
            if(this.elMessage) {
                Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
            }
            this.Dialog.hide();
        },
        setMessage : function(str) {
            if(!this.elMessage) {
                var d = document.createElement("div");
                d.id = "loginMessage";
                var eUl = this.elName.parentNode.parentNode;
                eUl.parentNode.insertBefore(d, eUl.nextSibling);
                this.elMessage = d;
            }
            if (str && str.length > 0) {
                Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
                this.elMessage.innerHTML = str;
            }
            else {
                Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
            }
        },
        initEmpireCreator : function() {
            if(!Game.EmpireCreator) {
                Game.EmpireCreator = new Lacuna.CreateEmpire(this);
                Game.EmpireCreator.subscribe("onCreateSuccessful",function(oArgs) {
                    this.fireEvent("onLoginSuccessful",oArgs);
                }, this, true);
            }
        },
        createEmpire : function() {
            this.hide(); //hide login
            this.initEmpireCreator();
            Game.OverlayManager.hideAll();
            Game.EmpireCreator.show();
        },
        resetPassword : function(reset_key) {
            this.hide(); //hide login
            if(!this.ResetPassword) {
                this.ResetPassword = new ResetPassword(this);
                this.ResetPassword.subscribe("onResetSuccessful",function(oArgs) {
                    this.fireEvent("onLoginSuccessful",oArgs);
                }, this, true);
            }
            Game.OverlayManager.hideAll();
            if (reset_key) {
                this.ResetPassword.showReset(reset_key);
            }
            else {
                this.ResetPassword.show(this.elName.value);
            }
        }
    };
    Lang.augmentProto(Login, Util.EventProvider);

    var ResetPassword = function(Login) {
        this.createEvent("onResetSuccessful");
        this._login = Login;

        this.emailId = "resetPasswordEmail";

        var emailContainer = document.createElement("div");
        emailContainer.id = this.emailId;
        Dom.addClass(emailContainer, "hidden");
        emailContainer.innerHTML = [
        '    <div class="hd">Reset Password</div>',
        '    <div class="bd">',
        '        <form id="resetEmailForm" name="resetEmailForm">',
        '            <p>',
        '                Enter either your empire name, or the email address used on the account.  You will be sent an email with instructions for resetting your password.',
        '            </p>',
        '            <ul>',
        '                <li><label for="resetEmpireName">Empire Name</label><input type="text" id="resetEmpireName" /></li>',
        '                <li><label for="resetEmail">Email</label><input type="text" id="resetEmail" /></li>',
        '                <li><a href="#" id="resetShowKey">Already have a reset key?</a></li>',
        '            </ul>',
        '        </form>',
        '    </div>',
        '    <div class="ft"></div>'
        ].join('');
        document.body.insertBefore(emailContainer, document.body.firstChild);

        this.EmailDialog = new YAHOO.widget.Dialog(this.emailId, {
            constraintoviewport:true,
            fixedcenter:true,
            visible:false,
            draggable:false,
            effect:Game.GetContainerEffect(),
            modal:true,
            close:true,
            width:"400px",
            underlay:false,
            zIndex:9999,
            buttons:[
                {text:"Send Reset Email", handler:function(){this.submit();}, isDefault: true},
                {text:"Cancel", handler:function(){this.cancel();}}
            ],
            hideaftersubmit: false,
            postmethod: "manual"
        });
        this.EmailDialog.renderEvent.subscribe(function(){
            this.elName = Dom.get("resetEmpireName");
            this.elEmail = Dom.get("resetEmail");

            Event.on('resetShowKey', 'click', function(e){this.showReset();}, this, true);
            Dom.removeClass(this.emailId, Lib.Styles.HIDDEN);
        }, this, true);
        this.EmailDialog.submitEvent.subscribe(this.sendEmail, this, true);
        this.EmailDialog.cancelEvent.subscribe(this.hide, this, true);
        this.EmailDialog.render();
        Game.OverlayManager.register(this.EmailDialog);

        this.resetId = "resetPasswordKey";

        var resetContainer = document.createElement("div");
        resetContainer.id = this.resetId;
        Dom.addClass(resetContainer, "hidden");
        resetContainer.innerHTML = [
        '    <div class="hd">Reset Password</div>',
        '    <div class="bd">',
        '        <form id="resetForm" name="resetForm">',
        '            <p>',
        '                Enter the reset key you have received in your email, along with what you would like your password set to.',
        '            </p>',
        '            <ul>',
        '                <li><label for="resetKey">Reset Key</label><input maxlength="36" type="text" id="resetKey" /></li>',
        '                <li><label for="resetPassword1">Password</label><input type="password" id="resetPassword1" /></li>',
        '                <li><label for="resetPassword2">Confirm Password</label><input type="password" id="resetPassword2" /></li>',
        '            </ul>',
        '        </form>',
        '    </div>',
        '    <div class="ft"></div>'
        ].join('');
        document.body.insertBefore(resetContainer, document.body.firstChild);

        this.ResetDialog = new YAHOO.widget.Dialog(this.resetId, {
            constraintoviewport:true,
            fixedcenter:true,
            visible:false,
            draggable:false,
            modal:true,
            close:true,
            width:"450px",
            underlay:false,
            zIndex:9999,
            buttons:[
                {text:"Reset Password", handler:function(){this.submit();}, isDefault: true},
                {text:"Cancel", handler:function(){this.cancel();}}
            ],
            hideaftersubmit: false,
            postmethod: "manual"
        });
        this.ResetDialog.renderEvent.subscribe(function(){
            this.elKey = Dom.get("resetKey");
            this.elPassword1 = Dom.get("resetPassword1");
            this.elPassword2 = Dom.get("resetPassword2");

            Dom.removeClass(this.resetId, Lib.Styles.HIDDEN);
        }, this, true);
        this.ResetDialog.submitEvent.subscribe(this.resetPassword, this, true);
        this.ResetDialog.cancelEvent.subscribe(this.hide, this, true);
        this.ResetDialog.render();
        Game.OverlayManager.register(this.ResetDialog);
    };
    ResetPassword.prototype = {
        show : function(empire_name) {
            this.elName.value = empire_name ? empire_name : '';
            this.elEmail.value = '';
            this.EmailDialog.getButtons()[0].disabled = false;
            this.EmailDialog.show();
        },
        hide : function() {
            this.EmailDialog.hide();
            this.ResetDialog.hide();
            this._login.show();
        },
        sendEmail : function() {
            var empireName = this.elName.value;
            var email = this.elEmail.value;
            var data = {};
            if (empireName.length > 0) {
                data.empire_name = empireName;
            }
            if (email.length > 0) {
                data.email = email;
            }
            this.EmailDialog.getButtons()[0].disabled = true;
            require('js/actions/menu/loader').show();
            Game.Services.Empire.send_password_reset_message(data,{
                success: function(o) {
                    YAHOO.log(o, "info", "ResetPassword.sendEmail.success");
                    require('js/actions/menu/loader').hide();
                    this.showReset();
                },
                failure: function(o) {
                    this.EmailDialog.getButtons()[0].disabled = false;
                },
                scope: this
            });
        },
        showReset : function(reset_key) {
            if (reset_key) {
                this.elKey.value = reset_key;
            }
            else {
                this.elKey.value = '';
            }
            this.elPassword1.value = '';
            this.elPassword2.value = '';
            this.EmailDialog.hide();
            this.ResetDialog.show();
        },
        resetPassword : function() {
            var reset_key = this.elKey.value;
            var password1 = this.elPassword1.value;
            var password2 = this.elPassword2.value;
            if (password1 != password2) {
                alert("Passwords do not match!");
            }
            else {
                require('js/actions/menu/loader').show();
                Game.Services.Empire.reset_password({
                    reset_key: reset_key,
                    password1: password1,
                    password2: password2,
                    api_key:Lib.ApiKey
                },{
                    success: function(o) {
                        YAHOO.log(o, "info", "ResetPassword.resetPassword.success");
                        require('js/actions/menu/loader').hide();
                        this.fireEvent('onResetSuccessful', o);
                        this.hide();
                    },
                    scope: this
                });
            }
        }
    };
    Lang.augmentProto(ResetPassword, Util.EventProvider);

    Lacuna.Login = Login;
})();
YAHOO.register("login", YAHOO.lacuna.Login, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
