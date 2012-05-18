YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.TheDillonForge == "undefined" || !YAHOO.lacuna.buildings.TheDillonForge) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;

	var TheDillonForge = function(result){
		TheDillonForge.superclass.constructor.call(this, result);
		
		this.service = Game.Services.Buildings.TheDillonForge;
	};
	
	Lang.extend(TheDillonForge, Lacuna.buildings.Building, {
		getChildTabs : function() {
			return [this._getForgeTab()];
		},
		_getForgeTab : function() {
			this.splitTab = new YAHOO.widget.Tab({ label: "Forge", content: [
                '<div id="forgeMakePlan">',
                '  <div><b>Split a plan into glyphs.</b></div>',
                '  <div id="forgeMakePlanForm"></div><hr/>',
                '</div>',
                '<div id="forgeSplitPlan">',
                '  <div><b>Combine level 1 plans into a higher level plan.</b></div>',
                '  <div id="forgeSplitPlanForm"></div>',
                '</div>',
                '<div id="forgeSubsidize">',
                '  <div><b>Subsidize current task.</b></div>',
                '  <div id="forgeSubsidizeForm"><div>',
                '</div>'
			].join('')});
			
            this.splitTab.subscribe("activeChange", this.viewForgeTab, this, true);
            
			return this.splitTab;
		},
        viewForgeTab : function() {
            if ( this.result.tasks.can == 1 ) {
                Dom.setStyle("forgeMakePlan", "display", "");
                Dom.setStyle("forgeSplitPlan", "display", "");
                Dom.setStyle("forgeSubsidize", "display", "none");
                this.viewForgeMakePlan();
                this.viewForgeSplitPlan();
            }
            else {
                Dom.setStyle("forgeMakePlan", "display", "none");
                Dom.setStyle("forgeSplitPlan", "display", "none");
                Dom.setStyle("forgeSubsidize", "display", "");
                this.viewForgeSubsidize();
            }
        },
        viewForgeMakePlan : function() {
            var make_plan = this.result.tasks.make_plan,
                make_form = Dom.get("forgeMakePlanForm");
            
            if ( make_plan.length == 0 ) {
                make_form.innerHTML = "No plans available to make.";
                return;
            }
            
            make_form.innerHTML = "";
            
            var select = document.createElement("select");
            var option = document.createElement("option");
            select.setAttribute("id", "forgeMakePlanSelect");
            
            var emptyFirst = option.cloneNode(false);
            emptyFirst.setAttribute("value","");
            emptyFirst.innerHTML = "Select plan (maximum level) &#91;time to make&#93;";
            select.appendChild(emptyFirst);
            
            for (var i=0; i<make_plan.length; i++) {
                var nOpt = option.cloneNode(false);
                nOpt.setAttribute("value", make_plan[i].class);
                nOpt.innerHTML = [
                    make_plan[i].name, ' (',
                    make_plan[i].max_level, ') &#91;',
                    Lib.formatTime( make_plan[i].reset_sec_per_level ), '&#93;'
                ].join('');
                select.appendChild(nOpt);
            }
            
            var input  = document.createElement("input");
            input.setAttribute("id", "forgeMakePlanLevel");
            input.setAttribute("size", 3);
            option.appendChild(input);
            
            var button = document.createElement("button");
            button.innerHTML = "Make Plan";
            Dom.setStyle(button, "margin-left", "1em");
            option.appendChild(button);
            
            make_form.appendChild(select);
            make_form.appendChild( document.createTextNode(" Level: ") );
            make_form.appendChild(input);
            make_form.appendChild(button);
            
            Event.on(button, "click", this.MakePlan, {Self:this}, true);
        },
        MakePlan : function() {
            var plan_class = Lib.getSelectedOptionValue("forgeMakePlanSelect"),
                level = Dom.get("forgeMakePlanLevel").value;
            
            if ( plan_class == "" ) {
                alert("Select a plan");
                return;
            }
            
            if ( level < 2 ) {
                alert("Enter a valid plan level");
                return;
            }
            
            Lacuna.Pulser.Show();
            this.Self.service.make_plan(
                {
                    session_id:Game.GetSession(),
                    building_id:this.Self.building.id,
                    plan_class: plan_class,
                    level: level
                },
                {
                    success : function(o){
                        YAHOO.log(o, "info", "TheDillonForge.MakePlan.success");
                        Lacuna.Pulser.Hide();
                        this.Self.rpcSuccess(o);
                        this.Self.result = o.result;
                        this.Self.viewForgeTab();
                },
                scope:this
            });
        },
        viewForgeSplitPlan : function() {
            var split_plan = this.result.tasks.split_plan,
                split_form = Dom.get("forgeSplitPlanForm");
            
            if ( split_plan.length == 0 ) {
                split_form.innerHTML = "No plans available to split.";
                return;
            }
            
            split_form.innerHTML = "";
            
            var select = document.createElement("select");
            var option = document.createElement("option");
            select.setAttribute("id", "forgeSplitPlanSelect");
            
            var emptyFirst = option.cloneNode(false);
            emptyFirst.setAttribute("value","");
            emptyFirst.innerHTML = "Select plan (levels) &#91;time to split&#93;";
            select.appendChild(emptyFirst);
            
            for (var i=0; i<split_plan.length; i++) {
                var nOpt = option.cloneNode(false);
                var value = [
                    split_plan[i].class, ';',
                    split_plan[i].level, ';',
                    split_plan[i].extra_build_level
                ].join('');
                nOpt.setAttribute("value", value);
                nOpt.innerHTML = [
                    split_plan[i].name, ' (',
                    split_plan[i].level, '+',
                    split_plan[i].extra_build_level, ') &#91;',
                    Lib.formatTime( split_plan[i].reset_seconds ), '&#93;'
                ].join('');
                select.appendChild(nOpt);
            }
            
            var button = document.createElement("button");
            button.innerHTML = "Split Plan";
            Dom.setStyle(button, "margin-left", "1em");
            option.appendChild(button);
            
            split_form.appendChild(select);
            split_form.appendChild(button);
            
            Event.on(button, "click", this.SplitPlan, {Self:this}, true);
        },
        SplitPlan : function() {
            var selected = Lib.getSelectedOptionValue("forgeSplitPlanSelect");
            
            if ( selected == "" ) {
                alert("Select a plan");
                return;
            }
            
            selected = selected.split(";");
            
            if ( selected.length == 3 ) {
                Lacuna.Pulser.Show();
                this.Self.service.split_plan(
                    {
                        session_id:Game.GetSession(),
                        building_id:this.Self.building.id,
                        plan_class: selected[0],
                        level: selected[1],
                        extra_build_level: selected[2]
                    },
                    {
                        success : function(o){
                            YAHOO.log(o, "info", "TheDillonForge.SplitPlan.success");
                            Lacuna.Pulser.Hide();
                            this.Self.rpcSuccess(o);
                            this.Self.result = o.result;
                            this.Self.viewForgeTab();
                    },
                    scope:this
                });
            }
        },
        viewForgeSubsidize : function() {
            var form = Dom.get("forgeSubsidizeForm"),
                cost = this.result.tasks.subsidy_cost;
            
            form.innerHTML = "";
            
            var button = document.createElement("button");
            button.innerHTML = "Subsidize for " + cost + "E";
            form.appendChild(button);
            
            Event.on(button, "click", this.Subsidize, {Self:this}, true);
		},
        Subsidize : function() {
            Lacuna.Pulser.Show();
			this.Self.service.subsidize({session_id:Game.GetSession(),building_id:this.Self.building.id}, {
				success : function(o){
					YAHOO.log(o, "info", "TheDillonForge.Subsidize.success");
					Lacuna.Pulser.Hide();
					this.Self.rpcSuccess(o);
					this.Self.result = o.result;
					this.Self.viewForgeTab();
				},
				scope:this
			});
        }

	});
	
	YAHOO.lacuna.buildings.TheDillonForge = TheDillonForge;

})();
YAHOO.register("TheDillonForge", YAHOO.lacuna.buildings.TheDillonForge, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
