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
  theme: "Children's Day",
  emoji: "🎈",
  date: "2026-11-14"   // the quiz Saturday, YYYY-MM-DD
};


export const QUESTION_IMAGES = {

  "ball": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Children_play_joyfully_in_colorful_ball_pit_at_indoor_play_area_during_afternoon_fun.jpg/960px-Children_play_joyfully_in_colorful_ball_pit_at_indoor_play_area_during_afternoon_fun.jpg",

  "teddy": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Little_girl_hugs_teddy_bear_toy.jpg/960px-Little_girl_hugs_teddy_bear_toy.jpg",

  "balloon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Balloon_on_a_children%27s_birthday_party.jpg/960px-Balloon_on_a_children%27s_birthday_party.jpg",

  "cake": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Two_joyful_children_sit_on_a_mat_next_to_a_birthday_cake%2C_dressed_in_festive_hats.jpg/960px-Two_joyful_children_sit_on_a_mat_next_to_a_birthday_cake%2C_dressed_in_festive_hats.jpg",

  "storybook": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Children_reading_beneath_a_tree_-_Story-Friends_%281927%29_-_Mabel_Betsy_Hill.jpg/960px-Children_reading_beneath_a_tree_-_Story-Friends_%281927%29_-_Mabel_Betsy_Hill.jpg",

  "swing": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Playground_swing_01.jpg/960px-Playground_swing_01.jpg",

  "kite": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Kite_flying_over_Pasing_04.jpg/960px-Kite_flying_over_Pasing_04.jpg",

  "butterfly": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Peacock_butterfly_%28Aglais_io%29_2.jpg/960px-Peacock_butterfly_%28Aglais_io%29_2.jpg",

  "dog": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Two_puppies_playing_together_one_standing_over_the_other_at_golden_hour_in_Don_Det_Laos.jpg/960px-Two_puppies_playing_together_one_standing_over_the_other_at_golden_hour_in_Don_Det_Laos.jpg",

  "football": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Children_playing_football_after_school.jpg/960px-Children_playing_football_after_school.jpg",

  "chess": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Chess_game_Staunton_No._6_perfil_view_8.jpg/960px-Chess_game_Staunton_No._6_perfil_view_8.jpg",

  "badminton": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Badminton_Shuttlecock_159415.png/960px-Badminton_Shuttlecock_159415.png",

  "rainbow": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/Rainbow_sky.jpg/960px-Rainbow_sky.jpg",

  "nehru": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Portrait_of_Jawaharlal_Nehru_in_1942.JPG/960px-Portrait_of_Jawaharlal_Nehru_in_1942.JPG",

  "school": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Children_at_school%2C_India.jpg/960px-Children_at_school%2C_India.jpg",

  "friends": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Friendship_Holding_hands..jpg/960px-Friendship_Holding_hands..jpg",

  "cricket": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Cricket_bat_and_ball_at_Bishop%27s_Stortford_Cricket_Club%2C_Hertfordshire.jpg/960px-Cricket_bat_and_ball_at_Bishop%27s_Stortford_Cricket_Club%2C_Hertfordshire.jpg",

  "moon": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/960px-FullMoon2010.jpg",

  "owl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Eurasian_eagle-owl_%2844088%29.jpg/960px-Eurasian_eagle-owl_%2844088%29.jpg",

  "tree": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Children_planting_plants_in_Seychelles.jpg/960px-Children_planting_plants_in_Seychelles.jpg",

  "bee": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/European_honey_bee_extracts_nectar.jpg/960px-European_honey_bee_extracts_nectar.jpg",

  "lightning": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Lightning_in_the_Sky_%289357443%29.jpg/960px-Lightning_in_the_Sky_%289357443%29.jpg"

};


