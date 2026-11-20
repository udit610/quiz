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
  theme: "Science All Around Us",
  emoji: "🔬",
  date: "2026-11-21"   // the quiz Saturday, YYYY-MM-DD
};


export const QUESTION_IMAGES = {

  "apple": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/960px-Red_Apple.jpg",
  "backpack": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Back_to_school_lunch_kid_with_backpack_%2829529379805%29.jpg/960px-Back_to_school_lunch_kid_with_backpack_%2829529379805%29.jpg",
  "bacteria": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Bacteria_growth_under_the_microscope_01.jpg/960px-Bacteria_growth_under_the_microscope_01.jpg",
  "ball": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Soccer_Ball_%2846208304925%29.jpg/960px-Soccer_Ball_%2846208304925%29.jpg",
  "balloon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Balloon_on_a_children%27s_birthday_party.jpg/960px-Balloon_on_a_children%27s_birthday_party.jpg",
  "bulb": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Falling_lamp_%28Unsplash%29.jpg/960px-Falling_lamp_%28Unsplash%29.jpg",
  "cat": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Six_weeks_old_cat_%28aka%29.jpg/960px-Six_weeks_old_cat_%28aka%29.jpg",
  "cell": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Animal_Cell_Diagram_Colorful.png/960px-Animal_Cell_Diagram_Colorful.png",
  "cow": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/CH_cow_2.jpg/960px-CH_cow_2.jpg",
  "dog": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Two_puppies_playing_together_one_standing_over_the_other_at_golden_hour_in_Don_Det_Laos.jpg/960px-Two_puppies_playing_together_one_standing_over_the_other_at_golden_hour_in_Don_Det_Laos.jpg",
  "drum": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Snare_drum_-_Vladimir_Morozov.jpg/960px-Snare_drum_-_Vladimir_Morozov.jpg",
  "earth": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/960px-The_Earth_seen_from_Apollo_17.jpg",
  "eggs": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Eggs_in_basket_2020_G1.jpg/960px-Eggs_in_basket_2020_G1.jpg",
  "eye": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Eye_iris.jpg/960px-Eye_iris.jpg",
  "fallingapple": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Falling_apple_crop.jpg/960px-Falling_apple_crop.jpg",
  "fish": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Carassius_auratus_auratus_%28goldfish%29_2.jpg/960px-Carassius_auratus_auratus_%28goldfish%29_2.jpg",
  "fountain": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Fresh_water_fountain.jpg/960px-Fresh_water_fountain.jpg",
  "handwash": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Pupil_washes_hands_during_COVID-19_pandemic_in_Ghana.jpg/960px-Pupil_washes_hands_during_COVID-19_pandemic_in_Ghana.jpg",
  "heart": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Human_heart_model.jpg/960px-Human_heart_model.jpg",
  "ice": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Ice_cubes_openphoto.jpg/960px-Ice_cubes_openphoto.jpg",
  "jupiter": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Portrait_of_Jupiter_from_Cassini.jpg/960px-Portrait_of_Jupiter_from_Cassini.jpg",
  "knife": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Kitchen_knife_made_of_stainless_steel_with_sliced_white_cabbage.jpg/960px-Kitchen_knife_made_of_stainless_steel_with_sliced_white_cabbage.jpg",
  "leaf": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Floating_leaf_%2814510699147%29.jpg/960px-Floating_leaf_%2814510699147%29.jpg",
  "lemon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Lemon.jpg/960px-Lemon.jpg",
  "lightning": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Lightning_Pritzerbe_01_%28MK%29.jpg/960px-Lightning_Pritzerbe_01_%28MK%29.jpg",
  "lungs": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Human_Lungs_%28NIH_BioArt_231_-_630887%29.png/960px-Human_Lungs_%28NIH_BioArt_231_-_630887%29.png",
  "magnet": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Horseshoe_magnet_metal_shavings.jpg/960px-Horseshoe_magnet_metal_shavings.jpg",
  "mars": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/960px-OSIRIS_Mars_true_color.jpg",
  "mirror": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg/960px-Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg",
  "moon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/960px-FullMoon2010.jpg",
  "plug": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Light_switch_turned_on.jpg/960px-Light_switch_turned_on.jpg",
  "rain": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Rain_over_Beinn_Eich%2C_Luss_Hills%2C_Scotland.jpg/960px-Rain_over_Beinn_Eich%2C_Luss_Hills%2C_Scotland.jpg",
  "rainbow": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Rainbow_over_Border_farmland_-_geograph.org.uk_-_1713648.jpg/960px-Rainbow_over_Border_farmland_-_geograph.org.uk_-_1713648.jpg",
  "raincoat": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5b/Raincoat.jpg/960px-Raincoat.jpg",
  "recycle": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Recycling_bins_Drammen.jpg/960px-Recycling_bins_Drammen.jpg",
  "saturn": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Saturn_from_Cassini_Orbiter_%282004-10-06%29.jpg/960px-Saturn_from_Cassini_Orbiter_%282004-10-06%29.jpg",
  "seedling": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Maize_seedling_within_the_coleoptile.jpg/960px-Maize_seedling_within_the_coleoptile.jpg",
  "seesaw": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Playground_seesaw.jpg/960px-Playground_seesaw.jpg",
  "shadow": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Long_shadows_of_people_next_to_man_sitting_on_grass%2C_Alameda_Afonso_Henriques%2C_Lisbon%2C_Portugal_julesvernex2.jpg/960px-Long_shadows_of_people_next_to_man_sitting_on_grass%2C_Alameda_Afonso_Henriques%2C_Lisbon%2C_Portugal_julesvernex2.jpg",
  "skeleton": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Human_Skeleton_2.jpg/960px-Human_Skeleton_2.jpg",
  "snow": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Crater_Lake_winter_pano2.jpg/960px-Crater_Lake_winter_pano2.jpg",
  "soap": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Aleppo_soap_01.jpg/960px-Aleppo_soap_01.jpg",
  "spring": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Sakura_flowers_blossom.jpg/960px-Sakura_flowers_blossom.jpg",
  "steam": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tea_seemed_especially_steamy_this_morning_%2823553842543%29.jpg/960px-Tea_seemed_especially_steamy_this_morning_%2823553842543%29.jpg",
  "stone": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Stone_Pebble_Beach_-_Tenerife.jpg/960px-Stone_Pebble_Beach_-_Tenerife.jpg",
  "sun": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/A_sunny_summer_day.jpg/960px-A_sunny_summer_day.jpg",
  "sunflower": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Sunflower_head_2026_G1.jpg/960px-Sunflower_head_2026_G1.jpg",
  "telescope": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/SmallAltAzMount.jpg/960px-SmallAltAzMount.jpg",
  "toothbrush": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Toothbrush_x3_20050716_002.jpg/960px-Toothbrush_x3_20050716_002.jpg",
  "tree": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Children_planting_plants_in_Seychelles.jpg/960px-Children_planting_plants_in_Seychelles.jpg",
  "tug": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Tug_of_War_-_Kids_Playing.jpg/960px-Tug_of_War_-_Kids_Playing.jpg",
  "tyre": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/All_Season_tire_tread_and_code.JPG/960px-All_Season_tire_tread_and_code.JPG",
  "wheel": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Clustered_Spires_High-wheel_bicycle_race_2023_MD12.jpg/960px-Clustered_Spires_High-wheel_bicycle_race_2023_MD12.jpg",
};


