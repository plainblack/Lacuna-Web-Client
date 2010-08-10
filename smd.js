YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.SMD == "undefined" || !YAHOO.lacuna.SMD) {

(function(){
	var smd = {
		Body : {
			"SMDVersion":"2.0",
			"description": "Body",
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
						{"name":"y", "type":"string", "optional":false},
						{"name":"tag", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				"get_build_queue" : {
					"description": "Returns a list of the buildings being constructed or upgraded",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"body_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
						 {
							"build_queue" : {
								"building-id-goes-here" : {
									"seconds_remaining" : 60,
									"start" : "01 31 2010 11:08:03 +0600",
									"end" : "01 31 2010 13:09:05 +0600",
								},
								...
							},
							"status" : "get_status",
						 }
					*/
				},
				"rename" : {
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
				"SMDVersion":"2.0",
				"description": "Buildings",
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
					"demolish" : {
						"description": "Allows you to instantly destroy a building provided it wouldn't put you into a negative resource production situation. For example, if you're producing only a net positive of 100 food per hour, and you destroy a corn field that would take away 200 food per hour, then the game won't allow you to demolish that building.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
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
					},
					"repair" : {
						"description": "Repair buildings Efficiency to 100%",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					}
				}
			},
			Archaeology : {
				"SMDVersion":"2.0",
				"description": "Archaeology Ministry",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/archaeology",
				
				"services": {
					"search_for_glyph" : {
						"description": "Searches through ore looking for glyphs left behind by the ancient race. Takes 10,000 of one type of ore to search.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"ore_type", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						{
							"status" : { get_status() },
							"seconds_remaining" : 10800
						 }
						*/
					},
					"get_glyphs" : {
						"description": "Returns a list of glyphs that have been found by this archaeology ministry.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"glyphs" : [
								{
									"id" : "id-goes-here",
									"type" : "bauxite",
								},
								...
							]
						 }
						*/
					},
					"assemble_glyphs" : {
						"description": "Turns glyphs into rare ancient items.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"ids", "type":"array", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"item_name" : "Volcano"
						 }
						*/
					},
					"get_ores_available_for_processing" : {
						"description": "Returns a list of ore names that the user has enough of to process for glyphs.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"ore" : {
								"bauxite" : 39949,
								"rutile" : 19393
							}
						 }
						*/
					}
					
				}
			},
			Development : {
				"SMDVersion":"2.0",
				"description": "Development Ministry",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/development",
				
				"services": {
					"subsidize_build_queue" : {
						"description": "Allows a player to instantly finish any buildings in their build queue. The cost is returned by the view method.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					}
					/*
					{
						"status" : { get_status() },
						"essentia_spent" : 8
					 }
					*/
				}
			},
			Intelligence : {
				"SMDVersion":"2.0",
				"description": "Intelligence",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/intelligence",

				"services": {
					"train_spy" : {
						"description": "Allows you to train more spies",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"quantity", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { get_status() },
							"trained" : 3,
							"not_trained" : 2
						 }
						*/
					},
					"view_spies" : {
						"description": "Returns the list of spies you have on your roster.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { get_status() },
							"spies" : {
								"id-goes-here" : {
									"assignment" : "Idle",
									"assigned_to" : {
										"body_id" : "id-goes-here",
										"name" : "Earth",
									},
									"is_available" : 1, # can be reassigned
									"available_on" : "01 31 2010 13:09:05 +0600" # if can't be reassigned, this is when will be available
								},
								...
							}
						 }
						*/
					},
					"burn_spy" : {
						"description": "Allows you to eliminate one of your spies from your payroll.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"spy_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { get_status() },
						 }
						*/
					},
					"assign_spy" : {
						"description": "Set a spy on a new task.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"spy_id", "type":"string", "optional":false},
							{"name":"assignment", "type":"string", "optional":false} // "Idle", "Counter Intelligence", "Sting"
						],
						"returns":{"type":"object"}
					},
					"name_spy" : {
						"description": "Set the name of the spy",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"spy_id", "type":"string", "optional":false},
							{"name":"name", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					}
				}
			},
			Mining : {
				"SMDVersion":"2.0",
				"description": "Mining Ministry",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/miningministry",

				"services": {
					"view_platforms" : {
						"description": "Returns a list of the mining platforms currently controlled by this ministry.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"max_platforms" : 1,
							"platforms" : [
								{
									"id" : "id-goes-here",
									"asteroid" : {
										"id" : "id-goes-here",
										"name" : "Kuiper"
									},
									"rutile_hour" : 10,
									"chromite_hour" : 10,
									"chalcopyrite_hour" : 10,
									"galena_hour" : 10,
									"gold_hour" : 10,
									"uraninite_hour" : 10,
									"bauxite_hour" : 10,
									"goethite_hour" : 10,
									"halite_hour" : 10,
									"gypsum_hour" : 10,
									"trona_hour" : 10,
									"kerogen_hour" : 10,
									"methane_hour" : 10,
									"anthracite_hour" : 10,
									"sulfur_hour" : 10,
									"zircon_hour" : 10,
									"monazite_hour" : 10,
									"fluorite_hour" : 10,
									"beryl_hour" : 10,
									"magnetite_hour" : 10,  
									"production_capacity" : 100, # expressed as a percentage
									"shipping_capacity" : 51 # expressed as a percentage
								},
								...
							]
						 }
						*/
					},
					"view_ships" : {
						"description": "Shows you the ships that are working in the mining fleet, and available to work in the mining fleet.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"ships" : [
								{
									"name" : "CS4",
									"id" : "id-goes-here",
									"task" : "Mining",
									"speed" : 350,
									"hold_size" : 5600
								},
								...
							],
							"status" : { ... }
						 }
						*/
					},
					"add_cargo_ship_to_fleet" : {
						"description": "Take a cargo ship from the space port and add it to the mining fleet.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"ship_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"} //status
					},
					"remove_cargo_ship_from_fleet" : {
						"description": "Tell one of the cargo ships in the mining fleet to come home and park at the space port.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"ship_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"} //status
					},
					"abandon_platform" : {
						"description": "Close down an existing mining platform.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"asteroid_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"} //status
					}
				}
			},
			Network19 : {
				"SMDVersion":"2.0",
				"description": "Network19",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/network19",

				"services": {
					"restrict_coverage" : {
						"description": "You can enact or disband a policy to restrict what Network 19 covers about your planet. Restricting coverage does make your citizens unhappy.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"onoff", "type":"number", "optional":false} // 0 or 1
						],
						"returns":{"type":"object"}
					},
					"view_news" : {
						"description": "Get the top 100 headlines from your region of space. It also returns a list of RSS feeds that can be used outside the game to see the same news in a given region.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"news" : [
								{
									"headline" : "HCorp founded a new colony on Rigel 4.",
									"date" : "01 31 2010 13:09:05 +0600"
								},
								...
							],
							"feeds" : [
								'http://feeds.game.lacunaexpanse.com/78d5e7b2-b8d7-317c-b244-3f774264be57.rss'
							],
							"status" : { get_status() }
						 }
						*/
					}
				}
			},
			Observatory : {
				"SMDVersion":"2.0",
				"description": "Observatory",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/observatory",

				"services": {
					"abandon_probe" : {
						"description": "The probe is deactivated, and allowed to burn up in the star.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"star_id", "type":"number", "optional":false}
						],
						"returns":{"type":"object"} // status
					},
					"get_probed_stars" : {
						"description": "Returns a list of the stars that have been probed by this planet.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":false}
						],
						"returns":{"type":"object"}
						/*
							 {
									"status" : { get_status() },
									"stars" : [
											"color" : "yellow",
											"name" : "Sol",
											"x" : 17,
											"y" : 4,
											"z" : -3,
											"alignments" : "self-hostile"
									]       
							 }
						*/
					}
				}
			},
			Park : {
				"SMDVersion":"2.0",
				"description": "Park",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/park",

				"services": {
					"throw_a_party" : {
						"description": "Initiates a party. It will cost you 10,000 food, and the party will last for a day. For 10,000 food you'll get 3,000 happiness. For each type of food available in quantities of 500 or more, you'll get a multiplier added to that. So if you have 4 types of food, you'll get 12,000 happiness. In addition, you get a 0.3 to your multiplier for each level of park that you have. Therefore a level 10 park is the same as adding three extra foods to your party!",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"} // status
					}
				}
			},
			Security : {
				"SMDVersion":"2.0",
				"description": "Security",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/security",

				"services": {
					"view_prisoners" : {
						"description": "Displays a list of the spies that have been captured.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"prisoners" : [
								{
									"id" : "id-goes-here",
									"name" : "James Bond",
									"level" : "20",
									"sentence_expires" : "01 31 2010 13:09:05 +0600"
								},
								...
							]
						 }
						*/
					},
					"execute_prisoner" : {
						"description": "You may choose to execute a prisoner rather than letting him serve his sentence and be released. However, that will cost you 10,000 times the prisoner's level in happiness from your planet. So a level 11 prisoner would cost you 110,000 happiness.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"prisoner_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					},
					"release_prisoner" : {
						"description": "You may choose to release a prisoner by calling this method.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"prisoner_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
					},
					"view_foreign_spies" : {
						"description": "Displays a list of the spies that are on your planet, and have a level lower than your security ministry.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { ... },
							"spies" : [
								{
									"name" : "James Bond",
									"level" : 11,
									"next_mission" : "01 31 2010 13:09:05 +0600"
								},
								...
							]
						 }
						*/
					}
				}
			},
			Shipyard : {
				"SMDVersion":"2.0",
				"description": "Shipyard",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/shipyard",

				"services": {
					"view_build_queue" : {
						"description": "Retrieves what is already being built at this shipyard.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
					},
					"get_buildable" : {
						"description": "Returns a list of buildable ships and their costs, and if they're not buildable, gives a reason why not in the form of an exception.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
							 {
								"buildable" : {
									"probe" : {
										"can" : 1,             # can it be built or not
										"reason" : null,       # if it can't an array ref will be here with the exception for why not
										"cost" : {
											"seconds" : 900,
											"food" : 1100,
											"water" : 1000,
											"energy" : 1200,
											"ore" : 1200,
											"waste" : 100,
										},
										attributes : {
											"speed" : 1000,    # 100 roughly equals 1 star in 1 hour
										}
									},
									...
								},
								"docks_available" : 7,         # you can only build ships up to the number of docks you have available
								"status" : { get_status() },
							 }
						*/
					},
					"build_ship" : {
						"description": "Adds a ship to the build queue.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"type", "type":"string", "optional":false}, //'probe','colony_ship','spy_pod','cargo_ship','space_station','smuggler_ship','mining_platform_ship','terraforming_platform_ship', or 'gas_giant_settlement_ship'
							{"name":"quantity", "type":"number", "optional":false}
						],
						"returns":{"type":"object"}
						/*
							 {
								"ship_build_queue" : {
									"next_completed" : "01 31 2010 13:09:05 +0600",
									"queue" : [
										{
										   "type" : "probe",
										   "seconds_each" : 120,
										   "quantity" : 12
										},
										...
									]
								},
								"status" : { get_status() }
							 }
						*/
					}
				}				
			},
			SpacePort : {
				"SMDVersion":"2.0",
				"description": "SpacePort",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/spaceport",

				"services": {
					"send_colony_ship" : {
						"description": "Dispatches a colony ship from one of the space ports on a planet to another body. It will automatically detect which space ports on the planet have colony ships, if any, and pick one of them.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"from_body_id", "type":"string", "optional":false},
							{"name":"to_body", "type":"object", "optional":false}
							/* to_body = 
								 { "body_name" : "Earth" }
								 or
								 { "body_id" : "id-goes-here" }
								 or
								 { "x" : 4, "y" : -3, "z" : 5, "orbit" : 3 }
							*/
						],
						"returns":{"type":"object"}
						/*
						 {
							"colony_ship" : {
								"date_arrives" : "01 31 2010 13:09:05 +0600"
							},
							"status" : { get_status() }
						}
						*/
					},
					"send_mining_platform_ship" : {
						"description": "Dispatches a mining platform ship from one of the space ports on a planet to another body. It will automatically detect which space ports on the planet have mining platform ships, if any, and pick one of them. You can only dispatch a mining platform ship to an asteroid.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"from_body_id", "type":"string", "optional":false},
							{"name":"to_body", "type":"object", "optional":false}
							/* to_body = 
								 { "body_name" : "Earth" }
								 or
								 { "body_id" : "id-goes-here" }
								 or
								 { "x" : 4, "y" : -3, "z" : 5, "orbit" : 3 }
							*/
						],
						"returns":{"type":"object"}
						/*
						 {
							"mining_platform_ship" : {
								"date_arrives" : "01 31 2010 13:09:05 +0600"
							},
							"status" : { get_status() }
						}
						*/
					},
					"send_probe" : {
						"description": "Dispatches a probe from one of the space ports on a planet to a star. It will automatically detect which space ports on the planet have probes, if any, and pick one of them to dispatch the probe.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"from_body_id", "type":"string", "optional":false},
							{"name":"to_star", "type":"object", "optional":false}
							/* to_star = 
								 { "star_name" : "Sol" }
								or
								 { "star_id" : "id-goes-here" }
								or
								 { "x" : 4, "y" : -3, "z" : 5 }
							*/
						],
						"returns":{"type":"object"}
						/*
						 {
							"probe" : {
								"date_arrives" : "01 31 2010 13:09:05 +0600"
							},
							"status" : { get_status() }
						}
						*/
					},
					"send_spy_pod" : {
						"description": "Dispatches a spy pod from one of the space ports on a planet to another body. It will automatically detect which space ports on the planet have spy pods, if any, and pick one of them to dispatch the spy pod. In order to send a spy pod you must also have an idle spy available.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"from_body_id", "type":"string", "optional":false},
							{"name":"to_body", "type":"object", "optional":false}
							/* to_body = 
								 { "body_name" : "Earth" }
								 or
								 { "body_id" : "id-goes-here" }
								 or
								 { "x" : 4, "y" : -3, "z" : 5, "orbit" : 3 }
							*/
						],
						"returns":{"type":"object"}
						/*
						 {
							"spy_pod" : {
								"date_arrives" : "01 31 2010 13:09:05 +0600",
								"carrying_spy" : {
								   "id" : "id-goes-here",
								   "name" : "Jason Bourne",
								}
							},
							"status" : { get_status() }
						 }
						 */
					},
					"view_all_ships" : {
						"description": "Returns a list of all ships",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false}
						],
						"returns":{"type":"object"}
						/*
						 {
							"ships" : [
								{
									"name" : "CS4",
									"id" : "id-goes-here",
									"task" : "Mining",
									"speed" : 350,
									"hold_size" : 5600
									"type" : "cargo_ship",
								},
								...
							],
							"number_of_ships" : 13,
							"status" : { ... }
						 }
						*/
					},
					"view_ships_travelling" : {
						"description": "Returns a list of the ships that are travelling to or from this planet. NOTE: All inbound/outbound ships are shown regardless of which space port they will eventually land at.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"page_number", "type":"number", "optional":true}
						],
						"returns":{"type":"object"}
						/*
						 {
							"status" : { get_status() },
							"number_of_ships_travelling" : 30,
							"ships_travelling" : [
							   {
								   "id" : "id-goes-here",
								   "ship_type" : "probe",
								   "date_arrives" : "01 31 2010 13:09:05 +0600",
								   "from" : {
									   "id" : "id-goes-here",
									   "type" : "body",
									   "name" : "Earth",
								   },
								   "to" : {
									   "id" : "id-goes-here",
									   "type" : "star",
									   "name" : "Sol",
								   }
							   },
							   ...
							]
						 }
						*/
					}
				}
			},
			Recycler : {
				"SMDVersion":"2.0",
				"description": "Waste Recycler",
				"envelope":"JSON-RPC-2.0",
				"transport":"POST",
				"target":"/wasterecycling",
				
				"services": {
					"recycle" : {
						"description": "Converts waste into water, ore, and energy. You can choose which amounts of each you want, so long as their total does not go over the amount of waste you have on hand. For each unit of waste converted, the recycling center will take 1 second to complete the recycling process. However, the amount of time is reduced a bit by the level of the Recycling Center.",
						"parameters": [
							{"name":"session_id", "type":"string", "optional":false},
							{"name":"building_id", "type":"string", "optional":false},
							{"name":"water", "type":"number", "optional":false},
							{"name":"ore", "type":"number", "optional":false},
							{"name":"energy", "type":"number", "optional":false},
							{"name":"use_essentia", "type":"number", "optional":false}
						],
						"returns":{"type":"object"}
					},
					"subsidize_recycling" : {
						"description": "Will spend 2 essentia to complete the current recycling job immediately.",
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
						{"name":"password", "type":"string", "optional":false},
						{"name":"api_key", "type":"string", "optional":false}
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
						{"name":"empire_id", "type":"string", "optional":false},
						{"name":"api_key", "type":"string", "optional":false},
						{"name":"invite_code", "type":"string", "optional":true}
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
				},
				"view_boosts" : {
					"description": "Shows the dates at which boosts have expired or will expire. Boosts are subsidies applied to various resources using essentia.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"boosts" : {
							"food" : "01 31 2010 13:09:05 +0600",
							"ore" : "01 31 2010 13:09:05 +0600",
							"energy" : "01 31 2010 13:09:05 +0600",
							"happiness" : "01 31 2010 13:09:05 +0600",
							"water" : "01 31 2010 13:09:05 +0600",
						}
					 }
					*/
				},
				"boost_food" : {
					"description": "Spends 5 essentia, and boosts food production on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"food_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"boost_water" : {
					"description": "Spends 5 essentia, and boosts water production on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"water_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"boost_energy" : {
					"description": "Spends 5 essentia, and boosts energy production on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"energy_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"boost_ore" : {
					"description": "Spends 5 essentia, and boosts ore production on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"ore_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"boost_happiness" : {
					"description": "Spends 5 essentia, and boosts happiness production on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"happiness_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"boost_storage" : {
					"description": "Spends 5 essentia, and boosts storage (all 5 types) on all planets for 7 days. If a boost is already underway, calling again will add 7 more days.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { get_status() },
						"storage_boost" : "01 31 2010 13:09:05 +0600"
					 }
					*/
				},
				"enable_self_destruct" : {
					"description": "Enables a destruction countdown of 24 hours. Sometime after the timer runs out, the empire will vaporize.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				"disable_self_destruct" : {
					"description": "Disables the self distruction countdown.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
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
						{"name":"options", "type":"object", "optional":true}
					],
					"returns":{"type":"object"}
				},
				"view_archived" : {
					"description": "Displays a list of the messages in the empire's archive.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"options", "type":"object", "optional":true}
					],
					"returns":{"type":"object"}
				},
				"view_sent" : {
					"description": "Displays a list of the messages in the empire's outbox.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"options", "type":"object", "optional":true}
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
				"check_star_for_incoming_probe" : {
					"description": "Retrieves a chunk of the map and returns it as an array of hashes.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"star_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
				},
				
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
				},
				
				"view_stats" : {
					"description": "Returns a list of the stats associated with an empire's species as it was originally created. An empire can only view it's own species stats throught his method.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"string"}
					/*
					 {
						"name" : "Human",
						"description" : "The descendants of Earth.",
						"habitable_orbits" : [3],
						"manufacturing_affinity" : 4,
						"deception_affinity" : 4,
						"research_affinity" : 4,
						"management_affinity" : 4,
						"farming_affinity" : 4,
						"mining_affinity" : 4,
						"science_affinity" : 4,
						"environmental_affinity" : 4,
						"political_affinity" : 4,
						"trade_affinity" : 4,
						"growth_affinity" : 4
					 }
					*/
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
				},
				
				"empire_rank" : {
					"description": "Returns a sorted list of empires ranked according to various stats.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"sort_by", "type":"string", "optional":true}, //Defaults to empire_size_rank. Possible values are: empire_size_rank, university_level_rank, offense_success_rate_rank, defense_success_rate_rank, and dirtiest_rank
						{"name":"page_number", "type":"number", "optional":true}
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { ... },
						"empires" : [
							{
								"empire_id" : "id-goes-here",                   # unique id
								"empire_name" : "Earthlings",                   # empire name
								"colony_count" : "1",                           # number of planets colonized
								"population" : "7000000000",                    # number of citizens on all planets in the empire
								"empire_size" : "7000000000",                   # size of entire empire
								"building_count" : "50",                        # number of buildings across all colonies
								"average_building_level" : "20",                # average level of all buildings across all colonies
								"offense_success_rate" : "0.793",               # the offense rate of success of spies at all colonies
								"defense_success_rate" : "0.49312",             # the defense rate of success of spies at all colonies
								"dirtiest" : "7941"                            # the number of times a spy has attempted to hurt another empire
							  },
							...
						],
						"total_empires" : 5939,
						"page_number" : 3
					 }
					*/
				},
				"find_empire_rank" : {
					"description": "Search for a particular empire in the empire_rank().",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"sort_by", "type":"string", "optional":false},
						{"name":"empire_name", "type":"string", "optional":false} //Must be at least 3 characters to search.
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { ... },
						"empires" : [
							{
								"empire_id" : "id-goes-here",
								"empire_name" : "Earthlings",
								"page_number" : "54",
							}
							...
						]
					 }
					*/
				},
				
				"colony_rank" : {
					"description": "Returns a sorted list of planets ranked according to various stats.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"sort_by", "type":"string", "optional":true} //Defaults to population_rank. Possible values are: population_rank
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { ... },
						"colonies" : [
							{
								"empire_id" : "id-goes-here",                   # unique id
								"empire_name" : "Earthlings",                   # empire name
								"planet_id" : "id-goes-here",                   # unique id
								"planet_name" : "Earth",                        # name of the planet
								"population" : "7000000000",                    # number of citizens on planet
								"building_count" : "50",                        # number of buildings at this colony
								"average_building_level" : "20",                # average level of all buildings at this colony
								"highest_building_level" : "26"                 # highest building at this colony
							  },
							...
						]
					 }
					*/
				},
				"spy_rank" : {
					"description": "Returns a sorted list of spies ranked according to various stats.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false},
						{"name":"sort_by", "type":"string", "optional":true} //Defaults to level_rank. Possible values are: level_rank  success_rate_rank and dirtiest_rank
					],
					"returns":{"type":"object"}
					/*
					 {
						"status" : { ... },
						"spies" : [
							{            
								"empire_id" : "id-goes-here",                   # unique id
								"empire_name" : "Earthlings",                   # empire name
								"spy_id" : "id-goes-here",                      # unique id
								"spy_name" : "Agent Null",                      # the name of this spy
								"age" : "3693",                                 # how old is this guy in seconds
								"level" : "18",                                 # the level of this spy
								"success_rate" : "0.731",                       # the rate of success this spy has had for both offense and defensive tasks
								"dirtiest" : "7941",                            # the number of times a spy has attempted to hurt another empire
							},
							...
						]
					 }
					*/
				},
				"weekly_medal_winners" : {
					"description": "Returns a list of the empires who won this week's weekly medals.",
					"parameters": [
						{"name":"session_id", "type":"string", "optional":false}
					],
					"returns":{"type":"object"}
					/*
					{
						"status" : { ... },
						"winners" : [
							{
								"empire_id" : "id-goes-here",
								"empire_name" : "Earthlings",
								"medal_name" : "Dirtiest Player In The Game",
								"medal_image" : "dirtiest1",
								"times_earned" : 4,
							},
							...
						]
					 }
					*/
				}
		
			}
		}
	};

	YAHOO.lacuna.SMD = { Services:smd };
})();
YAHOO.register("smd", YAHOO.lacuna.SMD, {version: "1", build: "0"}); 

}