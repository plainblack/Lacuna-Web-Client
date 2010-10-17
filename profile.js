YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Profile == "undefined" || !YAHOO.lacuna.Profile) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var Profile = function() {
		this.id = "profile";
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, Lib.Styles.HIDDEN);
		container.innerHTML = this._getHtml();
		document.body.insertBefore(container, document.body.firstChild);
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			postmethod:"none",
			buttons:[ { text:"Update", handler:{fn:this.handleUpdate, scope:this}, isDefault:true } ],
			visible:false,
			draggable:true,
			effect:Game.GetContainerEffect(),
			underlay:false,
			modal:true,
			close:true,
			width:"450px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			this.description = Dom.get("profileDescription");
			this.status = Dom.get("profileStatus");
			this.email = Dom.get("profileEmail");
			this.city = Dom.get("profileCity");
			this.country = Dom.get("profileCountry");
			this.skype = Dom.get("profileSkype");
			this.player_name = Dom.get("profilePlayerName");
			this.skipFacebook = Dom.get("profileSkipFacebookWallPosts");
			this.skipMedal = Dom.get("profileSkipMedal");
			this.skipHappiness = Dom.get("profileSkipHappiness");
			this.skipResource = Dom.get("profileSkipResource");
			this.skipPollution = Dom.get("profileSkipPollution");
			this.stopAnim = Dom.get("profileDisableDialogAnim");
			
			this.medals = Dom.get("profileMedalsList");
			this.species = Dom.get("profileSpecies");
			this.notes = Dom.get("profileNotes");
			this.sitter_password = Dom.get("profileSitterPassword");
			this.new_password = Dom.get("profileNewPassword");
			this.confirm_password = Dom.get("profileConfirmPassword");
			this.account_tab = Dom.get('detailsAccount');
			Event.on(this.sitter_password, 'focus', function() {
				this.type = 'text';
			});
			Event.on(this.sitter_password, 'blur', function() {
				this.type = 'password';
			});
			this.tabView = new YAHOO.widget.TabView("profileTabs");
			//species tab
			this.tabView.getTab(2).subscribe("activeChange", function(e) {
				if(e.newValue && !this.hasSpecies) {
					Game.Services.Empire.view_species_stats({session_id:Game.GetSession("")},{
						success : function(o){
							YAHOO.log(o, "info", "Profile.show.view_stats.success");
							this.populateSpecies(o.result);
							this.hasSpecies = true;
						},
						failure : function(o){
							YAHOO.log(o, "error", "Profile.show.view_stats.failure");
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
			}, this, true);
			this.tabView.set('activeIndex',0);
			Dom.removeClass(this.id, Lib.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
		Game.OverlayManager.register(this.Dialog);
	};
	Profile.prototype = {
		_getHtml : function() {
			return [
			'	<div class="hd">Profile</div>',
			'	<div class="bd">',
			'		<form name="profileForm" autocomplete="off">',
			'			<ul id="profileDetails">',
			'				<li><label style="vertical-align:top;" title="The publicly displayed description for your empire.">Description:</label><textarea id="profileDescription" cols="47"></textarea></li>',
			'				<li><label title="What are you doing right now?">Status:</label><input id="profileStatus" maxlength="100" size="50" /></li>',
			'			</ul>',				
			'			<div id="profileTabs" class="yui-navset">',
			'				<ul class="yui-nav">',
			'					<li><a href="#detailsPlayer"><em>Player</em></a></li>',
			'					<li><a href="#detailsMedals"><em>Medals</em></a></li>',
			'					<li><a href="#detailsSpecies"><em>Species</em></a></li>',
			'					<li><a href="#detailsNotes"><em>Notes</em></a></li>',
			'					<li><a href="#detailsAccount"><em>Account</em></a></li>',
			'				</ul>',
			'				<div class="yui-content" style="padding:0;">',
			'					<div id="detailsPlayer">',
			'						<ul id="profilePlayer">',
			'							<li><label>Name:<input id="profilePlayerName" /></label></li>',
			'							<li><label title="Your email is used to recover your password if it is lost, and to send you any unused essentia if you cancel your account.">Email:<input id="profileEmail" /></label></li>',
			'							<li><label>City:<input id="profileCity" /></label></li>',
			'							<li><label>Country:<input id="profileCountry" /></label></li>',
			'							<li><label>Skype:<input id="profileSkype" /></label></li>',
			'							<li><hr /><div class="yui-g">',
			'								<div class="yui-u first">',
			'									<ul><li><input id="profileSkipFacebookWallPosts" type="checkbox" /> Stop Facebook Wall posts</li>',
			'									<li><input id="profileSkipMedal" type="checkbox" /> Stop Medal Messages</li>',
			'									<li><input id="profileDisableDialogAnim" type="checkbox" /> Stop Dialog Animation</li></ul></div>',
			'								<div class="yui-u">',
			'									<ul><li><input id="profileSkipHappiness" type="checkbox" /> Stop Happiness Warnings</li>',
			'									<li><input id="profileSkipResource" type="checkbox" /> Stop Resource Warnings</li>',
			'									<li><input id="profileSkipPollution" type="checkbox" /> Stop Pollution Warnings</li></ul></div>',
			'							</div></li>',
			'						</ul>',
			'					</div>',
			'					<div id="detailsMedals">',
			'						<div>Select the medals to display on your profile :</div>',
			'						<ul id="profileMedalsList" style="height:300px;width:425px;overflow:auto;">',
			'						</ul>',
			'					</div>',
			'					<div id="detailsSpecies">',
			'						<ul id="profileSpecies">',
			'						</ul>',
			'					</div>',
			'					<div id="detailsNotes">',
			'						<textarea id="profileNotes" title="Write down anything you would like to store with your account."></textarea>',
			'					</div>',
			'					<div id="detailsAccount">',
			'						<ul>',
			'							<li><label title="The sitter password can be used to allow others to log in to your account to help you manage it, but doesn\'t allow access edit your profile or delete the account.">Sitter Password:<input id="profileSitterPassword" type="password" /></label></li>',
			'						</ul>',
			'						<hr />',
			'						<ul>',
			'							<li style="text-align: center; margin-bottom: 2px;">Change Account Password:</li>',
			'							<li><label>New Password:<input id="profileNewPassword" type="password" /></label></li>',
			'							<li><label>Confirm:<input id="profileConfirmPassword" type="password" /></label></li>',
			'						</ul>',
			'					</div>',
			'				</div>',
			'			</div>',
			'		</form>',
			'	</div>',
			'	<div class="ft"></div>'
			].join('');
		},
		handleUpdate : function() {
			var updatesLeft = 1;
			if (this.new_password.value != "") {
				if (this.new_password.value != this.confirm_password.value) {
					alert("Passwords don't match!");
					this.tabView.set('activeIndex', 4);
					this.confirm_password.focus();
					return;
				}
				else {
					updatesLeft++;
					Game.Services.Empire.change_password({
							session_id:Game.GetSession(""),
							password1:this.new_password.value,
							password2:this.confirm_password.value
						},{
						success : function(o){
							YAHOO.log(o, "info", "Profile.handleUpdate.password.success");
							Dom.removeClass(this.account_tab, 'password-changed');
							if (--updatesLeft == 0) {
								this.hide();
							}
						},
						failure : function(o){
							YAHOO.log(o, "error", "Profile.handleUpdate.password.failure");
							alert(o.error.message);
							this.tabView.set('activeIndex', 4);
							this.new_password.focus();
						},
						timeout:Game.Timeout,
						scope:this
					});
				}
			}
			
			var pmc = Sel.query("li", "profileMedalsList"),
				publicMedals = [];
			for(var i=0; i<pmc.length; i++){
				if(Sel.query('input[type="checkbox"]', pmc[i], true).checked) {
					publicMedals.push(pmc[i].MedalId);
				}
			}
			
			if(Game.GetCookie("disableDialogAnim","0") != (this.stopAnim.checked ? "1" : "0")) {
				var newEffect;
				if(this.stopAnim.checked) {
					Game.SetCookie("disableDialogAnim","1");
				}
				else {
					Game.RemoveCookie("disableDialogAnim");
					newEffect = Game.GetContainerEffect();
				}
				var cs = Game.OverlayManager.overlays;
				for(var i=0; i<cs.length; i++) {
					cs[i].cfg.setProperty("effect",newEffect);
				}
			}
			
			Game.Services.Empire.edit_profile({
					session_id:Game.GetSession(""),
					profile:{
						description:this.description.value,
						status_message:this.status.value,
						email:this.email.value,
						city:this.city.value,
						country:this.country.value,
						skype:this.skype.value,
						player_name:this.player_name.value,
						notes:this.notes.value,
						sitter_password:this.sitter_password.value,
						public_medals:publicMedals,
						skip_happiness_warnings:this.skipHappiness.checked ? 1 : 0,
						skip_resource_warnings:this.skipResource.checked ? 1 : 0,
						skip_pollution_warnings:this.skipPollution.checked ? 1 : 0,
						skip_medal_messages:this.skipMedal.checked ? 1 : 0,
						skip_facebook_wall_posts:this.skipFacebook.checked ? 1 : 0
					}
				},{
				success : function(o){
					YAHOO.log(o, "info", "Profile.handleUpdate.success");
					if (--updatesLeft == 0) {
						this.hide();
					}
				},
				failure : function(o){
					YAHOO.log(o, "error", "Profile.handleUpdate.failure");
					alert(o.error.message);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		show : function() {
			//this is called out of scope so make sure to pass the correct scope in
			Game.Services.Empire.view_profile({session_id:Game.GetSession("")},{
				success : function(o){
					YAHOO.log(o, "info", "Profile.show.view_profile.success");
					this.populateProfile(o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Profile.show.view_profile.failure");
				},
				timeout:Game.Timeout,
				scope:Lacuna.Profile
			});
			Game.OverlayManager.hideAll();
			Lacuna.Profile.tabView.set('activeIndex',0);
			Lacuna.Profile.Dialog.center();
			Lacuna.Profile.Dialog.show();
		},
		hide : function() {
			this.Dialog.hide();
		},
		
		populateProfile : function(results) {
			var p = results.profile;
			this.description.value = p.description;
			this.status.value = p.status_message;
			this.email.value = p.email;
			this.city.value = p.city;
			this.country.value = p.country;
			this.skype.value = p.skype;
			this.player_name.value = p.player_name;
			
			this.skipFacebook.checked = p.skip_facebook_wall_posts == "1";
			this.skipMedal.checked = p.skip_medal_messages == "1";
			this.skipHappiness.checked = p.skip_happiness_warnings == "1";
			this.skipResource.checked = p.skip_resource_warnings == "1";
			this.skipPollution.checked = p.skip_pollution_warnings == "1";
			this.stopAnim.checked = Game.GetCookie("disableDialogAnim","0") == "1";
			
			this.notes.value = p.notes;
			this.sitter_password.value = p.sitter_password;
			this.sitter_password.type = "password";
			this.new_password.value =
				this.confirm_password.value = "";
			Dom.removeClass(this.account_tab, 'password-changed');
	
			var frag = document.createDocumentFragment(),
				li = document.createElement('li');
			for(var id in p.medals) {
				if(p.medals.hasOwnProperty(id)) {	
					var medal = p.medals[id],
						nLi = li.cloneNode(false);
					
					Dom.addClass(nLi, "medal");
					nLi.MedalId = id;
					nLi.innerHTML = [
					'	<div class="medalPublic"><input type="checkbox"', (medal["public"] == "1" ? ' checked' : ''), ' /></div>',
					'	<div class="medalContainer">',
					'		<img src="',Lib.AssetUrl,'medal/',medal.image,'.png" alt="',medal.name,'" title="',medal.name,' on ',Lib.formatServerDate(medal.date),'" />',
					'	</div>'
					].join('');
						
					frag.appendChild(nLi);
				}
			}
			
			this.medals.innerHTML = "";
			this.medals.appendChild(frag);
			
			this.Dialog.center();
		},
		populateSpecies : function(results) {
			var stat = results.species,
				frag = document.createDocumentFragment(),
				li = document.createElement('li');
			 
			
			var nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Name</label>',
				'<span>', stat["name"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Description</label>',
				'<span>', stat["description"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Habitable Orbits</label>',
				'<span>', stat.min_orbit,
				stat.max_orbit > stat.min_orbit ? ' to '+ stat.max_orbit : '',
				'</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Manufacturing</label>',
				'<span>', stat["manufacturing_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Deception</label>',
				'<span>', stat["deception_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Research</label>',
				'<span>', stat["research_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Management</label>',
				'<span>', stat["management_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Farming</label>',
				'<span>', stat["farming_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Mining</label>',
				'<span>', stat["mining_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Science</label>',
				'<span>', stat["science_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Environmental</label>',
				'<span>', stat["environmental_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Political</label>',
				'<span>', stat["political_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Trade</label>',
				'<span>', stat["trade_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			nLi = li.cloneNode(false);
			nLi.innerHTML = [
				'<label>Growth</label>',
				'<span>', stat["growth_affinity"], '</span>'
			].join('');
			frag.appendChild(nLi);
			
			this.species.innerHTML = "";
			this.species.appendChild(frag);
		}
		
	};
	Lang.augmentProto(Profile, Util.EventProvider);
			
	Lacuna.Profile = new Profile();
})();
YAHOO.register("profile", YAHOO.lacuna.Profile, {version: "1", build: "0"}); 

}
