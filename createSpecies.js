YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateSpecies == "undefined" || !YAHOO.lacuna.CreateSpecies) {
	
(function(){
	var Util = YAHOO.util,
		Dom = Util.Dom,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;

	var CreateSpecies = function(Empire) {
		this.id = "createSpecies";
		this._empire = Empire;
		
		var container = document.createElement("div");
		container.id = this.id;
		Dom.addClass(container, "hidden");
		container.innerHTML = [
		'	<div class="hd">Create Species</div>',
		'	<div class="bd">',
		'		<form name="speciesForm">',
		'			<ul>',
		'				<li><label for="speciesName">User</label><input type="text" id="speciesName" /></li>',
		'				<li><label for="speciesDesc">Description</label><input type="text" id="speciesDesc" /></li>',
		'				<li><label>Habitable Orbits</label>',
		'					<div id="speciesHO_bg" title="Habitable Orbits Selector">',
		'						<div id="speciesHO_min_thumb"><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'						<div id="speciesHO_max_thumb"><img src="http://yui.yahooapis.com/2.8.0r4/build/slider/assets/thumb-n.gif" style="width:15px;height:21px;"></div>',
		'					</div>',
		'				</li>',
		'				<li><label>Affinities</lable></li>',
		'				<li><label for="speciesConst">Construction</label><select id="speciesConst"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesDecep">Deception</label><select id="speciesDecep"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesRes">Research</label><select id="speciesRes"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesMan">Management</label><select id="speciesMan"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesFarm">Farming</label><select id="speciesFarm"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesMine">Mining</label><select id="speciesMine"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesSci">Science</label><select id="speciesSci"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesEnv">Environmental</label><select id="speciesEnv"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesPoli">Political</label><select id="speciesPoli"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesTrade">Trade</label><select id="speciesTrade"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'				<li><label for="speciesGrowth">Growth</label><select id="speciesGrowth"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></li>',
		'			</ul>',
		'			<div id="speciesMessage" class="hidden"></div>',
		'		</form>',
		'	</div>',
		'	<div class="ft"></div>'
		].join('');
		document.body.insertBefore(container, document.body.firstChild);
		
		
		this.Dialog = new YAHOO.widget.Dialog(this.id, {
			constraintoviewport:true,
			fixedcenter:true,
			postmethod:"none",
			visible:false,
			buttons:[ { text:"Create", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
				{ text:"Cancel", handler:{fn:this.handleCancel, scope:this}}],
			draggable:false,
			close:false,
			width:"300px",
			zIndex:9999
		});
		this.Dialog.renderEvent.subscribe(function(){
			//get el's after rendered
			this.elName = Dom.get("speciesName");
			this.elDesc = Dom.get("speciesDesc");
			this.elMessage = Dom.get("speciesMessage");
			
			Dom.removeClass(this.id, Game.Styles.HIDDEN);
		}, this, true);
		this.Dialog.render();
	};
	CreateSpecies.prototype = {
		handleCreate : function() {
			var SC = Game.SpeciesCreator,
				SpeciesServ = Game.Services.Species,
				data = {
					name: this.elName.value,
					password: this.elPass.value,
					password1: this.elPassConfirm.value,
					species_id: this.elSpecies.value
				};
				
			SpeciesServ.is_name_available({name:data.name}, {
				success : function(o) {
					console.log(o);
					if(o.result == 1) {
						SpeciesServ.create(data,{
							success : function(o){
								console.log(o);
								Game.Setup(o.result);
								SC.hide();
							},
							failure : function(o){
								console.log(o);
								SC.setMessage(o.error.message);
							},
							timeout:5000
						});
					}
					else {
						SC.setMessage("Species name is unavailable.  Please choose another.");
					}
				},
				failure : function(o) {
					console.log(o);
					SC.setMessage(o.error.message);
				},
				timeout:5000
			});
			
		},
		handleCancel : function() {
			this.hide();
			this._empire.show();
		},
		setMessage : function(str) {
			Dom.removeClass(this.elMessage, "hidden");
			this.elMessage.innerHTML = str;
		},
		show : function() {
			this.Dialog.show();
			if(!this._slidersCreated) {
				this._createSliders();
			}
		},
		hide : function() {
			this.elName.value = "";
			this.elDesc.value = "";
			Dom.addClass(this.elMessage, "hidden");
			this.Dialog.hide();
		},
		_createSliders : function() {
			this._createHabitableOrbits();
			this._slidersCreated = true;
		},
		_createHabitableOrbits : function () {
			var range = 210;
			var tickSize = 15;

			// Create the DualSlider
			var slider = YAHOO.widget.Slider.getHorizDualSlider("speciesHO_bg",
				"speciesHO_min_thumb", "speciesHO_max_thumb",
				range, tickSize);

			/*var report = function () {
				reportSpan.innerHTML = slider.minVal + ' - ' + slider.maxVal;
				// Call our conversion function
				calculatedSpan.innerHTML =
				calculatedSpan.className = slider.getStatus();
			};*/

			// Attach the slider to the YAHOO.example namespace for public probing
			this.sliderHO = slider;

		}
	};

	Lacuna.CreateSpecies = CreateSpecies;
})();
YAHOO.register("createSpecies", YAHOO.lacuna.CreateSpecies, {version: "1", build: "0"}); 

}