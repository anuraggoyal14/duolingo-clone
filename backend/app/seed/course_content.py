"""Original seed course content: Spanish for English speakers.

Structure: COURSE -> units -> skills -> lessons -> exercises.
Exercise types: multiple_choice, translate, match_pairs, fill_blank, type_answer.
"""

COURSE = {
    "code": "es",
    "title": "Spanish",
    "from_language": "en",
    "units": [
        # ------------------------------------------------------------------
        # UNIT 1
        # ------------------------------------------------------------------
        {
            "title": "Unit 1",
            "description": "Form basic sentences, greet people, order food",
            "color": "green",
            "skills": [
                {
                    "title": "Intro",
                    "icon": "egg",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the man”?",
                                    "choices": [
                                        {"text": "el hombre", "emoji": "👨"},
                                        {"text": "la mujer", "emoji": "👩"},
                                        {"text": "el niño", "emoji": "👦"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the woman”?",
                                    "choices": [
                                        {"text": "el niño", "emoji": "👦"},
                                        {"text": "la mujer", "emoji": "👩"},
                                        {"text": "la niña", "emoji": "👧"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el hombre", "the man"],
                                        ["la mujer", "the woman"],
                                        ["el niño", "the boy"],
                                        ["la niña", "the girl"],
                                        ["y", "and"],
                                    ],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I am a man.",
                                    "source_lang": "en",
                                    "word_bank": ["hombre", "un", "soy", "Yo", "mujer", "una"],
                                    "answers": ["Yo soy un hombre.", "Soy un hombre."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Yo ___ una mujer.",
                                    "translation": "I am a woman.",
                                    "choices": ["eres", "soy", "es"],
                                    "answer": "soy",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "El niño y la niña.",
                                    "source_lang": "es",
                                    "word_bank": ["girl", "and", "The", "man", "boy", "the", "a"],
                                    "answers": ["The boy and the girl."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the girl",
                                    "source_lang": "en",
                                    "answers": ["la niña", "la nina"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "la mujer",
                                    "source_lang": "es",
                                    "answers": ["the woman", "woman"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “Ella es una niña.”",
                                    "choices": [
                                        {"text": "She is a girl."},
                                        {"text": "He is a boy."},
                                        {"text": "She is a woman."},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["yo", "I"],
                                        ["tú", "you"],
                                        ["él", "he"],
                                        ["ella", "she"],
                                        ["sí", "yes"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the boy”?",
                                    "choices": [
                                        {"text": "la niña", "emoji": "👧"},
                                        {"text": "el hombre", "emoji": "👨"},
                                        {"text": "el niño", "emoji": "👦"},
                                    ],
                                    "answer": 2,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Tú ___ un niño.",
                                    "translation": "You are a boy.",
                                    "choices": ["soy", "eres", "es"],
                                    "answer": "eres",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "He is a man.",
                                    "source_lang": "en",
                                    "word_bank": ["es", "hombre", "Él", "una", "eres", "un"],
                                    "answers": ["Él es un hombre.", "El es un hombre."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Ella ___ una mujer.",
                                    "translation": "She is a woman.",
                                    "choices": ["es", "soy", "eres"],
                                    "answer": "es",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "No, yo soy una mujer.",
                                    "source_lang": "es",
                                    "word_bank": ["am", "woman", "No", "he", "I", "a", "man", "yes"],
                                    "answers": ["No, I am a woman.", "No, I'm a woman."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "you are",
                                    "source_lang": "en",
                                    "answers": ["tú eres", "tu eres", "eres"],
                                },
                            ]
                        },
                    ],
                },
                {
                    "title": "Greetings",
                    "icon": "chat",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “good morning”?",
                                    "choices": [
                                        {"text": "buenas noches", "emoji": "🌙"},
                                        {"text": "buenos días", "emoji": "☀️"},
                                        {"text": "hola", "emoji": "👋"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["hola", "hello"],
                                        ["adiós", "goodbye"],
                                        ["gracias", "thank you"],
                                        ["por favor", "please"],
                                        ["buenas noches", "good night"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “thank you”?",
                                    "choices": [
                                        {"text": "por favor"},
                                        {"text": "gracias"},
                                        {"text": "adiós"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Hello, I am Ana.",
                                    "source_lang": "en",
                                    "word_bank": ["soy", "Ana", "Hola", "adiós", "yo", "eres"],
                                    "answers": ["Hola, yo soy Ana.", "Hola, soy Ana."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "___ días, señor.",
                                    "translation": "Good morning, sir.",
                                    "choices": ["Buenas", "Buenos", "Gracias"],
                                    "answer": "Buenos",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Buenas noches y gracias.",
                                    "source_lang": "es",
                                    "word_bank": ["night", "thank", "Good", "please", "and", "you", "morning"],
                                    "answers": ["Good night and thank you.", "Good night and thanks."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "please",
                                    "source_lang": "en",
                                    "answers": ["por favor"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "adiós",
                                    "source_lang": "es",
                                    "answers": ["goodbye", "bye", "good bye"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “¿Cómo estás?”",
                                    "choices": [
                                        {"text": "How are you?"},
                                        {"text": "What is your name?"},
                                        {"text": "Where are you?"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["bien", "well"],
                                        ["mucho gusto", "nice to meet you"],
                                        ["me llamo", "my name is"],
                                        ["por favor", "please"],
                                        ["buenos días", "good morning"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these means “I'm fine”?",
                                    "choices": [
                                        {"text": "Estoy bien."},
                                        {"text": "Me llamo Luis."},
                                        {"text": "Buenas noches."},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Hola, me ___ Carlos.",
                                    "translation": "Hello, my name is Carlos.",
                                    "choices": ["soy", "llamo", "estás"],
                                    "answer": "llamo",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "¿Cómo estás?",
                                    "source_lang": "es",
                                    "word_bank": ["are", "How", "is", "you", "name", "I"],
                                    "answers": ["How are you?"],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I am fine, thank you.",
                                    "source_lang": "en",
                                    "word_bank": ["gracias", "Estoy", "hola", "bien", "eres", "soy"],
                                    "answers": ["Estoy bien, gracias.", "Bien, gracias."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Mucho ___, Ana.",
                                    "translation": "Nice to meet you, Ana.",
                                    "choices": ["bien", "gracias", "gusto"],
                                    "answer": "gusto",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "mucho gusto",
                                    "source_lang": "es",
                                    "answers": ["nice to meet you", "pleased to meet you"],
                                },
                            ]
                        },
                    ],
                },
                {
                    "title": "Food",
                    "icon": "food",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the water”?",
                                    "choices": [
                                        {"text": "el agua", "emoji": "💧"},
                                        {"text": "el pan", "emoji": "🍞"},
                                        {"text": "la leche", "emoji": "🥛"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the apple”?",
                                    "choices": [
                                        {"text": "el café", "emoji": "☕"},
                                        {"text": "la manzana", "emoji": "🍎"},
                                        {"text": "el pan", "emoji": "🍞"},
                                        {"text": "la leche", "emoji": "🥛"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el pan", "bread"],
                                        ["el agua", "water"],
                                        ["la leche", "milk"],
                                        ["la manzana", "apple"],
                                        ["el café", "coffee"],
                                    ],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Yo ___ agua.",
                                    "translation": "I drink water.",
                                    "choices": ["como", "bebo", "soy"],
                                    "answer": "bebo",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I eat bread.",
                                    "source_lang": "en",
                                    "word_bank": ["pan", "como", "leche", "Yo", "bebo"],
                                    "answers": ["Yo como pan.", "Como pan.", "Yo como el pan."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Bebo leche y café.",
                                    "source_lang": "es",
                                    "word_bank": ["milk", "coffee", "drink", "eat", "I", "and", "water"],
                                    "answers": ["I drink milk and coffee."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the bread",
                                    "source_lang": "en",
                                    "answers": ["el pan"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "la manzana",
                                    "source_lang": "es",
                                    "answers": ["the apple", "apple"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the cheese”?",
                                    "choices": [
                                        {"text": "el queso", "emoji": "🧀"},
                                        {"text": "el arroz", "emoji": "🍚"},
                                        {"text": "la naranja", "emoji": "🍊"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el arroz", "rice"],
                                        ["el queso", "cheese"],
                                        ["la naranja", "orange"],
                                        ["la comida", "food"],
                                        ["quiero", "I want"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “Quiero un café, por favor.”",
                                    "choices": [
                                        {"text": "I want a coffee, please."},
                                        {"text": "I drink coffee and milk."},
                                        {"text": "I want an apple, please."},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "La niña come ___.",
                                    "translation": "The girl eats rice.",
                                    "choices": ["agua", "arroz", "leche"],
                                    "answer": "arroz",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "The man eats cheese and bread.",
                                    "source_lang": "en",
                                    "word_bank": ["come", "pan", "El", "queso", "bebe", "y", "hombre", "leche"],
                                    "answers": ["El hombre come queso y pan."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Ella bebe agua.",
                                    "source_lang": "es",
                                    "word_bank": ["water", "She", "eats", "drinks", "He", "milk"],
                                    "answers": ["She drinks water.", "She is drinking water."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Yo ___ una naranja.",
                                    "translation": "I want an orange.",
                                    "choices": ["bebo", "eres", "quiero"],
                                    "answer": "quiero",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the food",
                                    "source_lang": "en",
                                    "answers": ["la comida"],
                                },
                            ]
                        },
                    ],
                },
            ],
        },
        # ------------------------------------------------------------------
        # UNIT 2
        # ------------------------------------------------------------------
        {
            "title": "Unit 2",
            "description": "Talk about family, pets, and your home",
            "color": "blue",
            "skills": [
                {
                    "title": "Family",
                    "icon": "family",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the mother”?",
                                    "choices": [
                                        {"text": "el padre", "emoji": "👨"},
                                        {"text": "la madre", "emoji": "👩"},
                                        {"text": "la hermana", "emoji": "👧"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["la madre", "the mother"],
                                        ["el padre", "the father"],
                                        ["el hermano", "the brother"],
                                        ["la hermana", "the sister"],
                                        ["la familia", "the family"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the brother”?",
                                    "choices": [
                                        {"text": "el hermano", "emoji": "👦"},
                                        {"text": "la hermana", "emoji": "👧"},
                                        {"text": "el padre", "emoji": "👨"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Ella es mi ___.",
                                    "translation": "She is my sister.",
                                    "choices": ["hermano", "hermana", "padre"],
                                    "answer": "hermana",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "My mother is Ana.",
                                    "source_lang": "en",
                                    "word_bank": ["es", "Ana", "madre", "padre", "Mi", "soy"],
                                    "answers": ["Mi madre es Ana."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Él es mi hermano.",
                                    "source_lang": "es",
                                    "word_bank": ["my", "He", "sister", "brother", "is", "She", "the"],
                                    "answers": ["He is my brother.", "He's my brother."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "my family",
                                    "source_lang": "en",
                                    "answers": ["mi familia"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "el padre",
                                    "source_lang": "es",
                                    "answers": ["the father", "father", "the dad", "dad"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the grandmother”?",
                                    "choices": [
                                        {"text": "la abuela", "emoji": "👵"},
                                        {"text": "el abuelo", "emoji": "👴"},
                                        {"text": "la hija", "emoji": "👧"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el hijo", "the son"],
                                        ["la hija", "the daughter"],
                                        ["el abuelo", "the grandfather"],
                                        ["la abuela", "the grandmother"],
                                        ["tengo", "I have"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “Tengo un hermano y una hermana.”",
                                    "choices": [
                                        {"text": "I have a son and a daughter."},
                                        {"text": "I have a brother and a sister."},
                                        {"text": "I am a brother and a sister."},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Yo ___ dos hijos.",
                                    "translation": "I have two children.",
                                    "choices": ["soy", "bebo", "tengo"],
                                    "answer": "tengo",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "My grandfather drinks coffee.",
                                    "source_lang": "en",
                                    "word_bank": ["café", "bebe", "Mi", "abuela", "abuelo", "come"],
                                    "answers": ["Mi abuelo bebe café.", "Mi abuelo bebe el café."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Mi hijo come una manzana.",
                                    "source_lang": "es",
                                    "word_bank": ["eats", "apple", "My", "daughter", "son", "an", "a", "drinks"],
                                    "answers": ["My son eats an apple.", "My son is eating an apple."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Tengo una ___, María.",
                                    "translation": "I have a daughter, María.",
                                    "choices": ["hijo", "hija", "abuelo"],
                                    "answer": "hija",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the son",
                                    "source_lang": "en",
                                    "answers": ["el hijo"],
                                },
                            ]
                        },
                    ],
                },
                {
                    "title": "Animals",
                    "icon": "heart",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the dog”?",
                                    "choices": [
                                        {"text": "el gato", "emoji": "🐱"},
                                        {"text": "el perro", "emoji": "🐶"},
                                        {"text": "el pez", "emoji": "🐟"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the bird”?",
                                    "choices": [
                                        {"text": "el pájaro", "emoji": "🐦"},
                                        {"text": "el caballo", "emoji": "🐴"},
                                        {"text": "el gato", "emoji": "🐱"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el perro", "the dog"],
                                        ["el gato", "the cat"],
                                        ["el pájaro", "the bird"],
                                        ["el pez", "the fish"],
                                        ["el caballo", "the horse"],
                                    ],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Tengo un ___ y un gato.",
                                    "translation": "I have a dog and a cat.",
                                    "choices": ["leche", "madre", "perro"],
                                    "answer": "perro",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "The cat drinks milk.",
                                    "source_lang": "en",
                                    "word_bank": ["bebe", "leche", "gato", "El", "perro", "come"],
                                    "answers": ["El gato bebe leche.", "El gato bebe la leche."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Mi hermano tiene un caballo.",
                                    "source_lang": "es",
                                    "word_bank": ["horse", "has", "My", "a", "have", "brother", "dog", "sister"],
                                    "answers": ["My brother has a horse."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the fish",
                                    "source_lang": "en",
                                    "answers": ["el pez"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "el pájaro",
                                    "source_lang": "es",
                                    "answers": ["the bird", "bird"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the cow”?",
                                    "choices": [
                                        {"text": "el ratón", "emoji": "🐭"},
                                        {"text": "el caballo", "emoji": "🐴"},
                                        {"text": "la vaca", "emoji": "🐄"},
                                    ],
                                    "answer": 2,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["la vaca", "the cow"],
                                        ["el ratón", "the mouse"],
                                        ["grande", "big"],
                                        ["pequeño", "small"],
                                        ["blanco", "white"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “El perro es grande.”",
                                    "choices": [
                                        {"text": "The cat is small."},
                                        {"text": "The dog is small."},
                                        {"text": "The dog is big."},
                                    ],
                                    "answer": 2,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "El ratón es ___.",
                                    "translation": "The mouse is small.",
                                    "choices": ["grande", "pequeño", "pequeña"],
                                    "answer": "pequeño",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "La vaca es grande y blanca.",
                                    "source_lang": "es",
                                    "word_bank": ["big", "white", "is", "The", "small", "and", "cow", "black"],
                                    "answers": ["The cow is big and white.", "The cow is large and white."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "The bird is small.",
                                    "source_lang": "en",
                                    "word_bank": ["pequeño", "es", "grande", "pájaro", "El", "gato"],
                                    "answers": ["El pájaro es pequeño."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "La vaca es ___.",
                                    "translation": "The cow is black.",
                                    "choices": ["negro", "blanco", "negra"],
                                    "answer": "negra",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the mouse",
                                    "source_lang": "en",
                                    "answers": ["el ratón", "el raton"],
                                },
                            ]
                        },
                    ],
                },
                {
                    "title": "At home",
                    "icon": "home",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the house”?",
                                    "choices": [
                                        {"text": "la casa", "emoji": "🏠"},
                                        {"text": "la cama", "emoji": "🛏️"},
                                        {"text": "la silla", "emoji": "🪑"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["la casa", "the house"],
                                        ["la cocina", "the kitchen"],
                                        ["la mesa", "the table"],
                                        ["la silla", "the chair"],
                                        ["la cama", "the bed"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the chair”?",
                                    "choices": [
                                        {"text": "la cama", "emoji": "🛏️"},
                                        {"text": "la silla", "emoji": "🪑"},
                                        {"text": "la casa", "emoji": "🏠"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Mi madre está en la ___.",
                                    "translation": "My mother is in the kitchen.",
                                    "choices": ["mesa", "cocina", "silla"],
                                    "answer": "cocina",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "The cat is on the bed.",
                                    "source_lang": "en",
                                    "word_bank": ["en", "cama", "está", "El", "es", "la", "gato", "mesa"],
                                    "answers": ["El gato está en la cama."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Mi casa es pequeña.",
                                    "source_lang": "es",
                                    "word_bank": ["small", "house", "big", "My", "is", "bed"],
                                    "answers": ["My house is small.", "My home is small."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the table",
                                    "source_lang": "en",
                                    "answers": ["la mesa"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "la cocina",
                                    "source_lang": "es",
                                    "answers": ["the kitchen", "kitchen"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the door”?",
                                    "choices": [
                                        {"text": "la ventana", "emoji": "🪟"},
                                        {"text": "la puerta", "emoji": "🚪"},
                                        {"text": "el sofá", "emoji": "🛋️"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["la puerta", "the door"],
                                        ["la ventana", "the window"],
                                        ["el baño", "the bathroom"],
                                        ["el sofá", "the sofa"],
                                        ["la cocina", "the kitchen"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “¿Dónde está el baño?”",
                                    "choices": [
                                        {"text": "Where is the bathroom?"},
                                        {"text": "Where is the kitchen?"},
                                        {"text": "The bathroom is big."},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "El perro está en el ___.",
                                    "translation": "The dog is on the sofa.",
                                    "choices": ["ventana", "sofá", "puerta"],
                                    "answer": "sofá",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "¿Dónde está mi gato?",
                                    "source_lang": "es",
                                    "word_bank": ["is", "cat", "Where", "dog", "my", "the", "are"],
                                    "answers": ["Where is my cat?", "Where's my cat?"],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "The window is big.",
                                    "source_lang": "en",
                                    "word_bank": ["grande", "es", "puerta", "ventana", "La", "pequeña"],
                                    "answers": ["La ventana es grande."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "La ___ está en la cocina.",
                                    "translation": "The door is in the kitchen.",
                                    "choices": ["baño", "puerta", "sofá"],
                                    "answer": "puerta",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the bathroom",
                                    "source_lang": "en",
                                    "answers": ["el baño", "el bano"],
                                },
                            ]
                        },
                    ],
                },
            ],
        },
        # ------------------------------------------------------------------
        # UNIT 3
        # ------------------------------------------------------------------
        {
            "title": "Unit 3",
            "description": "Get around on a trip, describe your day",
            "color": "purple",
            "skills": [
                {
                    "title": "Travel",
                    "icon": "travel",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the plane”?",
                                    "choices": [
                                        {"text": "el avión", "emoji": "✈️"},
                                        {"text": "el tren", "emoji": "🚆"},
                                        {"text": "el hotel", "emoji": "🏨"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el tren", "the train"],
                                        ["el avión", "the plane"],
                                        ["el hotel", "the hotel"],
                                        ["la playa", "the beach"],
                                        ["el aeropuerto", "the airport"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the beach”?",
                                    "choices": [
                                        {"text": "el hotel", "emoji": "🏨"},
                                        {"text": "la playa", "emoji": "🏖️"},
                                        {"text": "el tren", "emoji": "🚆"},
                                        {"text": "el avión", "emoji": "✈️"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Voy a la ___.",
                                    "translation": "I am going to the beach.",
                                    "choices": ["hotel", "playa", "tren"],
                                    "answer": "playa",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I am going to the airport.",
                                    "source_lang": "en",
                                    "word_bank": ["aeropuerto", "al", "la", "Voy", "hotel", "Yo"],
                                    "answers": ["Voy al aeropuerto.", "Yo voy al aeropuerto."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "El tren es grande.",
                                    "source_lang": "es",
                                    "word_bank": ["big", "train", "plane", "The", "is", "small"],
                                    "answers": ["The train is big.", "The train is large."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the train",
                                    "source_lang": "en",
                                    "answers": ["el tren"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "el avión",
                                    "source_lang": "es",
                                    "answers": ["the plane", "the airplane", "the aeroplane", "plane", "airplane"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these is “the suitcase”?",
                                    "choices": [
                                        {"text": "el pasaporte", "emoji": "🛂"},
                                        {"text": "el billete", "emoji": "🎫"},
                                        {"text": "la maleta", "emoji": "🧳"},
                                    ],
                                    "answer": 2,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["el pasaporte", "the passport"],
                                        ["la maleta", "the suitcase"],
                                        ["la estación", "the station"],
                                        ["el billete", "the ticket"],
                                        ["necesito", "I need"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “¿Dónde está la estación?”",
                                    "choices": [
                                        {"text": "Where is the beach?"},
                                        {"text": "Where is the station?"},
                                        {"text": "The station is small."},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Necesito mi ___.",
                                    "translation": "I need my passport.",
                                    "choices": ["pasaporte", "maleta", "playa"],
                                    "answer": "pasaporte",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I need a ticket, please.",
                                    "source_lang": "en",
                                    "word_bank": ["favor", "un", "billete", "una", "Necesito", "por", "maleta"],
                                    "answers": ["Necesito un billete, por favor."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Mi maleta está en el hotel.",
                                    "source_lang": "es",
                                    "word_bank": ["hotel", "is", "My", "the", "passport", "suitcase", "in", "at"],
                                    "answers": ["My suitcase is in the hotel.", "My suitcase is at the hotel."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "¿Dónde ___ el aeropuerto?",
                                    "translation": "Where is the airport?",
                                    "choices": ["es", "está", "soy"],
                                    "answer": "está",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "the passport",
                                    "source_lang": "en",
                                    "answers": ["el pasaporte"],
                                },
                            ]
                        },
                    ],
                },
                {
                    "title": "Daily routine",
                    "icon": "star",
                    "lessons": [
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “Me levanto temprano.”",
                                    "choices": [
                                        {"text": "I get up early."},
                                        {"text": "I go to bed late."},
                                        {"text": "I eat breakfast early."},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["me levanto", "I get up"],
                                        ["desayuno", "I eat breakfast"],
                                        ["trabajo", "I work"],
                                        ["temprano", "early"],
                                        ["la mañana", "the morning"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these means “I eat breakfast”?",
                                    "choices": [
                                        {"text": "trabajo", "emoji": "💼"},
                                        {"text": "desayuno", "emoji": "🥐"},
                                        {"text": "me levanto", "emoji": "⏰"},
                                    ],
                                    "answer": 1,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Me ___ a las siete.",
                                    "translation": "I get up at seven.",
                                    "choices": ["trabajo", "desayuno", "levanto"],
                                    "answer": "levanto",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I work in the morning.",
                                    "source_lang": "en",
                                    "word_bank": ["la", "mañana", "Trabajo", "noche", "por", "desayuno"],
                                    "answers": ["Trabajo por la mañana.", "Yo trabajo por la mañana."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Mi madre trabaja en un hotel.",
                                    "source_lang": "es",
                                    "word_bank": ["works", "hotel", "My", "in", "work", "a", "mother", "father"],
                                    "answers": ["My mother works in a hotel.", "My mother works at a hotel."],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "early",
                                    "source_lang": "en",
                                    "answers": ["temprano"],
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in English",
                                    "source": "desayuno",
                                    "source_lang": "es",
                                    "answers": ["I eat breakfast", "I have breakfast", "breakfast"],
                                },
                            ]
                        },
                        {
                            "exercises": [
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Which one of these means “I sleep”?",
                                    "choices": [
                                        {"text": "duermo", "emoji": "😴"},
                                        {"text": "me ducho", "emoji": "🚿"},
                                        {"text": "ceno", "emoji": "🍽️"},
                                    ],
                                    "answer": 0,
                                },
                                {
                                    "type": "match_pairs",
                                    "prompt": "Tap the matching pairs",
                                    "pairs": [
                                        ["me ducho", "I shower"],
                                        ["ceno", "I have dinner"],
                                        ["duermo", "I sleep"],
                                        ["tarde", "late"],
                                        ["la noche", "the night"],
                                    ],
                                },
                                {
                                    "type": "multiple_choice",
                                    "prompt": "Select the correct meaning: “Ceno con mi familia.”",
                                    "choices": [
                                        {"text": "I sleep with my family."},
                                        {"text": "I have breakfast with my family."},
                                        {"text": "I have dinner with my family."},
                                    ],
                                    "answer": 2,
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Me ___ por la mañana.",
                                    "translation": "I shower in the morning.",
                                    "choices": ["duermo", "ducho", "ceno"],
                                    "answer": "ducho",
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "I have dinner late.",
                                    "source_lang": "en",
                                    "word_bank": ["tarde", "temprano", "Ceno", "duermo"],
                                    "answers": ["Ceno tarde.", "Yo ceno tarde."],
                                },
                                {
                                    "type": "translate",
                                    "prompt": "Translate this sentence",
                                    "source": "Me levanto temprano y me ducho.",
                                    "source_lang": "es",
                                    "word_bank": ["shower", "early", "I", "up", "late", "and", "get", "I", "sleep"],
                                    "answers": ["I get up early and I shower.", "I get up early and shower."],
                                },
                                {
                                    "type": "fill_blank",
                                    "prompt": "Fill in the blank",
                                    "sentence": "Mi hermano ___ en la cama.",
                                    "translation": "My brother sleeps in the bed.",
                                    "choices": ["duermo", "duerme", "cena"],
                                    "answer": "duerme",
                                },
                                {
                                    "type": "type_answer",
                                    "prompt": "Write this in Spanish",
                                    "source": "I sleep",
                                    "source_lang": "en",
                                    "answers": ["duermo", "yo duermo"],
                                },
                            ]
                        },
                    ],
                },
            ],
        },
    ],
}
