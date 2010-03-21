YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.SMD == "undefined" || !YAHOO.lacuna.SMD) {

(function(){
	var smd = {
		Body : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/body",

			"services": {
				"get_buildings" : {
					"description": "Retrieves a list of the buildings on a planet.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				"get_buildable" : {
					"description": "Provides a list of all the building types that are available to be built on a given space on a planet.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false},
						{"name":"x", "type":"string", "optional":false},
						{"name":"y", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				"rename_body" : {
					"description": "Renames a body, provided the empire attached to the session owns the body. Returns a 1 on success.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false},
						{"name":"name", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				}

			}
		},
		Buildings : {
			Generic : {
				"description": "SMD service demonstration",

				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				//Target will be passed in "target":"/buildings",

				"services": {
					"build" : {
						"description": "Adds this building to the planet's build queue.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"planet_id", "type":"string", "optional":false},
							{"name":"x", "type":"string", "optional":false},
							{"name":"y", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					},
					"view" : {
						"description": "Retrieves the properties of the building.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					},
					"upgrade" : {
						"description": "Adds the requested upgrade to the build queue. On success returns the view() method.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					}

				}
			}
		},
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
						password1:{"type":"string", "optional":false}
					},
					"returns":{"type":"object"}
				},
				"found" : {
					"description": "found empire",
					"parameters": [
						{"name":"empire_id", "type":"string", "optional":false}
					],
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
				},
				"view_profile" : {
					"description": "Provides a list of the editable properties of the current empire's profile. See also the edit_profile and view_public_profile  methods.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"profile" : {
						   "description" : "description goes here",
						   "status_message" : "status message goes here",
						   "medals" : {
							   "building1" : {
								   "name" : "Built Level 1 Building",
								   "image" : "building1",
								   "note" : "note about how this was achieved, if any, goes here",
								   "date" : "01 31 2010 13:09:05 +0600",
								   "public" : 1
							   },
							   ...
						   }
						},
						"status" : { get_status() }
					 }
					*/
				},
				"edit_profile" : {
					"description": "Edits properties of an empire. Returns the view_profile method. See also the view_profile and view_public_profile  methods.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"profile", "type":"object", "optional":false}
					],
					"returns":{"type":"object"}
				},
				"view_public_profile" : {
					"description": "Provides a list of the data that's publicly known about this empire.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"empire_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					{
						"profile" : {
							"id" : "empire-id-goes-here",
							"name" : "Lacuna Expanse Corp",
							"planet_count" : 1,
							"status_message" : "Looking for Essentia."
							"description" : "We are the original inhabitants of the Lacuna Expanse.",
							"medals" : {
								"building1" : {
									"name" : "Built Level 1 Building",
									"image" : "building1",
									"date" : "01 31 2010 13:09:05 +0600",
									"note" : null
								},
								...
							},
							"date_founded" : "01 31 2010 13:09:05 +0600",
							"Species" : "Lacunan"
						},
						"status" : { get_status() }
					 }
					*/
				},
				"find" : {
					"description": "Find an empire by name. Returns a hash reference containing empire ids and empire names.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"name", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/* 
					 {
						"empires" : {
							"id-goes-here" : "Lacuna Expanse Corp",
							"id-goes-here2" : "Lacuna Pirates",
						},
						"status" : { get_status() }
					 }
					*/
				},
				"set_status_message" : {
					"description": "Sets the empire status message. Similar to what you might put on your Facebook wall, or in a tweet, but about your empire.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"message", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				}
			}
		},
		Inbox : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/inbox",
			
			"services": {

				/* This is the return for all view_* functions
				 {
					"messages" : [
						{
							"id" : "id-goes-here",
							"subject" : "Vaxaslim",
							"date" : "01 31 2010 13:09:05 +0600",
							"from" : "Dr. Stephen T. Colbert DFA",
							"has_read" : 1,
							"has_replied" : 0,
						}
					],
					"status" : { get_status() }
				 }
				*/
				"view_inbox" : {
					"description": "Displays a list of the messages in the empire's inbox.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"page_number", "type":"string", "optional":true}
					],
					"returns":{"type":"object"}
				},
				"view_archived" : {
					"description": "Displays a list of the messages in the empire's archive.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"page_number", "type":"string", "optional":true}
					],
					"returns":{"type":"object"}
				},
				"view_sent" : {
					"description": "Displays a list of the messages in the empire's outbox.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"page_number", "type":"string", "optional":true}
					],
					"returns":{"type":"object"}
				},
				"read_message" : {
					"description": "Retrieves a message. Marks it read if it hasn't been already.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"message_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
						/*
						 {
							"message" : {
								"id" : "id-goes-here",
								"from" : "Dr. Stephen T. Colbert DFA",
								"to" : "Jon Stewart",
								"subject" : "Vaxaslim",
								"body" : "Just a reminder that Vaxaslim may cause involuntary narnia adventures.",
								"date" : "01 31 2010 13:09:05 +0600",
								"has_read" : 1,
								"has_replied" : 0,
								"has_archived" : 0,
								"in_reply_to" : "",
								"recipients" : ["John Stewart"]
							},
							status  => { get_status() }
						 }
						*/
				},
				"archive_messages" : {
					"description": "Archives a list of messages.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"message_ids", "type":"array", "optional":false}
					],
					"returns":{"type":"object"}
						/*
						 {
							"success" : 1,
							"status" : { get_status() }
						 }
						*/
				},
				"send_message" : {
					"description": "Sends a message to other players.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"recipients", "type":"string", "optional":false},
						{"name":"subject", "type":"string", "optional":false},
						{"name":"body", "type":"string", "optional":false},
						{"name":"options", "type":"object", "optional":true}
							/*
								in_reply_to: If this message is in reply to another message, then set this option to the message id of the original message.
							*/
					],
					"returns":{"type":"object"}
					/*
						{
							"message": {
								"sent":[],
								"unknown":[]
							},
							"status" : { get_status() }
						}
					*/
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
					"parameters": [
						{"name":"empire_id", "type":"string", "optional":false},
						{"name":"params", "type":"object", "optional":false}
						/*params ={
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
						}*/
					],
					"returns":{"type":"string"}
				},
				
				"set_human" : {
					"description": "set empires species to human",
					"parameters": [
						{"name":"empire_id", "type":"string", "optional":false}
					],
					"returns":{"type":"string"}
				}
			}
		},
		Stats : {
			"SMDVersion":"2.0",
			"description": "SMD service demonstration",

			"envelope":"JSON-RPC-2.0",
			"transport":"POST",
			"target":"/stats",
			
			"services": {

				"credits" : {
					"description": "Retrieves a list of the game credits. It is an array of hashes of arrays.",
					"parameters": [],
					"returns":{"type":"array"}
				}
				
			}
		}
	};

	YAHOO.lacuna.SMD = smd;
})();
YAHOO.register("smd", YAHOO.lacuna.SMD, {version: "1", build: "0"}); 

}