export const QUIZZES = {

  "UKG": [

    {img:"ball",q:"What do we do with a ball?",o:["Kick and throw it","Eat it","Read it","Wear it"],a:0,e:"⚽"},

    {img:"teddy",q:"Which toy is soft and cuddly?",o:["A stone","A spoon","A teddy bear","A shoe"],a:2,e:"🧸"},

    {img:"balloon",q:"What floats up in the sky at a party?",o:["A book","A balloon","A chair","A shoe"],a:1,e:"🎈"},

    {img:"friends",q:"Who do we play with at school?",o:["A lion","A cloud","A car","Our friends"],a:3,e:"👧"},

    {img:"cake",q:"What do we eat on a birthday?",o:["A stone","A cake","A pencil","A sock"],a:1,e:"🎂"},

    {img:"storybook",q:"What do we do when we are happy?",o:["Smile","Cry","Shout","Hide"],a:0,e:"😊"},

    {img:"storybook",q:"What do we read in?",o:["A plate","A shoe","A storybook","A ball"],a:2,e:"📖"},

    {img:"swing",q:"What do we sit on and swing in a park?",o:["A table","A bed","A bus","A swing"],a:3,e:"🛝"},

    {img:"balloon",q:"What sound does a happy child make?",o:["Ha ha ha","Brr brr","Tick tock","Vroom"],a:0,e:"😄"},

    {img:"friends",q:"Which is the best thing to share with a friend?",o:["A stone","A toy","A shoe","A cloud"],a:1,e:"🤗"}

  ],

  "1": [

    {q:"Why do we celebrate Children's Day?",o:["To celebrate children and their happiness","To celebrate farmers","To celebrate teachers","To celebrate sports"],a:0,e:"🎈"},

    {img:"nehru",q:"Who was called Chacha Nehru?",o:["A storybook hero","Jawaharlal Nehru","A football player","A teacher"],a:1,e:"👴"},

    {img:"kite",q:"Which toy can fly in the sky?",o:["A car","A boat","A train","A kite"],a:3,e:"🪁"},

    {img:"football",q:"What game do we play by hiding?",o:["Cricket","Chess","Hide and seek","Football"],a:2,e:"🙈"},

    {img:"school",q:"What do we carry to school?",o:["A school bag","A pillow","A bucket","A television"],a:0,e:"🎒"},

    {img:"friends",q:"What should we do if a friend falls down?",o:["Laugh at them","Walk away","Help them get up","Hide"],a:2,e:"🤝"},

    {img:"butterfly",q:"What do butterflies do?",o:["Fly from flower to flower","Swim in the sea","Sleep in a cave","Climb a tree"],a:0,e:"🦋"},

    {img:"storybook",q:"Who tells us stories at bedtime?",o:["A cloud","A stone","A car","Our grandparents"],a:3,e:"📖"},

    {img:"cake",q:"What do children love to eat on Children's Day?",o:["Stones","Chocolates","Pencils","Shoes"],a:1,e:"🍫"},

    {img:"friends",q:"What is the best gift for a friend?",o:["A kind smile and a toy","A broken shoe","A stone","A loud shout"],a:0,e:"🎁"}

  ],

  "2": [

    {img:"nehru",q:"Children's Day is the birthday of which leader who loved children?",o:["Mahatma Gandhi","A film star","Jawaharlal Nehru","A cricketer"],a:2,e:"👴"},

    {img:"nehru",q:"Why did Jawaharlal Nehru love children?",o:["He thought children are the future of India","He liked their shoes","He liked their bags","He liked their homework"],a:0,e:"❤️"},

    {img:"friends",q:"What is sharing?",o:["Keeping everything for yourself","Hiding your toys","Breaking a friend's toy","Giving a part of what you have to others"],a:3,e:"🤗"},

    {img:"cricket",q:"Which game is played with a bat and a ball?",o:["Cricket","Hide and seek","Hopscotch","Skipping"],a:0,e:"🏏"},

    {img:"butterfly",q:"Where do birds live?",o:["In a house","In a car","In a nest","In a bag"],a:2,e:"🐦"},

    {img:"storybook",q:"What do we call a book full of stories?",o:["A storybook","A notebook","A diary","A textbook"],a:0,e:"📖"},

    {img:"friends",q:"What makes a good friend?",o:["One who teases others","One who shares and helps","One who breaks toys","One who never talks"],a:1,e:"🤝"},

    {img:"ball",q:"Which toy goes round and round?",o:["A book","A shoe","A plate","A spinning top"],a:3,e:"🌀"},

    {img:"balloon",q:"What do we blow up and pop at a party?",o:["Balloons","Bottles","Books","Bricks"],a:0,e:"🎈"},

    {img:"dog",q:"Which animal is a child's favourite pet?",o:["A lion","A crocodile","A dog","A snake"],a:2,e:"🐶"}

  ],

  "3": [

    {q:"Children's Day is celebrated on which day?",o:["25 December","14 November","15 August","26 January"],a:1,e:"🎈"},

    {img:"school",q:"What is childhood?",o:["The time when we work in an office","The time when we are old","The time when we sleep all day","The time when we are young and growing up"],a:3,e:"👧"},

    {img:"football",q:"Which game needs two teams and a ball?",o:["Football","Chess","Ludo","Carrom"],a:0,e:"⚽"},

    {img:"tree",q:"What do plants need to grow?",o:["Chocolates","Shoes","Water and sunlight","Toys"],a:2,e:"🌱"},

    {img:"storybook",q:"What is a fairy tale?",o:["A maths sum","A news report","A shopping list","A story with magic and kind heroes"],a:3,e:"🧚"},

    {img:"friends",q:"If your friend is sad, what can you do?",o:["Tease them","Listen and cheer them up","Walk away","Take their toy"],a:1,e:"🤗"},

    {img:"school",q:"Why do we go to school?",o:["To learn and make friends","To sleep","To eat only","To play alone"],a:0,e:"🏫"},

    {img:"ball",q:"Which toy helps us learn numbers?",o:["A toy phone","A teddy bear","A board game with dice","A kite"],a:2,e:"🎲"},

    {img:"balloon",q:"What do children shout on Children's Day?",o:["Good night","Happy Children's Day","Time to sleep","Be quiet"],a:1,e:"🎉"},

    {img:"cake",q:"Which is the silliest thing to eat?",o:["A chocolate","An apple","A banana","A shoe"],a:3,e:"😄"}

  ],

  "4": [

    {q:"What does every child have the right to do?",o:["Work all day","Learn and play","Stay hungry","Live alone"],a:1,e:"📚"},

    {img:"nehru",q:"Why is 14 November special?",o:["It is New Year","It is a harvest festival","It is Jawaharlal Nehru's birthday","It is a sports day"],a:2,e:"🎈"},

    {img:"storybook",q:"Which story has a boy who never grows up?",o:["Peter Pan","Cinderella","Snow White","Aladdin"],a:0,e:"🧚"},

    {img:"chess",q:"Which game is played on a board with black and white squares?",o:["Cricket","Football","Badminton","Chess"],a:3,e:"♟️"},

    {img:"tree",q:"Why do we plant trees?",o:["For clean air and shade","To make the ground dirty","To block the sun always","To hide toys"],a:0,e:"🌳"},

    {img:"friends",q:"What does teamwork mean?",o:["Working alone always","Letting one person do everything","Fighting over a game","Working together to do something well"],a:3,e:"🤝"},

    {img:"football",q:"What is hopscotch?",o:["A game with a bat","A game in water","A game where you hop on squares","A game with cards"],a:2,e:"🛝"},

    {img:"storybook",q:"What do we learn from stories?",o:["Good values and new ideas","How to shout","How to break things","How to hide"],a:0,e:"📖"},

    {img:"school",q:"What is a child's superpower?",o:["Sleeping all day","Curiosity","Eating stones","Breaking toys"],a:1,e:"🦸"},

    {img:"rainbow",q:"If you could fly like a bird, where would you go first?",o:["To a cave","To a desert","To the park","To a dark room"],a:2,e:"🐦"}

  ],

  "5": [

    {img:"nehru",q:"Why was Jawaharlal Nehru called Chacha Nehru?",o:["Because he was a teacher","Because he was a singer","Because he was a cook","Because children loved him like an uncle"],a:3,e:"👴"},

    {img:"school",q:"What do schools do on Children's Day?",o:["Celebrate children with fun and games","Close for a month","Give extra homework","Ask children to stay silent"],a:0,e:"🎉"},

    {img:"football",q:"Why is play important for children?",o:["It wastes time","It helps them learn, grow strong and make friends","It makes them tired only","It stops learning"],a:1,e:"⚽"},

    {img:"storybook",q:"Which book tells the story of a boy wizard?",o:["The Jungle Book","Alice in Wonderland","Harry Potter","Pinocchio"],a:2,e:"🧙"},

    {img:"bee",q:"What do bees do for flowers?",o:["Help them make seeds by carrying pollen","Eat their leaves","Break their stems","Hide in them"],a:0,e:"🐝"},

    {img:"friends",q:"What should you do if two friends fight?",o:["Join the fight","Laugh at both","Tell everyone to fight","Help them talk and make up"],a:3,e:"🤝"},

    {q:"What is a hobby?",o:["Something you hate","Something you love doing in your free time","A school rule","A type of food"],a:1,e:"🎨"},

    {img:"badminton",q:"Which game is played with a shuttlecock?",o:["Cricket","Football","Badminton","Hockey"],a:2,e:"🏸"},

    {img:"balloon",q:"What would a child call a rainy day?",o:["A day to stay inside","A day to sleep","A day to shout","A day for paper boats"],a:3,e:"🌧️"},

    {img:"friends",q:"Which is the best way to make a new friend?",o:["Smile and say hello","Hide from them","Take their bag","Shout at them"],a:0,e:"😊"}

  ],

  "6": [

    {img:"nehru",q:"Children's Day in India is celebrated on the birthday of which leader?",o:["Mahatma Gandhi","Sardar Patel","Jawaharlal Nehru","Bhagat Singh"],a:2,e:"👴"},

    {img:"nehru",q:"Nehru believed children are what?",o:["The future of the nation","The best workers","The best cooks","The best singers"],a:0,e:"🌟"},

    {img:"storybook",q:"Who wrote The Jungle Book?",o:["Roald Dahl","Rudyard Kipling","J.K. Rowling","Enid Blyton"],a:1,e:"📖"},

    {img:"football",q:"Which outdoor game improves running and teamwork?",o:["Chess","Ludo","Football","Carrom"],a:2,e:"⚽"},

    {img:"rainbow",q:"Why is a rainbow seen after rain?",o:["The sky is painted","Clouds change colour","Sunlight splits into colours in raindrops","Rain is colourful"],a:2,e:"🌈"},

    {img:"friends",q:"What is empathy?",o:["Understanding how a friend feels","Winning every game","Talking loudly","Ignoring others"],a:0,e:"❤️"},

    {img:"school",q:"Why do children ask so many questions?",o:["Because they are naughty","Because they like noise","Because they are bored","Because they are curious and want to learn"],a:3,e:"❓"},

    {img:"storybook",q:"What is a moral in a story?",o:["A lesson about right and wrong","A funny joke","A long name","A magic trick"],a:0,e:"📖"},

    {img:"cake",q:"What is the best Children's Day gift?",o:["Time to play and a good book","A broken toy","A pile of homework","A long lecture"],a:0,e:"🎁"},

    {img:"school",q:"What do schools usually do for children on Children's Day?",o:["Give them a long exam","Make them sit quietly all day","Organise games, songs and fun activities","Close the school for a month"],a:2,e:"🎉"}

  ],

  "7": [

    {q:"Which of these is a right of every child?",o:["The right to work in a factory","The right to go to school and learn","The right to be ignored","The right to live without food"],a:1,e:"📚"},

    {img:"football",q:"How does playing games help children learn?",o:["It stops all learning","It makes children lazy","It teaches only shouting","It teaches rules, teamwork and thinking"],a:3,e:"⚽"},

    {img:"storybook",q:"Which story is about a girl who falls into a magical world?",o:["Alice in Wonderland","Cinderella","The Jungle Book","Pinocchio"],a:0,e:"🐇"},

    {img:"tree",q:"Why do leaves change colour in autumn?",o:["Because they are painted","Because they get wet","Because they stop making green colour as days get shorter","Because they are tired"],a:2,e:"🍂"},

    {img:"friends",q:"What makes a friendship strong?",o:["Trust, kindness and sharing","Teasing and fighting","Keeping secrets from each other","Never talking"],a:0,e:"🤝"},

    {img:"storybook",q:"Who is the boy who lives with wolves in The Jungle Book?",o:["Mowgli","Peter Pan","Aladdin","Tom Sawyer"],a:0,e:"🐺"},

    {img:"cricket",q:"Which sport needs a bat, a ball and wickets?",o:["Football","Hockey","Kabaddi","Cricket"],a:3,e:"🏏"},

    {img:"lightning",q:"Why do we see lightning before we hear thunder?",o:["Sound travels faster than light","Thunder comes first","Light travels faster than sound","Lightning is silent"],a:2,e:"⚡"},

    {img:"school",q:"What is the most fun way to learn?",o:["By playing a game","By sitting still all day","By reading only rules","By never asking questions"],a:0,e:"🎲"},

    {img:"friends",q:"If you were a superhero for a day, what would you do first?",o:["Help a friend in need","Hide your cape","Eat all the sweets","Sleep all day"],a:0,e:"🦸"}

  ],

  "8": [

    {img:"nehru",q:"Why do we celebrate Children's Day in India on 14 November?",o:["It is Jawaharlal Nehru's birthday, and he loved children","It is the first day of school","It is the day of the first train","It is a harvest festival"],a:0,e:"🎈"},

    {img:"school",q:"What does the right to education mean for a child?",o:["Only some children can learn","Children must pay to learn","Every child should get a chance to learn at school","Children must work instead of learning"],a:2,e:"📚"},

    {img:"storybook",q:"Which author wrote Charlie and the Chocolate Factory?",o:["J.K. Rowling","Enid Blyton","Rudyard Kipling","Roald Dahl"],a:3,e:"📖"},

    {img:"football",q:"Why are rules important in a game?",o:["They make the game fair and fun for everyone","They make the game boring","They stop everyone from playing","They help only one player win"],a:0,e:"⚽"},

    {img:"moon",q:"What causes day and night?",o:["The Sun moving around the Earth","The Earth turning on its axis","The Moon shining","Clouds covering the Sun"],a:1,e:"🌍"},

    {img:"friends",q:"How can you be a good friend online?",o:["By sharing others' photos without asking","By teasing friends in chats","By being kind and never sharing hurtful words","By ignoring everyone"],a:2,e:"💬"},

    {img:"school",q:"What does curiosity help us do?",o:["Ask questions and learn new things","Stop learning","Forget everything","Avoid new ideas"],a:0,e:"❓"},

    {img:"moon",q:"Why does the Moon shine at night?",o:["It makes its own light","It is on fire","It is a star","It reflects sunlight"],a:3,e:"🌙"},

    {img:"friends",q:"What is the best way to spend Children's Day?",o:["Doing extra homework","Sitting alone","Playing, reading and laughing with friends","Watching paint dry"],a:2,e:"🎉"},

    {img:"rainbow",q:"If childhood had a colour, what would it be?",o:["Grey and dull","Bright and cheerful, like a rainbow","Black and dark","White only"],a:1,e:"🌈"}

  ]

};
