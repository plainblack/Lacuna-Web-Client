YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.SMD == "undefined" || !YAHOO.lacuna.SMD) {

(function(){
	var smd = {
		Empire : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/empire",

			"services": {

				"is_name_available" : {
					"description": "check if empire name is available",
					"parameters": [
						{"name":"name", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"logout" : {
					"description": "logout empire",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"login" : {
					"description": "login empire",
					"parameters": [
						{"name":"name", "type":"string", "optional":false},
						{"name":"password", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"create" : {
					"description": "create empire",
					"parameters": {
						name:{"type":"string", "optional":false},
						password:{"type":"string", "optional":false},
						password1:{"type":"string", "optional":false},
						species_id:{"type":"string", "optional":false}
					},
					"returns":{"type":"object"}
				},
				
				"get_status" : {
					"description": "get quick empire status",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				
				"get_full_status" : {
					"description": "get full empire status",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				}

			}
		},
		Map : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/map",

			"services": {			
				"get_stars" : {
					"description": "Retrieves a chunk of the map and returns it as an array of hashes.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"x1", "type":"number", "optional":false},
						{"name":"y1", "type":"number", "optional":false},
						{"name":"x2", "type":"number", "optional":false},
						{"name":"y2", "type":"number", "optional":false},
						{"name":"z", "type":"number", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 { 
						"stars" : [
							{
								"name"          : "Sol",
								"can_name"      : 1,
								"color"         : "yellow",
								"x"             : -41,
								"y"             : 27,
								"z"             : 14,
								"alignment"     : "self-ally"
							}.
							{
								"name"          : "X143S",
								"can_name"      : 0,
								"color"         : "green",
								"x"             : -42,
								"y"             : 27,
								"z"             : 14,
								"alignments"    : "unprobed"
							}
						],
						"status" : {...}
					}
					*/
				},

				"get_stars_near_body" : {
					"description": "Returns a list of 121 stars near a body, on the same z axis as the body. The list returned is the same as get_stars",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"get_star_by_body" : {
					"description": "Returns the details about a star",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"get_star_system" : {
					"description": "Returns an array of bodies and a hash about the star itself. The data structure looks like:",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"star_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
						{
							"star" : {
								"id" : "a0f7f6e5-c58e-4b9d-994b-5838c2feabe8",
								"name" : "Sol",
								"color" : "yellow",
								"x" : -39
								"y" : 44,
								"z" : 12,
								"can_rename" : 1
							},
							"bodies" : {
							   "f9fe8bd3-bd09-4dc2-ba20-cf4e3b69e63a" : {
									"name" : "Mercury",
									"orbit" : 1,
									"image" : "p13",
									"minerals" : {
										"Gold" : 9239,
										"Bauxite" : 1223
									},
									"water" : 100,
									"empire" : {
										"id" : "4d9553ab-e9e6-425d-a5e5-100428fb248c",
										"name" : "The Martians"
									}
								}
							},
							"status" : {...}
						}
					*/
				},

				"get_star_system_by_body" : {
					"description": "Returns the same output and throws the same errors as get_star_system, but locates the system based upon a body_id rather than a star_id.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},

				"rename_star" : {
					"description": "Renames a star, provided it hasn't already been named. Returns a 1 on success.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"star_id", "type":"string", "optional":false},
						{"name":"name", "type":"string", "optional":false}
					],
					"returns":{"type":"number"}
				}
			}
		},
		Species : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/species",

			"services": {

				"is_name_available" : {
					"description": "check if species name is available",
					"parameters": [
						{"name":"name", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				
				"create" : {
					"description": "create species",
					"parameters": {
						name:{"type":"string", "optional":false},
						description:{"type":"string", "optional":false},
						habitable_orbits:{"type":"number", "optional":false},
						construction_affinity:{"type":"number", "optional":false},
						deception_affinity:{"type":"number", "optional":false},
						research_affinity:{"type":"number", "optional":false},
						management_affinity:{"type":"number", "optional":false},
						farming_affinity:{"type":"number", "optional":false},
						mining_affinity:{"type":"number", "optional":false},
						science_affinity:{"type":"number", "optional":false},
						environmental_affinity:{"type":"number", "optional":false},
						political_affinity:{"type":"number", "optional":false},
						trade_affinity:{"type":"number", "optional":false},
						growth_affinity:{"type":"number", "optional":false}
					},
					"returns":{"type":"string"}
				}
			}
		}
	};

	YAHOO.lacuna.SMD = smd;
})();
YAHOO.register("smd", YAHOO.lacuna.SMD, {version: "1", build: "0"}); 

}