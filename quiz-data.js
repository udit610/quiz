/*
  THIS WEEK'S QUIZ. This is the only file to edit for a new week.

  After editing, run:

      node tools/build.mjs

  That checks the questions and writes them into index.html in a
  scrambled form, so the answers cannot be read from the page source.
  Commit both files. This file is not part of the public website
  (see .vercelignore).

  Each question:
    q    the question
    o    the options (2 to 6)
    a    which option is correct, counting from 0. The page shuffles
         the options for every student, so keeping the correct one
         first (a:0) is fine.
    img  optional: a key from QUESTION_IMAGES, shown as a photo
    pic  optional: text shown on a card instead of a photo
         (patterns, sums, codes). Use \n for a new line.
    e    optional: an emoji, shown when there is no photo or it
         fails to load
*/

export const WEEK = {
  theme: "Wonders of Water",
  emoji: "🌊",
  date: "2026-11-28"   // the quiz Saturday, YYYY-MM-DD
};


export const QUESTION_IMAGES = {

  "algae": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Algal_bloom_in_Lake_Erie%2C_Kelley%27s_Island_%288740853803%29.jpg/960px-Algal_bloom_in_Lake_Erie%2C_Kelley%27s_Island_%288740853803%29.jpg",
  "anglerfish": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Humpback_anglerfish.png/960px-Humpback_anglerfish.png",
  "bleached": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Coral_Bleaching_in_Hawaii.jpg/960px-Coral_Bleaching_in_Hawaii.jpg",
  "boat": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Inle_Lake%2C_Boy_rowing_the_boat%2C_Myanmar%2C_Burma.jpg/960px-Inle_Lake%2C_Boy_rowing_the_boat%2C_Myanmar%2C_Burma.jpg",
  "boiling": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Boiling_water.jpg/960px-Boiling_water.jpg",
  "bucket": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Happy_Bath_Moment.jpg/960px-Happy_Bath_Moment.jpg",
  "clouds": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/White_Cumulus_Clouds_against_Blue_Sky_%284%29.jpg/960px-White_Cumulus_Clouds_against_Blue_Sky_%284%29.jpg",
  "coral": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Coral_reef_fish_swim_above_the_coral_slope.jpg/960px-Coral_reef_fish_swim_above_the_coral_slope.jpg",
  "crab": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Crab_Red_on_Sea_Beach.jpg/960px-Crab_Red_on_Sea_Beach.jpg",
  "crocodile": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Mugger_crocodile_%28Crocodylus_palustris%29_head.jpg/960px-Mugger_crocodile_%28Crocodylus_palustris%29_head.jpg",
  "dam": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Bhakra_Dam%2C_Bilaspur.jpg/960px-Bhakra_Dam%2C_Bilaspur.jpg",
  "darkclouds": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Dark_clouds_over_Towers_of_Channelside%2C_Tampa%2C_FL.jpg/960px-Dark_clouds_over_Towers_of_Channelside%2C_Tampa%2C_FL.jpg",
  "dolphin": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Bottlenose_dolphin_with_young.JPG/960px-Bottlenose_dolphin_with_young.JPG",
  "drip": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Button_dripper.JPG/960px-Button_dripper.JPG",
  "duck": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Male_mallard_duck_3.jpg/960px-Male_mallard_duck_3.jpg",
  "earth": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/960px-The_Earth_seen_from_Apollo_17.jpg",
  "fish": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Carassius_auratus_auratus_%28goldfish%29_2.jpg/960px-Carassius_auratus_auratus_%28goldfish%29_2.jpg",
  "fishingnet": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Fisherman_casting_net%2C_vembanad_lake.jpg/960px-Fisherman_casting_net%2C_vembanad_lake.jpg",
  "frog": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Hylarana_erythraea_%28Gregg_Yan%29.jpg/960px-Hylarana_erythraea_%28Gregg_Yan%29.jpg",
  "glacier": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Matanuska_Glacier_mouth.jpg/960px-Matanuska_Glacier_mouth.jpg",
  "glasswater": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Woman_sitting_on_the_floor_drinking_water_from_a_glass_in_a_living_room.jpg/960px-Woman_sitting_on_the_floor_drinking_water_from_a_glass_in_a_living_room.jpg",
  "handpump": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Hand_water_pump_in_India_%283382861084%29.jpg/960px-Hand_water_pump_in_India_%283382861084%29.jpg",
  "ice": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Ice_cubes_openphoto.jpg/960px-Ice_cubes_openphoto.jpg",
  "iceberg": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Iceberg_in_the_Arctic_with_its_underside_exposed.jpg/960px-Iceberg_in_the_Arctic_with_its_underside_exposed.jpg",
  "jellyfish": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Moon_jellyfish_at_Gota_Sagher.JPG/960px-Moon_jellyfish_at_Gota_Sagher.JPG",
  "kelp": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Macrocystis_pyrifera_kelp_forest_Cojo_Anchorage.jpg/960px-Macrocystis_pyrifera_kelp_forest_Cojo_Anchorage.jpg",
  "leaf": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Floating_leaf_%2814510699147%29.jpg/960px-Floating_leaf_%2814510699147%29.jpg",
  "lotus": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Lotus_flower_in_the_fish_pond.jpg/960px-Lotus_flower_in_the_fish_pond.jpg",
  "mangrove": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Mangrove_roots_4.jpg/960px-Mangrove_roots_4.jpg",
  "mirror": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg/960px-Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg",
  "octopus": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Octopus_vulgaris_Merculiano.jpg/960px-Octopus_vulgaris_Merculiano.jpg",
  "oilbird": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Oil_Covered_Pied-billed_Grebe_%285882147624%29.jpg/960px-Oil_Covered_Pied-billed_Grebe_%285882147624%29.jpg",
  "paperboat": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Paper_boat_spelga_reservoir.jpg/960px-Paper_boat_spelga_reservoir.jpg",
  "penguin": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Pygoscelis_papua_-Nagasaki_Penguin_Aquarium_-swimming_underwater-8a.jpg/960px-Pygoscelis_papua_-Nagasaki_Penguin_Aquarium_-swimming_underwater-8a.jpg",
  "plankton": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Diatoms_through_the_microscope.jpg/960px-Diatoms_through_the_microscope.jpg",
  "plasticbeach": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Plastic_Pollution_in_Ghana.jpg/960px-Plastic_Pollution_in_Ghana.jpg",
  "polluted": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Polluted_Malad_Creek_at_Lokhandwala%2CMumbai_%284588707292%29.jpg/960px-Polluted_Malad_Creek_at_Lokhandwala%2CMumbai_%284588707292%29.jpg",
  "puddle": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Water_puddle_on_a_road_after_rain.jpg/960px-Water_puddle_on_a_road_after_rain.jpg",
  "rain": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Rain_over_Beinn_Eich%2C_Luss_Hills%2C_Scotland.jpg/960px-Rain_over_Beinn_Eich%2C_Luss_Hills%2C_Scotland.jpg",
  "rainbarrel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Rainwater-collection-drum.jpg/960px-Rainwater-collection-drum.jpg",
  "raincoat": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Raincoat.jpg/960px-Raincoat.jpg",
  "river": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Chandrabhaga_river_flowing_through_the_Pangi_Valley_in_Chamba_District_of_Himachal_Pradesh.jpg/960px-Chandrabhaga_river_flowing_through_the_Pangi_Valley_in_Chamba_District_of_Himachal_Pradesh.jpg",
  "rubberduck": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/Rubber_duck_in_glass_bowl.jpg/960px-Rubber_duck_in_glass_bowl.jpg",
  "sea": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Baltic_Sea_view_from_Schmiedeberg_hill_in_Rerik%2C_2025-06-23.jpg/960px-Baltic_Sea_view_from_Schmiedeberg_hill_in_Rerik%2C_2025-06-23.jpg",
  "shark": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Tibur%C3%B3n_azul_%28Prionace_glauca%29%2C_canal_Fayal-Pico%2C_islas_Azores%2C_Portugal%2C_2020-07-27%2C_DD_14.jpg/960px-Tibur%C3%B3n_azul_%28Prionace_glauca%29%2C_canal_Fayal-Pico%2C_islas_Azores%2C_Portugal%2C_2020-07-27%2C_DD_14.jpg",
  "ship": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/MAERSK_HANOI_Container_Ship_%28Port_Koper_SIKOP%2C_2023%29.jpg/960px-MAERSK_HANOI_Container_Ship_%28Port_Koper_SIKOP%2C_2023%29.jpg",
  "starfish": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Starfish_on_a_sand_beach_%28Unsplash%29.jpg/960px-Starfish_on_a_sand_beach_%28Unsplash%29.jpg",
  "stone": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Stone_Pebble_Beach_-_Tenerife.jpg/960px-Stone_Pebble_Beach_-_Tenerife.jpg",
  "sun": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/A_sunny_summer_day.jpg/960px-A_sunny_summer_day.jpg",
  "tap": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/CSIRO_ScienceImage_6552_Dripping_tap_Perth_WA_1975.jpg/960px-CSIRO_ScienceImage_6552_Dripping_tap_Perth_WA_1975.jpg",
  "toothbrush": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Toothbrush_x3_20050716_002.jpg/960px-Toothbrush_x3_20050716_002.jpg",
  "trawler": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Fischerboot_vor_Bod%C3%B8.jpg/960px-Fischerboot_vor_Bod%C3%B8.jpg",
  "turtle": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Sea_turtle_breath_underwater_%2820910998842%29.jpg/960px-Sea_turtle_breath_underwater_%2820910998842%29.jpg",
  "umbrella": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/A_man_walks_through_heavy_rain_under_an_umbrella_in_Kigali%2C_Rwanda._Emmanuel_Kwizera.jpg/960px-A_man_walks_through_heavy_rain_under_an_umbrella_in_Kigali%2C_Rwanda._Emmanuel_Kwizera.jpg",
  "waterfall": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Snug_Falls_2.jpg/960px-Snug_Falls_2.jpg",
  "watering": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Child_waters_tomato_plants_with_orange_watering_can_in_garden.jpg/960px-Child_waters_tomato_plants_with_orange_watering_can_in_garden.jpg",
  "well": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Hasel%C3%BCnne_-_Steintorstra%C3%9Fe_-_9Hotel_Wiedehage_06_ies.jpg/960px-Hasel%C3%BCnne_-_Steintorstra%C3%9Fe_-_9Hotel_Wiedehage_06_ies.jpg",
  "whale": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/001_Humpback_whale_breaching_in_Ballena_Marine_National_Park_Photo_by_Giles_Laurent.jpg/960px-001_Humpback_whale_breaching_in_Ballena_Marine_National_Park_Photo_by_Giles_Laurent.jpg",
};


