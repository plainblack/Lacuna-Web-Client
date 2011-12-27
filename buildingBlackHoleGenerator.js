YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.BlackHoleGenerator == "undefined" || !YAHOO.lacuna.buildings.BlackHoleGenerator) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Pager = YAHOO.widget.Paginator,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var BlackHoleGenerator = function(result){
		BlackHoleGenerator.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.BlackHoleGenerator;
	};
	
	Lang.extend(BlackHoleGenerator, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getTab()];
		},
		_getTab : function() {
            var tasks = this.result.tasks;

			this.tab = new YAHOO.widget.Tab({ label: "Singularity", content: [
				'<div id="singularity">',
				'   <div id="singularityTask">',
				'      Task ' + this.selectTask(tasks),
				'      Target <select id="singularityTargetType"><option value="body_name">Body Name</option><option value="body_id">Body Id</option><option value="xy">X,Y</option></select>',
				'      <span id="singularityTargetText"><input type="text" id="singularityTargetText" /></span>',
				'      <span id="singularityTargetXY" style="display:none;">X:<input size="5" type="text" id="singularityTargetX" /> Y:<input size="5" type="text" id="singularityTarget Y" /></span>',
				'      <span id="singularityNewType" style="display:none;">New Type:<input size="3" type="text" id="singularityNewType" /></span>',
				'      <button type="button" id="singularityGenerate">Generate</button>',
				'   </div>',
				'   <div id="singularityTaskInfo"></div>',
				'   <div id="singularityResult">',
				'   </div>',
				'</div>'
			].join('')});

			Event.on("singularityTargetType", "change", function(){
				if(Lib.getSelectedOptionValue(this) == "xy") {
					Dom.setStyle("singularityTargetText", "display", "none");
					Dom.setStyle("singularityTargetXY", "display", "");
				}
				else {
					Dom.setStyle("singularityTargetText", "display", "");
					Dom.setStyle("singularityTargetXY", "display", "none");
				}
			});
			Event.on("singularityTaskSelector", "change", function(){
				var task = Lib.getSelectedOptionValue(this);
				if(task == "Change Type") {
					Dom.setStyle("singularityNewType", "display", "");
				}
				else {
					Dom.setStyle("singularityNewType", "display", "none");
				}
				var taskInfo;
				for(var i=0; i<tasks.length; i++) {
					if (tasks[i]["name"] == task) {
						taskInfo = tasks[i];
						break;
					}
				}
				var div = Dom.get("singularityTaskInfo");
				div.innerHTML = '';
				if (taskInfo) {
					if (taskInfo["reason"] && taskInfo["reason"] != "Invalid reason.") {
						div.appendChild(document.createTextNode(taskInfo["reason"]));
						div.appendChild(document.createElement("br"));
					}
					if (taskInfo["waste_cost"] || taskInfo["min_level"]) {
						var req = '';
						if (taskInfo["waste_cost"]) {
							req += 'Waste Cost: ' + Lib.convertNumDisplay(taskInfo["waste_cost"]);
						}
						if (taskInfo["min_level"]) {
                            if (req.length) req += " \u00a0 ";
							req += 'Minimum Level: ' + taskInfo["min_level"];
						}
						
						div.appendChild(document.createTextNode(req));
						div.appendChild(document.createElement("br"));
					}
					if (taskInfo["recovery"]) {
						div.appendChild(document.createTextNode('Recovery Time: ' + Lib.formatTime(taskInfo["recovery"])));
						div.appendChild(document.createElement("br"));
					}
					if (taskInfo["fail_chance"] || taskInfo["side_chance"]) {
						var odds = '';
						if (taskInfo["fail_chance"]) {
							odds += 'Chance of Failure (before considering range): ' + taskInfo["fail_chance"] + '%';
						}
						if (taskInfo["side_chance"]) {
                            if (odds.length) odds += " \u00a0 ";
							odds += 'of Side effect: ' + taskInfo["side_chance"] + '%';
						}
						
						div.appendChild(document.createTextNode(odds));
						div.appendChild(document.createElement("br"));
					}
				}
			});
			Event.on("singularityGenerate", "click", function(){window.alert("UI not yet completed")}, this, true);

			return this.tab;
		},
		
		selectTask : function(tasks) {
			var sel = document.createElement("select"),
				opt = document.createElement("option");
			sel.appendChild(opt);
			sel.id = "singularityTaskSelector";
			for(var i=0; i<tasks.length; i++) {
				var nOpt = opt.cloneNode(false);
				nOpt.value = nOpt.innerHTML = tasks[i]["name"];
				sel.appendChild(nOpt);
			}

			var span = document.createElement("span");
			span.appendChild(sel);

			return span.innerHTML;
		}
		
	});
	
	YAHOO.lacuna.buildings.BlackHoleGenerator = BlackHoleGenerator;

})();
YAHOO.register("blackholegenerator", YAHOO.lacuna.buildings.BlackHoleGenerator, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