export const QUIZZES = {

  "UKG": [

    {img:"sun",q:"What gives us light and heat in the daytime?",o:["The Moon","The Sun","A cloud","A star"],a:1,e:"☀️"},
    {img:"moon",q:"What do we see shining in the night sky?",o:["The Sun","A ball","The Moon","A kite"],a:2,e:"🌙"},
    {img:"seedling",q:"What does a plant need to grow?",o:["Water and sunlight","Chocolates","Shoes","Toys"],a:0,e:"🌱"},
    {img:"cow",q:"Which animal says moo?",o:["A dog","A cat","A cow","A duck"],a:2,e:"🐄"},
    {img:"eye",q:"Which part of our body helps us see?",o:["Our ears","Our eyes","Our nose","Our hands"],a:1,e:"👀"},
    {q:"Which part of our body helps us hear sounds?",o:["Our nose","Our tongue","Our ears","Our feet"],a:2,e:"👂"},
    {q:"What do we smell with?",o:["Our eyes","Our nose","Our hands","Our ears"],a:1,e:"👃"},
    {q:"What helps us taste our food?",o:["Our tongue","Our toes","Our hair","Our knees"],a:0,e:"😋"},
    {img:"seedling",q:"Which part of a plant is under the ground?",o:["The flower","The leaf","The root","The fruit"],a:2,e:"🌱"},
    {img:"seedling",q:"What does a baby plant grow from?",o:["A stone","A shoe","A cloud","A seed"],a:3,e:"🌱"},
  ],
  "1": [

    {img:"rain",q:"Where does rain come from?",o:["From clouds","From the ground","From a tap","From a tree"],a:0,e:"🌧️"},
    {img:"fountain",q:"What should we drink when we are thirsty?",o:["Sand","Water","Stones","Leaves"],a:1,e:"💧"},
    {img:"bulb",q:"What do we switch on to see in a dark room?",o:["A fan","A tap","A light bulb","A bed"],a:2,e:"💡"},
    {img:"drum",q:"Which of these makes a loud sound?",o:["A feather","A cotton ball","A leaf","A drum"],a:3,e:"🥁"},
    {q:"What do we use water for?",o:["To wear","To read","To drink and wash","To fly"],a:2,e:"💧"},
    {img:"sun",q:"What is the weather like when the Sun shines brightly?",o:["Rainy","Sunny","Snowy","Stormy"],a:1,e:"☀️"},
    {img:"cat",q:"Which animal makes a meow sound?",o:["A cat","A cow","A hen","A dog"],a:0,e:"🐱"},
    {q:"What melts in the warm Sun?",o:["A book","A shoe","A stone","An ice cube"],a:3,e:"🧊"},
    {q:"Where do we get water to drink?",o:["From a cloud","From a mountain","From a well","From a tree"],a:2,e:"💧"},
    {img:"lightning",q:"What sound does thunder make?",o:["A soft song","A loud rumble","A whisper","A bell"],a:1,e:"🌩️"},
  ],
  "2": [

    {img:"seedling",q:"What do plants use to make their own food?",o:["Moonlight","Rain only","Sunlight","Darkness"],a:2,e:"🌱"},
    {img:"dog",q:"What is a baby dog called?",o:["A kitten","A calf","A puppy","A chick"],a:2,e:"🐶"},
    {img:"snow",q:"In which season do we wear warm clothes?",o:["Summer","Winter","Spring","Rainy season"],a:1,e:"❄️"},
    {img:"wheel",q:"Which simple machine helps a car roll along?",o:["A rope","A wheel","A nail","A spoon"],a:1,e:"🛞"},
    {img:"sunflower",q:"Which part of a plant makes seeds?",o:["The root","The stem","The leaf","The flower"],a:3,e:"🌻"},
    {img:"fish",q:"Which animal lives in water and swims?",o:["A fish","A cow","A dog","A hen"],a:0,e:"🐟"},
    {img:"spring",q:"In which season do flowers bloom and trees get new leaves?",o:["Winter","Summer","Spring","Rainy season"],a:2,e:"🌸"},
    {img:"seesaw",q:"A seesaw works like which simple machine?",o:["A wheel","A screw","A lever","A pulley"],a:2,e:"🛝"},
    {img:"seedling",q:"What do roots do for a plant?",o:["Hold it in the soil and take in water","Make flowers","Catch sunlight","Make seeds"],a:0,e:"🌱"},
    {img:"sun",q:"Which season is the hottest in India?",o:["Winter","Summer","Spring","Rainy season"],a:1,e:"☀️"},
  ],
  "3": [

    {img:"magnet",q:"What does a magnet attract?",o:["Wood","Plastic","Iron nails","Rubber"],a:2,e:"🧲"},
    {img:"magnet",q:"What happens when two same poles of magnets come together?",o:["They stick together","They push each other away","They melt","They disappear"],a:1,e:"🧲"},
    {img:"shadow",q:"What do we need to make a shadow?",o:["Light and an object","Water and sand","Wind and rain","A magnet"],a:0,e:"👤"},
    {img:"shadow",q:"When is your shadow the shortest?",o:["In the morning","In the evening","At midday, when the Sun is overhead","At night"],a:2,e:"👤"},
    {img:"leaf",q:"Which of these floats on water?",o:["A coin","A stone","An iron nail","A leaf"],a:3,e:"🍂"},
    {img:"stone",q:"Which of these sinks in water?",o:["A paper boat","A stone","A cork","A leaf"],a:1,e:"🪨"},
    {img:"magnet",q:"Which of these is NOT attracted by a magnet?",o:["A wooden block","A paper clip","An iron nail","A steel spoon"],a:0,e:"🧲"},
    {q:"Which of these floats: an iron nail or a plastic bottle?",o:["Both sink","Both float","The iron nail","The plastic bottle"],a:3,e:"🍂"},
    {img:"shadow",q:"What happens to a shadow when the Sun moves?",o:["It disappears for ever","It stays in the same place","It moves and changes","It becomes a rainbow"],a:2,e:"👤"},
    {img:"shadow",q:"On a sunny day, what follows you everywhere?",o:["Your bag","Your shadow","Your shoes","Your lunch box"],a:1,e:"👤"},
  ],
  "4": [

    {img:"skeleton",q:"What do our bones do?",o:["Make us sleepy","Support our body and give it shape","Help us see","Make our hair grow"],a:1,e:"🦴"},
    {img:"heart",q:"What does the heart do?",o:["It pumps blood around the body","It helps us think","It helps us taste food","It helps us breathe"],a:0,e:"❤️"},
    {img:"plug",q:"What do we use to switch on a fan?",o:["Sunlight","Wind","Water","Electricity"],a:3,e:"🔌"},
    {img:"plug",q:"What should you never touch with wet hands?",o:["A pencil","A book","An electric switch","A towel"],a:2,e:"🔌"},
    {img:"rainbow",q:"When do we see a rainbow?",o:["At night in the dark","After rain, when the Sun shines","On a cloudy day with no Sun","In winter only"],a:1,e:"🌈"},
    {img:"lightning",q:"Why do we see lightning before we hear thunder?",o:["Sound travels faster than light","Thunder comes first","Light travels faster than sound","Lightning is silent"],a:2,e:"⚡"},
    {img:"toothbrush",q:"What do we use to chew our food?",o:["Our teeth","Our lips","Our nose","Our tongue"],a:0,e:"😁"},
    {img:"lungs",q:"What do we breathe in?",o:["Water","Sand","Smoke","Air"],a:3,e:"🫁"},
    {img:"bulb",q:"Which of these runs on electricity?",o:["A kite","A candle","A bulb","A paper fan"],a:2,e:"💡"},
    {img:"balloon",q:"When you rub a balloon on your hair, what happens?",o:["Your hair falls off","Your hair stands up and sticks to the balloon","Nothing happens","Your hair turns blue"],a:1,e:"🎈"},
  ],
  "5": [

    {img:"earth",q:"Which planet do we live on?",o:["Mars","Venus","Earth","Jupiter"],a:2,e:"🌍"},
    {img:"jupiter",q:"Which is the biggest planet in our solar system?",o:["Mars","Jupiter","Earth","Venus"],a:1,e:"🪐"},
    {img:"sun",q:"What is the Sun?",o:["A star","A moon","A cloud","A planet"],a:0,e:"☀️"},
    {img:"ice",q:"Which of these is a solid?",o:["Steam","Water","Air","Ice"],a:3,e:"🧊"},
    {img:"steam",q:"What happens to water when it is heated?",o:["It turns into sand","It disappears for ever","It turns into steam","It turns into ice"],a:2,e:"♨️"},
    {q:"Which of these is a gas?",o:["A stone","Air","Water","Ice"],a:1,e:"💨"},
    {img:"apple",q:"Which scientist explained gravity after watching an apple fall?",o:["Isaac Newton","Albert Einstein","Thomas Edison","Galileo Galilei"],a:0,e:"🍎"},
    {img:"telescope",q:"Which invention helps us see far-away things in the sky?",o:["A thermometer","A compass","A microscope","A telescope"],a:3,e:"🔭"},
    {img:"mars",q:"Which planet is called the Red Planet?",o:["Jupiter","Saturn","Mars","Venus"],a:2,e:"🔴"},
    {img:"saturn",q:"Which planet has beautiful rings around it?",o:["Earth","Saturn","Mercury","Mars"],a:1,e:"🪐"},
  ],
  "6": [

    {img:"tug",q:"What is a force?",o:["A push or a pull","A kind of food","A colour","A sound"],a:0,e:"💪"},
    {img:"ball",q:"What makes a moving ball slow down and stop?",o:["Gravity","Friction","Sunlight","Rain"],a:1,e:"🚗"},
    {q:"Which material lets light pass through it?",o:["Cloth","Wood","Glass","Iron"],a:2,e:"🪟"},
    {img:"magnet",q:"Which material is attracted by a magnet?",o:["Glass","Wood","Plastic","Iron"],a:3,e:"🧲"},
    {img:"tree",q:"Why should we plant more trees?",o:["They make the air dirty","They give us clean air and shade","They block all the rain","They eat our food"],a:1,e:"🌳"},
    {img:"recycle",q:"What is the best thing to do with plastic waste?",o:["Throw it in a river","Burn it","Put it in a recycling bin","Bury it in the garden"],a:2,e:"♻️"},
    {img:"fallingapple",q:"What pulls things down to the Earth?",o:["Gravity","The Moon","Magnetism","The wind"],a:0,e:"🍎"},
    {img:"wheel",q:"Which moves faster: a bicycle or a car?",o:["Both are the same","A bicycle is faster uphill","A bicycle","A car"],a:3,e:"🚗"},
    {img:"raincoat",q:"Which material is best for making a raincoat?",o:["Cotton","Wool","Plastic","Paper"],a:2,e:"🧥"},
    {img:"seesaw",q:"What do we use to lift a heavy thing easily?",o:["A magnet","A lever","A rope only","A mirror"],a:1,e:"🏋️"},
  ],
  "7": [

    {q:"What happens to most things when they are heated?",o:["They shrink","They expand","They turn blue","They disappear"],a:1,e:"🔥"},
    {q:"Which of these is a good conductor of heat?",o:["A steel spoon","A plastic cup","A cotton cloth","A wooden spoon"],a:0,e:"🥄"},
    {img:"mirror",q:"What happens when light hits a mirror?",o:["It passes through","It turns into sound","It is absorbed","It reflects back"],a:3,e:"🪞"},
    {img:"moon",q:"Why do we see the Moon shining at night?",o:["It is a star","It makes its own light","It reflects sunlight","It is on fire"],a:2,e:"🌙"},
    {img:"lemon",q:"Which of these tastes sour?",o:["A banana","A lemon","Sugar","Salt"],a:1,e:"🍋"},
    {img:"soap",q:"Soap is an example of what?",o:["A base","A metal","A gas","An acid"],a:0,e:"🧼"},
    {img:"eggs",q:"Which nutrient helps us grow and build strong muscles?",o:["Sugar","Water","Fibre","Protein"],a:3,e:"🥚"},
    {img:"sun",q:"Which vitamin do we get from sunlight?",o:["Vitamin B","Vitamin C","Vitamin D","Vitamin A"],a:2,e:"☀️"},
    {img:"sun",q:"Why do we wear light-coloured clothes in summer?",o:["They absorb more heat","They reflect heat and keep us cool","They are heavier","They make us taller"],a:1,e:"☀️"},
    {q:"Why does a steel spoon feel colder than a wooden spoon at the same temperature?",o:["Steel carries heat away from your hand faster","Wood is warmer than steel","Steel makes ice","Steel is always cold"],a:0,e:"🥄"},
  ],
  "8": [

    {img:"knife",q:"Why does a sharp knife cut better than a blunt one?",o:["It is heavier","It puts more pressure on a small area","It is colder","It is shinier"],a:1,e:"🔪"},
    {img:"backpack",q:"Why do school bags have broad straps?",o:["To spread the weight and put less pressure on your shoulders","To make the bag heavier","To keep the bag dry","To look nice"],a:0,e:"🎒"},
    {q:"Why do we put oil on a door hinge?",o:["To make it heavier","To change its colour","To make it rust","To reduce friction so it moves smoothly"],a:3,e:"🚪"},
    {img:"tyre",q:"Why are car tyres rough and grooved?",o:["To save fuel","To look nice","To grip the road better with more friction","To make the car slower"],a:2,e:"🚗"},
    {img:"drum",q:"How does sound travel to our ears?",o:["As light rays","Through vibrations in air","Through shadows","It does not travel"],a:1,e:"🔊"},
    {img:"moon",q:"Why can we not hear sound in space?",o:["There is no air to carry the sound","Space is too cold","Astronauts cover their ears","Sound is too slow in space"],a:0,e:"🚀"},
    {img:"cell",q:"What is the smallest unit of life?",o:["A tissue","An organ","An atom","A cell"],a:3,e:"🦠"},
    {img:"cell",q:"Which part of a cell is called its powerhouse?",o:["The cytoplasm","The nucleus","The mitochondria","The cell wall"],a:2,e:"🦠"},
    {img:"bacteria",q:"What helps milk turn into curd?",o:["Fungi","Bacteria","Viruses","Algae"],a:1,e:"🥛"},
    {img:"handwash",q:"Why do we wash our hands before eating?",o:["To remove germs and dirt","To make them warm","To change their colour","To make them soft"],a:0,e:"🧼"},
  ],
};