export const QUIZZES = {

  "UKG": [

    {img:"fish",q:"Where does a fish live?",o:["In a tree","In water","In the sky","In a box of sand"],a:1,e:"🐟"},
    {img:"boat",q:"What do we use to travel on water?",o:["A boat","A bicycle","A kite","A school bus"],a:0,e:"⛵"},
    {img:"rain",q:"What falls from dark clouds?",o:["Toys","Leaves","Rain","Stones"],a:2,e:"🌧️"},
    {img:"raincoat",q:"What do we wear to stay dry in the rain?",o:["Sunglasses","A scarf","Slippers","A raincoat"],a:3,e:"🧥"},
    {img:"starfish",q:"Which shape does a starfish look like?",o:["A star","A circle","A square","A heart"],a:0,e:"⭐"},
    {img:"duck",q:"Which bird can swim in a pond?",o:["A crow","A duck","A parrot","A sparrow"],a:1,e:"🦆"},
    {img:"river",q:"What flows in a river?",o:["Milk","Sand","Water","Juice"],a:2,e:"🏞️"},
    {img:"whale",q:"Which is the biggest animal in the sea?",o:["A crab","A starfish","A small fish","A whale"],a:3,e:"🐋"},
    {img:"turtle",q:"Which sea animal carries a hard shell on its back?",o:["A turtle","A fish","A dolphin","A jellyfish"],a:0,e:"🐢"},
    {img:"crab",q:"Which animal walks sideways on the beach?",o:["A cow","A hen","A dog","A crab"],a:3,e:"🦀"},
  ],

  "1": [

    {img:"glasswater",q:"Why should we drink clean water every day?",o:["To stay healthy","To feel sleepy","To get dirty","To grow wings"],a:0,e:"🥛"},
    {img:"toothbrush",q:"Which of these do we use water for every morning?",o:["Flying a kite","Brushing our teeth","Reading a book","Sleeping"],a:1,e:"🪥"},
    {img:"leaf",q:"Which of these floats on water?",o:["A stone","A coin","A leaf","A key"],a:2,e:"🍃"},
    {img:"stone",q:"What happens to a stone dropped into water?",o:["It floats","It flies","It melts","It sinks"],a:3,e:"🪨"},
    {img:"paperboat",q:"What does a paper boat do when we put it on water?",o:["It floats","It flies away","It turns into ice","It sinks at once"],a:0,e:"⛵"},
    {img:"darkclouds",q:"Which sky tells us it may rain soon?",o:["A clear blue sky","Dark grey clouds","Many bright stars","A big rainbow"],a:1,e:"🌥️"},
    {img:"watering",q:"Why do we water plants?",o:["To wash the leaves","To scare insects","To help them grow","To make them cold"],a:2,e:"🌱"},
    {img:"tap",q:"What should we do when we finish using a tap?",o:["Leave it running","Paint it","Pull it off","Close it tightly"],a:3,e:"🚰"},
    {img:"umbrella",q:"What do we hold over our head to stay dry in the rain?",o:["An umbrella","A fan","A pillow","A cricket bat"],a:0,e:"☂️"},
    {img:"rubberduck",q:"What does a rubber duck do in a tub of water?",o:["It sinks","It floats","It melts","It swims away"],a:1,e:"🦆"},
  ],

  "2": [

    {img:"dolphin",q:"Which of these animals lives in the sea?",o:["A lion","A camel","A dolphin","A goat"],a:2,e:"🐬"},
    {img:"frog",q:"Which animal can live both in water and on land?",o:["A frog","A fish","A cow","A parrot"],a:0,e:"🐸"},
    {img:"puddle",q:"On a sunny day, what happens to the water in a puddle?",o:["It turns into sand","It dries up into the air","It turns into ice","It grows bigger"],a:1,e:"☀️"},
    {img:"clouds",q:"Clouds are made of tiny drops of…",o:["Cotton","Smoke","Sugar","Water"],a:3,e:"☁️"},
    {img:"sea",q:"How does sea water taste?",o:["Salty","Sweet","Like milk","Like lemon juice"],a:0,e:"🌊"},
    {img:"ice",q:"What does water turn into in a freezer?",o:["Steam","Juice","Ice","Air"],a:2,e:"🧊"},
    {img:"fish",q:"What helps a fish to swim?",o:["Its legs","Its wings","Its hands","Its fins and tail"],a:3,e:"🐠"},
    {img:"penguin",q:"Which bird cannot fly but swims very well?",o:["A sparrow","A penguin","An eagle","A pigeon"],a:1,e:"🐧"},
    {img:"jellyfish",q:"Which sea animal looks like a floating umbrella?",o:["A jellyfish","A crab","A turtle","A starfish"],a:0,e:"🪼"},
    {img:"ship",q:"What do we call a very big boat that sails on the sea?",o:["A tractor","A bus","A bicycle","A ship"],a:3,e:"🚢"},
  ],

  "3": [

    {img:"river",q:"Which way does river water always flow?",o:["Uphill","Downhill","Round in circles","It never moves"],a:1,e:"💧"},
    {img:"mirror",q:"A large body of still water with land all around it is a…",o:["Lake","River","Sea","Waterfall"],a:0,e:"🏞️"},
    {img:"waterfall",q:"What do we call water falling down from a high cliff?",o:["A well","A pond","A waterfall","A tap"],a:2,e:"🌊"},
    {img:"octopus",q:"Which sea animal has eight long arms?",o:["A starfish","A crab","A whale","An octopus"],a:3,e:"🐙"},
    {img:"coral",q:"The colourful underwater 'gardens' in warm seas are called…",o:["Coral reefs","Deserts","Ice fields","Mango orchards"],a:0,e:"🪸"},
    {img:"whale",q:"Why does a whale come up to the surface of the sea?",o:["To eat grass","To breathe air","To sleep in the sun","To lay eggs on land"],a:1,e:"🐋"},
    {q:"What do we often find on a sandy beach?",o:["Snow","Tigers","Seashells","Mango trees"],a:2,e:"🐚"},
    {img:"fishingnet",q:"Why do fishermen throw nets into the water?",o:["To dry clothes","To fly kites","To stop the rain","To catch fish"],a:3,e:"🎣"},
    {img:"crocodile",q:"Which animal with a long snout and sharp teeth lives in rivers?",o:["A crocodile","A giraffe","A rabbit","A peacock"],a:0,e:"🐊"},
    {img:"sea",q:"Which is the biggest?",o:["A pond","A sea","A puddle","A bucket of water"],a:1,e:"🌊"},
  ],

  "4": [

    {img:"puddle",q:"When the Sun heats water and it turns into vapour, it is called…",o:["Freezing","Melting","Evaporation","Floating"],a:2,e:"☀️"},
    {q:"Water drops appear on the outside of a glass of cold water. This is called…",o:["Condensation","Evaporation","Boiling","Melting"],a:0,e:"🥛"},
    {img:"rain",q:"Rain, snow and hail falling from clouds are called…",o:["Pollution","Germination","Evaporation","Precipitation"],a:3,e:"🌧️"},
    {img:"lotus",q:"Which flower grows in ponds with its leaves floating on the water?",o:["Sunflower","Lotus","Rose","Marigold"],a:1,e:"🪷"},
    {img:"duck",q:"Which bird has webbed feet to paddle in water?",o:["A hen","A crow","A duck","A parrot"],a:2,e:"🦆"},
    {img:"tap",q:"What is the best way to save water while brushing your teeth?",o:["Turn off the tap","Leave the tap running","Open two taps","Brush for an hour"],a:0,e:"🚰"},
    {img:"rainbarrel",q:"Collecting rainwater from rooftops to use later is called…",o:["Water wasting","Water boiling","Rain dancing","Rainwater harvesting"],a:3,e:"🏠"},
    {img:"polluted",q:"What happens to fish when a river is full of rubbish and dirty water?",o:["They grow bigger","They fall sick and may die","They turn golden","They learn to fly"],a:1,e:"🐟"},
    {img:"bucket",q:"Which of these uses the least water?",o:["A shower left running for 20 minutes","Filling a bathtub twice","A bath with one bucket","Washing a car with a running pipe"],a:2,e:"🪣"},
    {img:"glacier",q:"In summer, ice on high mountains melts and fills…",o:["Rivers","Deserts","Volcanoes","Caves of sand"],a:0,e:"🏔️"},
  ],

  "5": [

    {img:"kelp",q:"Which part of the ocean gets the most sunlight?",o:["The deepest bottom","Near the surface","Under the sea floor","Inside underwater caves"],a:1,e:"☀️"},
    {img:"anglerfish",q:"Why is the deep ocean so dark?",o:["The water there is black","Fish switch off the lights","Sunlight cannot reach that deep","It is always night-time there"],a:2,e:"🌑"},
    {img:"anglerfish",q:"Some deep-sea fish make their own light. How does this help them?",o:["To find food in the dark","To get a suntan","To warm the water","To read"],a:0,e:"🐟"},
    {img:"shark",q:"In a sea food chain: tiny plants → small fish → big fish → ? Which animal eats the big fish?",o:["Seaweed","Sand","Plankton","A shark"],a:3,e:"🦈"},
    {img:"kelp",q:"Like plants on land, seaweed makes its food using…",o:["Sand","Sunlight","Moonlight","Salt only"],a:1,e:"🌿"},
    {img:"sea",q:"Why can't we drink sea water?",o:["It is too salty","It is too cold","It is purple","It has no water in it"],a:0,e:"🌊"},
    {img:"river",q:"Which of these gives us fresh water to drink?",o:["The sea","A salt pan","A river or a lake","An ocean"],a:2,e:"💧"},
    {img:"handpump",q:"Water from deep under the ground can be drawn up using a…",o:["Kite","Ladder","Telescope","Hand pump"],a:3,e:"⛲"},
    {img:"dam",q:"A big wall built across a river to store water is a…",o:["Dam","Bridge","Tunnel","Lighthouse"],a:0,e:"🧱"},
    {img:"earth",q:"Look at the Earth from space. Most of its surface is covered by…",o:["Sand","Water","Ice","Forests"],a:1,e:"🌍"},
  ],

  "6": [

    {img:"sun",q:"What gives the energy that keeps the water cycle going?",o:["The Moon","Fish","The Sun","The wind alone"],a:2,e:"☀️"},
    {q:"Plants give out water vapour through tiny holes in their leaves. This is called…",o:["Transpiration","Condensation","Pollination","Germination"],a:0,e:"🌿"},
    {img:"well",q:"Rainwater that soaks into the soil and collects deep underground is called…",o:["Sea water","Tap water","Steam","Groundwater"],a:3,e:"💧"},
    {img:"handpump",q:"Why are wells and hand pumps drying up in many villages?",o:["The Moon pulls the water away","Groundwater is used faster than rain can refill it","Fish drink it all","Water turns into sand"],a:1,e:"⛲"},
    {img:"sea",q:"Where is most of the water on Earth?",o:["In rivers","In lakes","In clouds","In the oceans"],a:3,e:"🌊"},
    {img:"mangrove",q:"Trees that grow in salty water along the coast and protect it from storms are…",o:["Mangroves","Cactuses","Pine trees","Banana trees"],a:0,e:"🌳"},
    {img:"lotus",q:"Water plants have air spaces in their stems and leaves. This helps them to…",o:["Sink to the bottom","Make salt","Float","Grow roots in the air"],a:2,e:"🪷"},
    {img:"frog",q:"In a pond, frogs eat insects and snakes eat frogs. If all the snakes went away, the frogs would…",o:["Increase in number","Turn into snakes","Stop eating","Disappear at once"],a:0,e:"🐸"},
    {img:"clouds",q:"Water vapour cools high up in the sky and forms…",o:["Rocks","Clouds","Sand dunes","Rainbows only"],a:1,e:"☁️"},
    {img:"iceberg",q:"Why does an iceberg float on the sea?",o:["It is hot inside","It has air pumps","It is magnetic","Ice is lighter than the same amount of water"],a:3,e:"🧊"},
  ],

  "7": [

    {img:"plasticbeach",q:"Why is plastic in the sea dangerous for turtles?",o:["It makes them faster","It keeps them warm","They mistake it for food and choke","It cleans the water"],a:2,e:"🐢"},
    {img:"oilbird",q:"How does an oil spill harm sea birds?",o:["Oil coats their feathers so they cannot fly or stay warm","It makes them sing","It helps them float","It gives them food"],a:0,e:"🛢️"},
    {img:"polluted",q:"Which of these pollutes a river the most?",o:["Fish swimming","Untreated sewage and factory waste","Rain falling","Boats sailing slowly"],a:1,e:"🏭"},
    {img:"boiling",q:"A simple way to make water safer to drink at home is to…",o:["Add sugar","Shake it","Keep it in the sun for a minute","Boil it"],a:3,e:"♨️"},
    {img:"fish",q:"Fish take in oxygen from water using their…",o:["Gills","Lungs","Fins","Scales"],a:0,e:"🐟"},
    {img:"duck",q:"How do webbed feet help a duck?",o:["To climb trees","To dig holes","To paddle in water","To fly faster"],a:2,e:"🦆"},
    {img:"dolphin",q:"Why do dolphins and fish have smooth, pointed (streamlined) bodies?",o:["To look pretty","To move easily through water","To stay warm","To hear better"],a:1,e:"🐬"},
    {img:"drip",q:"Which way of watering crops saves the most water?",o:["Flooding the whole field","Leaving a pipe running","Watering at noon","Drip irrigation"],a:3,e:"💧"},
    {img:"algae",q:"When fertiliser washes into a pond, green algae cover it and the fish die. Why?",o:["The water loses its oxygen","The water gets too salty","The fish get too fat","The Sun gets hotter"],a:0,e:"🟢"},
    {img:"lotus",q:"A lotus leaf has a waxy coating. What does it do?",o:["Makes the leaf sink","Attracts fish","Stops water from soaking in","Makes the leaf sweet"],a:2,e:"🪷"},
  ],

  "8": [

    {img:"bleached",q:"Coral reefs turn white (bleach) mainly because…",o:["The sea water becomes too warm","The water gets too cold","Fish paint them","There is too much moonlight"],a:0,e:"🪸"},
    {img:"plankton",q:"Tiny ocean plants called phytoplankton matter to us because they…",o:["Make the sea salty","Make much of the oxygen we breathe","Cause the tides","Eat whales"],a:1,e:"🌊"},
    {img:"trawler",q:"What happens when too many fish are caught from the sea?",o:["The sea gets bigger","More fish appear","Fish numbers fall and food chains break","The waves stop"],a:2,e:"🎣"},
    {q:"Removing the salt from sea water to make drinking water is called…",o:["Evaporation","Pollination","Fertilisation","Desalination"],a:3,e:"🏭"},
    {img:"rainbarrel",q:"Which of these helps refill groundwater in a city?",o:["Rainwater harvesting","More concrete roads","Cutting trees","Filling ponds with soil"],a:0,e:"🏙️"},
    {img:"polluted",q:"Before used water from homes goes back into a river, it should be…",o:["Coloured","Treated to clean it","Heated to boiling","Mixed with plastic"],a:1,e:"🚿"},
    {img:"mangrove",q:"During a cyclone, mangrove forests help the coast by…",o:["Making the waves taller","Pulling in more clouds","Drying up the sea","Slowing down strong waves"],a:3,e:"🌳"},
    {img:"glacier",q:"Melting glaciers and ice sheets can cause…",o:["Deserts in the sea","The Moon to move","Sea levels to rise","Rivers to stop flowing downhill"],a:2,e:"🏔️"},
    {img:"plasticbeach",q:"Tiny bits of plastic in the sea can reach our plates through…",o:["The fish and seafood we eat","Rainbows","Moonlight","The sea breeze only"],a:0,e:"🐟"},
    {img:"tap",q:"Which of these saves the most water at home?",o:["Washing the car with a running pipe","Fixing leaking taps","Leaving taps open","Long showers twice a day"],a:1,e:"🚰"},
  ],
};
