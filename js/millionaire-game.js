// ═══════════════════════════════════════════════════════════════
//  LITTLE GENIUS QUIZ ADVENTURE – "Who Wants to Be a Millionaire" for Kids
// ═══════════════════════════════════════════════════════════════
class MillionaireGame {
  constructor() {
    this.language = "en";
    this.currentLevel = 0;
    this.score = 0;
    this.stars = 0;
    this.bestStars = parseInt(localStorage.getItem("mill_best_stars") || "0");
    this.lifelines = { fiftyFifty: true, askFriend: true, skip: true };
    this.answered = false;
    this.currentShuffledAnswers = [];
    this.ac = null; // AudioContext for sounds

    this.questions = this._buildQuestions();
    this.shuffledQuestions = [];
    this._setupModal();
  }

  // ─── Questions Database (4 languages) ─────────────────────────
  _buildQuestions() {
    return [
      // ── Level 1-3: Very Easy ──
      {
        en: {
          q: "What color is the sky on a sunny day?",
          a: ["Blue", "Red", "Green", "Yellow"],
          c: 0,
        },
        ru: {
          q: "Какого цвета небо в солнечный день?",
          a: ["Голубое", "Красное", "Зелёное", "Жёлтое"],
          c: 0,
        },
        de: {
          q: "Welche Farbe hat der Himmel an einem sonnigen Tag?",
          a: ["Blau", "Rot", "Grün", "Gelb"],
          c: 0,
        },
        ar: {
          q: "ما لون السماء في يوم مشمس؟",
          a: ["أزرق", "أحمر", "أخضر", "أصفر"],
          c: 0,
        },
        img: "☀️",
        difficulty: 1,
      },
      {
        en: {
          q: "How many legs does a cat have?",
          a: ["4", "2", "6", "8"],
          c: 0,
        },
        ru: { q: "Сколько ног у кошки?", a: ["4", "2", "6", "8"], c: 0 },
        de: {
          q: "Wie viele Beine hat eine Katze?",
          a: ["4", "2", "6", "8"],
          c: 0,
        },
        ar: { q: "كم عدد أرجل القطة؟", a: ["4", "2", "6", "8"], c: 0 },
        img: "🐱",
        difficulty: 1,
      },
      {
        en: {
          q: "What shape is a ball?",
          a: ["Circle", "Square", "Triangle", "Star"],
          c: 0,
        },
        ru: {
          q: "Какой формы мяч?",
          a: ["Круг", "Квадрат", "Треугольник", "Звезда"],
          c: 0,
        },
        de: {
          q: "Welche Form hat ein Ball?",
          a: ["Kreis", "Quadrat", "Dreieck", "Stern"],
          c: 0,
        },
        ar: { q: "ما شكل الكرة؟", a: ["دائرة", "مربع", "مثلث", "نجمة"], c: 0 },
        img: "⚽",
        difficulty: 1,
      },
      {
        en: {
          q: "What sound does a dog make?",
          a: ["Woof", "Meow", "Moo", "Quack"],
          c: 0,
        },
        ru: {
          q: "Какой звук издаёт собака?",
          a: ["Гав", "Мяу", "Му", "Кря"],
          c: 0,
        },
        de: {
          q: "Welches Geräusch macht ein Hund?",
          a: ["Wau", "Miau", "Muh", "Quak"],
          c: 0,
        },
        ar: {
          q: "ما الصوت الذي يصدره الكلب؟",
          a: ["هاو", "مياو", "مو", "كواك"],
          c: 0,
        },
        img: "🐶",
        difficulty: 1,
      },
      {
        en: {
          q: "What color is a banana?",
          a: ["Yellow", "Blue", "Purple", "Green"],
          c: 0,
        },
        ru: {
          q: "Какого цвета банан?",
          a: ["Жёлтый", "Синий", "Фиолетовый", "Зелёный"],
          c: 0,
        },
        de: {
          q: "Welche Farbe hat eine Banane?",
          a: ["Gelb", "Blau", "Lila", "Grün"],
          c: 0,
        },
        ar: { q: "ما لون الموز؟", a: ["أصفر", "أزرق", "بنفسجي", "أخضر"], c: 0 },
        img: "🍌",
        difficulty: 1,
      },
      // ── Level 4-6: Easy ──
      {
        en: { q: "What is 2 + 3?", a: ["5", "4", "6", "3"], c: 0 },
        ru: { q: "Сколько будет 2 + 3?", a: ["5", "4", "6", "3"], c: 0 },
        de: { q: "Was ist 2 + 3?", a: ["5", "4", "6", "3"], c: 0 },
        ar: { q: "كم يساوي 2 + 3؟", a: ["5", "4", "6", "3"], c: 0 },
        img: "🔢",
        difficulty: 2,
      },
      {
        en: {
          q: "Which animal lives in the ocean?",
          a: ["Fish", "Dog", "Cat", "Bird"],
          c: 0,
        },
        ru: {
          q: "Какое животное живёт в океане?",
          a: ["Рыба", "Собака", "Кошка", "Птица"],
          c: 0,
        },
        de: {
          q: "Welches Tier lebt im Ozean?",
          a: ["Fisch", "Hund", "Katze", "Vogel"],
          c: 0,
        },
        ar: {
          q: "أي حيوان يعيش في المحيط؟",
          a: ["سمكة", "كلب", "قطة", "طائر"],
          c: 0,
        },
        img: "🐟",
        difficulty: 2,
      },
      {
        en: {
          q: "How many fingers do you have on one hand?",
          a: ["5", "4", "6", "10"],
          c: 0,
        },
        ru: {
          q: "Сколько пальцев на одной руке?",
          a: ["5", "4", "6", "10"],
          c: 0,
        },
        de: {
          q: "Wie viele Finger hast du an einer Hand?",
          a: ["5", "4", "6", "10"],
          c: 0,
        },
        ar: { q: "كم عدد أصابع يدك الواحدة؟", a: ["5", "4", "6", "10"], c: 0 },
        img: "✋",
        difficulty: 2,
      },
      {
        en: {
          q: "Which fruit is red and grows on trees?",
          a: ["Apple", "Banana", "Grape", "Orange"],
          c: 0,
        },
        ru: {
          q: "Какой фрукт красный и растёт на деревьях?",
          a: ["Яблоко", "Банан", "Виноград", "Апельсин"],
          c: 0,
        },
        de: {
          q: "Welche Frucht ist rot und wächst auf Bäumen?",
          a: ["Apfel", "Banane", "Traube", "Orange"],
          c: 0,
        },
        ar: {
          q: "أي فاكهة حمراء وتنمو على الأشجار؟",
          a: ["تفاحة", "موزة", "عنب", "برتقالة"],
          c: 0,
        },
        img: "🍎",
        difficulty: 2,
      },
      {
        en: {
          q: "What do bees make?",
          a: ["Honey", "Milk", "Bread", "Juice"],
          c: 0,
        },
        ru: {
          q: "Что делают пчёлы?",
          a: ["Мёд", "Молоко", "Хлеб", "Сок"],
          c: 0,
        },
        de: {
          q: "Was machen Bienen?",
          a: ["Honig", "Milch", "Brot", "Saft"],
          c: 0,
        },
        ar: { q: "ماذا يصنع النحل؟", a: ["عسل", "حليب", "خبز", "عصير"], c: 0 },
        img: "🐝",
        difficulty: 2,
      },
      // ── Level 7-9: Medium ──
      {
        en: {
          q: "Which planet do we live on?",
          a: ["Earth", "Mars", "Moon", "Sun"],
          c: 0,
        },
        ru: {
          q: "На какой планете мы живём?",
          a: ["Земля", "Марс", "Луна", "Солнце"],
          c: 0,
        },
        de: {
          q: "Auf welchem Planeten leben wir?",
          a: ["Erde", "Mars", "Mond", "Sonne"],
          c: 0,
        },
        ar: {
          q: "على أي كوكب نعيش؟",
          a: ["الأرض", "المريخ", "القمر", "الشمس"],
          c: 0,
        },
        img: "🌍",
        difficulty: 3,
      },
      {
        en: {
          q: "How many days are in a week?",
          a: ["7", "5", "6", "10"],
          c: 0,
        },
        ru: { q: "Сколько дней в неделе?", a: ["7", "5", "6", "10"], c: 0 },
        de: {
          q: "Wie viele Tage hat eine Woche?",
          a: ["7", "5", "6", "10"],
          c: 0,
        },
        ar: { q: "كم عدد أيام الأسبوع؟", a: ["7", "5", "6", "10"], c: 0 },
        img: "📅",
        difficulty: 3,
      },
      {
        en: {
          q: "What is the biggest animal on land?",
          a: ["Elephant", "Lion", "Bear", "Horse"],
          c: 0,
        },
        ru: {
          q: "Какое самое большое животное на суше?",
          a: ["Слон", "Лев", "Медведь", "Лошадь"],
          c: 0,
        },
        de: {
          q: "Was ist das größte Landtier?",
          a: ["Elefant", "Löwe", "Bär", "Pferd"],
          c: 0,
        },
        ar: {
          q: "ما أكبر حيوان على اليابسة؟",
          a: ["فيل", "أسد", "دب", "حصان"],
          c: 0,
        },
        img: "🐘",
        difficulty: 3,
      },
      {
        en: { q: "What is 5 + 7?", a: ["12", "11", "13", "10"], c: 0 },
        ru: { q: "Сколько будет 5 + 7?", a: ["12", "11", "13", "10"], c: 0 },
        de: { q: "Was ist 5 + 7?", a: ["12", "11", "13", "10"], c: 0 },
        ar: { q: "كم يساوي 5 + 7؟", a: ["12", "11", "13", "10"], c: 0 },
        img: "➕",
        difficulty: 3,
      },
      {
        en: {
          q: "Which season comes after winter?",
          a: ["Spring", "Summer", "Autumn", "Winter"],
          c: 0,
        },
        ru: {
          q: "Какое время года идёт после зимы?",
          a: ["Весна", "Лето", "Осень", "Зима"],
          c: 0,
        },
        de: {
          q: "Welche Jahreszeit kommt nach dem Winter?",
          a: ["Frühling", "Sommer", "Herbst", "Winter"],
          c: 0,
        },
        ar: {
          q: "أي فصل يأتي بعد الشتاء؟",
          a: ["الربيع", "الصيف", "الخريف", "الشتاء"],
          c: 0,
        },
        img: "🌸",
        difficulty: 3,
      },
      // ── Level 10-12: Medium-Hard ──
      {
        en: {
          q: "How many colors are in a rainbow?",
          a: ["7", "5", "6", "8"],
          c: 0,
        },
        ru: { q: "Сколько цветов в радуге?", a: ["7", "5", "6", "8"], c: 0 },
        de: {
          q: "Wie viele Farben hat ein Regenbogen?",
          a: ["7", "5", "6", "8"],
          c: 0,
        },
        ar: { q: "كم عدد ألوان قوس القزح؟", a: ["7", "5", "6", "8"], c: 0 },
        img: "🌈",
        difficulty: 4,
      },
      {
        en: {
          q: "What do caterpillars turn into?",
          a: ["Butterflies", "Birds", "Bees", "Spiders"],
          c: 0,
        },
        ru: {
          q: "В кого превращаются гусеницы?",
          a: ["Бабочки", "Птицы", "Пчёлы", "Пауки"],
          c: 0,
        },
        de: {
          q: "Was wird aus einer Raupe?",
          a: ["Schmetterling", "Vogel", "Biene", "Spinne"],
          c: 0,
        },
        ar: {
          q: "إلى ماذا تتحول اليرقات؟",
          a: ["فراشات", "طيور", "نحل", "عناكب"],
          c: 0,
        },
        img: "🦋",
        difficulty: 4,
      },
      {
        en: {
          q: "Which animal is the tallest?",
          a: ["Giraffe", "Elephant", "Bear", "Horse"],
          c: 0,
        },
        ru: {
          q: "Какое животное самое высокое?",
          a: ["Жираф", "Слон", "Медведь", "Лошадь"],
          c: 0,
        },
        de: {
          q: "Welches Tier ist am größten?",
          a: ["Giraffe", "Elefant", "Bär", "Pferd"],
          c: 0,
        },
        ar: {
          q: "أي حيوان هو الأطول؟",
          a: ["زرافة", "فيل", "دب", "حصان"],
          c: 0,
        },
        img: "🦒",
        difficulty: 4,
      },
      {
        en: {
          q: "What is the frozen form of water?",
          a: ["Ice", "Steam", "Fog", "Rain"],
          c: 0,
        },
        ru: {
          q: "Что такое замёрзшая вода?",
          a: ["Лёд", "Пар", "Туман", "Дождь"],
          c: 0,
        },
        de: {
          q: "Was ist die gefrorene Form von Wasser?",
          a: ["Eis", "Dampf", "Nebel", "Regen"],
          c: 0,
        },
        ar: {
          q: "ما هو الشكل المتجمد للماء؟",
          a: ["جليد", "بخار", "ضباب", "مطر"],
          c: 0,
        },
        img: "🧊",
        difficulty: 4,
      },
      {
        en: { q: "What is 10 - 4?", a: ["6", "5", "7", "4"], c: 0 },
        ru: { q: "Сколько будет 10 - 4?", a: ["6", "5", "7", "4"], c: 0 },
        de: { q: "Was ist 10 - 4?", a: ["6", "5", "7", "4"], c: 0 },
        ar: { q: "كم يساوي 10 - 4؟", a: ["6", "5", "7", "4"], c: 0 },
        img: "➖",
        difficulty: 4,
      },
      // ── Level 13-15: Hard ──
      {
        en: {
          q: "Which is NOT a continent?",
          a: ["Ocean", "Africa", "Asia", "Europe"],
          c: 0,
        },
        ru: {
          q: "Что НЕ является континентом?",
          a: ["Океан", "Африка", "Азия", "Европа"],
          c: 0,
        },
        de: {
          q: "Was ist KEIN Kontinent?",
          a: ["Ozean", "Afrika", "Asien", "Europa"],
          c: 0,
        },
        ar: {
          q: "أيٌّ مما يلي ليس قارة؟",
          a: ["محيط", "أفريقيا", "آسيا", "أوروبا"],
          c: 0,
        },
        img: "🗺️",
        difficulty: 5,
      },
      {
        en: {
          q: "How many months have 31 days?",
          a: ["7", "6", "5", "4"],
          c: 0,
        },
        ru: { q: "Сколько месяцев по 31 дню?", a: ["7", "6", "5", "4"], c: 0 },
        de: {
          q: "Wie viele Monate haben 31 Tage?",
          a: ["7", "6", "5", "4"],
          c: 0,
        },
        ar: { q: "كم شهراً فيه 31 يوماً؟", a: ["7", "6", "5", "4"], c: 0 },
        img: "📆",
        difficulty: 5,
      },
      {
        en: { q: "What is 3 × 4?", a: ["12", "7", "10", "15"], c: 0 },
        ru: { q: "Сколько будет 3 × 4?", a: ["12", "7", "10", "15"], c: 0 },
        de: { q: "Was ist 3 × 4?", a: ["12", "7", "10", "15"], c: 0 },
        ar: { q: "كم يساوي 3 × 4؟", a: ["12", "7", "10", "15"], c: 0 },
        img: "✖️",
        difficulty: 5,
      },
      {
        en: {
          q: "What gas do plants need to grow?",
          a: ["Carbon dioxide", "Oxygen", "Helium", "Nitrogen"],
          c: 0,
        },
        ru: {
          q: "Какой газ нужен растениям для роста?",
          a: ["Углекислый газ", "Кислород", "Гелий", "Азот"],
          c: 0,
        },
        de: {
          q: "Welches Gas brauchen Pflanzen zum Wachsen?",
          a: ["Kohlendioxid", "Sauerstoff", "Helium", "Stickstoff"],
          c: 0,
        },
        ar: {
          q: "ما الغاز الذي تحتاجه النباتات للنمو؟",
          a: ["ثاني أكسيد الكربون", "أكسجين", "هيليوم", "نيتروجين"],
          c: 0,
        },
        img: "🌱",
        difficulty: 5,
      },
      {
        en: {
          q: "Which animal can fly but is NOT a bird?",
          a: ["Bat", "Eagle", "Penguin", "Owl"],
          c: 0,
        },
        ru: {
          q: "Какое животное умеет летать, но НЕ является птицей?",
          a: ["Летучая мышь", "Орёл", "Пингвин", "Сова"],
          c: 0,
        },
        de: {
          q: "Welches Tier kann fliegen, ist aber KEIN Vogel?",
          a: ["Fledermaus", "Adler", "Pinguin", "Eule"],
          c: 0,
        },
        ar: {
          q: "أي حيوان يستطيع الطيران ولكنه ليس طائراً؟",
          a: ["خفاش", "نسر", "بطريق", "بومة"],
          c: 0,
        },
        img: "🦇",
        difficulty: 5,
      },
    ];
  }

  // ─── UI Labels per language ───────────────────────────────────
  _t(key) {
    const labels = {
      en: {
        title: "Little Genius Quiz",
        subtitle: "Who Wants to Be a Star? ⭐",
        startBtn: "🚀 Start Quiz!",
        question: "Question",
        of: "of",
        stars: "Stars",
        fiftyFifty: "50:50",
        askFriend: "📞 Friend",
        askCrowd: "👥 Crowd",
        skip: "⏭ Skip",
        readAloud: "🔊 Read",
        correct: "Correct! ⭐",
        wrong: "Good try! Let's learn together!",
        nextBtn: "Next Question ➡️",
        tryAgain: "Try Again 🔄",
        congrats: "🎉 Congratulations! 🎉",
        quizComplete: "Quiz Complete!",
        youEarned: "You earned",
        starsLabel: "stars",
        bestScore: "Best",
        playAgain: "🔄 Play Again",
        backToMenu: "📋 Back to Menu",
        levelLabel: "Level",
        hintUsed: "Friend says this might be correct! 🤔",
        crowdVote: "👥 Audience Vote",
        skipped: "Question skipped!",
        langEn: "EN",
        langRu: "🇷🇺",
        langDe: "🇩🇪",
        langAr: "🇸🇦",
      },
      ru: {
        title: "Маленький Гений",
        subtitle: "Кто хочет стать звездой? ⭐",
        startBtn: "🚀 Начать Викторину!",
        question: "Вопрос",
        of: "из",
        stars: "Звёзды",
        fiftyFifty: "50:50",
        askFriend: "📞 Друг",
        askCrowd: "👥 Зал",
        skip: "⏭ Дальше",
        readAloud: "🔊 Прочитать",
        crowdVote: "👥 Голосование зала",
        correct: "Правильно! ⭐",
        wrong: "Хорошая попытка! Давай учиться вместе!",
        nextBtn: "Следующий вопрос ➡️",
        tryAgain: "Попробовать снова 🔄",
        congrats: "🎉 Поздравляем! 🎉",
        quizComplete: "Викторина завершена!",
        youEarned: "Ты получил(а)",
        starsLabel: "звёзд",
        bestScore: "Лучший",
        playAgain: "🔄 Ещё раз",
        backToMenu: "📋 В меню",
        levelLabel: "Уровень",
        hintUsed: "Друг подсказывает, что это может быть правильно! 🤔",
        skipped: "Вопрос пропущен!",
        langEn: "🇬🇧",
        langRu: "🇷🇺",
        langDe: "🇩🇪",
        langAr: "🇸🇦",
      },
      de: {
        title: "Kleines Genie Quiz",
        subtitle: "Wer wird ein Star? ⭐",
        startBtn: "🚀 Quiz starten!",
        question: "Frage",
        of: "von",
        stars: "Sterne",
        fiftyFifty: "50:50",
        askFriend: "📞 Freund",
        askCrowd: "👥 Publikum",
        skip: "⏭ Weiter",
        readAloud: "🔊 Vorlesen",
        crowdVote: "👥 Publikumsabstimmung",
        correct: "Richtig! ⭐",
        wrong: "Guter Versuch! Lass uns zusammen lernen!",
        nextBtn: "Nächste Frage ➡️",
        tryAgain: "Nochmal versuchen 🔄",
        congrats: "🎉 Glückwunsch! 🎉",
        quizComplete: "Quiz abgeschlossen!",
        youEarned: "Du hast verdient",
        starsLabel: "Sterne",
        bestScore: "Bestleistung",
        playAgain: "🔄 Nochmal spielen",
        backToMenu: "📋 Zum Menü",
        levelLabel: "Stufe",
        hintUsed: "Dein Freund denkt, das könnte richtig sein! 🤔",
        skipped: "Frage übersprungen!",
        langEn: "🇬🇧",
        langRu: "🇷🇺",
        langDe: "🇩🇪",
        langAr: "🇸🇦",
      },
      ar: {
        title: "مسابقة العبقري الصغير",
        subtitle: "من يريد أن يصبح نجماً؟ ⭐",
        startBtn: "🚀 ابدأ المسابقة!",
        question: "سؤال",
        of: "من",
        stars: "نجوم",
        fiftyFifty: "50:50",
        askFriend: "📞 صديق",
        askCrowd: "👥 الجمهور",
        skip: "⏭ تخطي",
        readAloud: "🔊 اقرأ بصوت عالٍ",
        crowdVote: "👥 تصويت الجمهور",
        correct: "صحيح! ⭐",
        wrong: "محاولة جيدة! هيا نتعلم معاً!",
        nextBtn: "السؤال التالي ➡️",
        tryAgain: "حاول مرة أخرى 🔄",
        congrats: "🎉 تهانينا! 🎉",
        quizComplete: "انتهت المسابقة!",
        youEarned: "لقد حصلت على",
        starsLabel: "نجوم",
        bestScore: "أفضل نتيجة",
        playAgain: "🔄 العب مرة أخرى",
        backToMenu: "📋 العودة للقائمة",
        levelLabel: "المستوى",
        hintUsed: "صديقك يعتقد أن هذه قد تكون الإجابة! 🤔",
        skipped: "تم تخطي السؤال!",
        langEn: "🇬🇧",
        langRu: "🇷🇺",
        langDe: "🇩🇪",
        langAr: "🇸🇦",
      },
    };
    return (labels[this.language] || labels.en)[key] || key;
  }

  // ─── Reward tiers ─────────────────────────────────────────────
  _prizes() {
    return [
      "$500",
      "$1,000",
      "$2,000",
      "$3,000",
      "$5,000",
      "$10,000",
      "$15,000",
      "$25,000",
      "$50,000",
      "$100,000",
      "$200,000",
      "$400,000",
      "$800,000",
      "$1,500,000",
      "$3,000,000",
    ];
  }

  _safeLevels() {
    return [4, 9];
  } // 0-indexed (level 5 and 10)

  _rewardTiers() {
    return [
      { stars: 1, label: "$500" },
      { stars: 1, label: "$1,000" },
      { stars: 1, label: "$2,000" },
      { stars: 1, label: "$3,000" },
      { stars: 2, label: "$5,000" },
      { stars: 2, label: "$10,000" },
      { stars: 2, label: "$15,000" },
      { stars: 2, label: "$25,000" },
      { stars: 3, label: "$50,000" },
      { stars: 3, label: "$100,000" },
      { stars: 3, label: "$200,000" },
      { stars: 4, label: "$400,000" },
      { stars: 4, label: "$800,000" },
      { stars: 5, label: "$1,500,000" },
      { stars: 5, label: "$3,000,000" },
    ];
  }

  _renderPrizeLadder() {
    const el = document.getElementById("mill-prize-ladder");
    if (!el) return;
    const prizes = this._prizes();
    const safe = this._safeLevels();
    el.innerHTML = "";
    for (let i = prizes.length - 1; i >= 0; i--) {
      const row = document.createElement("div");
      row.className = "mill-prize-row";
      if (i === this.currentLevel) row.classList.add("mill-prize-row--current");
      else if (i < this.currentLevel)
        row.classList.add("mill-prize-row--passed");
      if (safe.includes(i)) row.classList.add("mill-prize-row--safe");
      row.innerHTML = `<span class="mill-prize-level">${
        i + 1
      }</span><span class="mill-prize-amount">${prizes[i]}</span>`;
      el.appendChild(row);
    }
  }

  // ─── Modal Wiring ─────────────────────────────────────────────
  _setupModal() {
    const option = document.getElementById("millionaire-game-option");
    if (option) option.addEventListener("click", () => this._openModal());

    const closeBtn = document.getElementById("close-millionaire-modal");
    if (closeBtn) closeBtn.addEventListener("click", () => this._closeModal());

    const modal = document.getElementById("millionaire-game-modal");
    if (modal)
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this._closeModal();
      });

    // Language buttons
    document.querySelectorAll(".mill-lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._playSound("click");
        this.language = btn.dataset.lang;
        document
          .querySelectorAll(".mill-lang-btn")
          .forEach((b) => b.classList.remove("mill-lang-btn--active"));
        btn.classList.add("mill-lang-btn--active");
        this._updateStartScreen();
        // If in-game, update display
        if (
          document.getElementById("mill-game-screen").style.display !== "none"
        ) {
          this._renderQuestion();
        }
      });
    });

    // Start button
    const startBtn = document.getElementById("mill-start-btn");
    if (startBtn)
      startBtn.addEventListener("click", () => {
        this._playSound("start");
        this._startGame();
      });

    // Play again
    const playAgainBtn = document.getElementById("mill-play-again-btn");
    if (playAgainBtn)
      playAgainBtn.addEventListener("click", () => {
        this._playSound("start");
        this._startGame();
      });

    // Back to menu
    const menuBtn = document.getElementById("mill-menu-btn");
    if (menuBtn)
      menuBtn.addEventListener("click", () => {
        this._playSound("click");
        this._showScreen("mill-start-screen");
      });

    // Lifelines
    const fiftyBtn = document.getElementById("mill-fifty-btn");
    if (fiftyBtn)
      fiftyBtn.addEventListener("click", () => this._useFiftyFifty());

    const friendBtn = document.getElementById("mill-friend-btn");
    if (friendBtn)
      friendBtn.addEventListener("click", () => this._useAskFriend());

    const crowdBtn = document.getElementById("mill-crowd-btn");
    if (crowdBtn) crowdBtn.addEventListener("click", () => this._useAskCrowd());

    const skipBtn = document.getElementById("mill-skip-btn");
    if (skipBtn) skipBtn.addEventListener("click", () => this._useSkip());

    // Read aloud
    const readBtn = document.getElementById("mill-read-btn");
    if (readBtn) readBtn.addEventListener("click", () => this._readAloud());
  }

  _openModal() {
    document.getElementById("more-games-modal").style.display = "none";
    document.getElementById("millionaire-game-modal").style.display = "flex";
    this._showScreen("mill-start-screen");
    this._updateStartScreen();
  }

  _closeModal() {
    document.getElementById("millionaire-game-modal").style.display = "none";
    speechSynthesis.cancel();
  }

  _showScreen(id) {
    ["mill-start-screen", "mill-game-screen", "mill-end-screen"].forEach(
      (s) => {
        const el = document.getElementById(s);
        if (el) el.style.display = s === id ? "flex" : "none";
      }
    );
  }

  _updateStartScreen() {
    const dir = this.language === "ar" ? "rtl" : "ltr";
    const body = document.querySelector(".mill-modal-body");
    if (body) body.dir = dir;

    const titleEl = document.getElementById("mill-title");
    const subEl = document.getElementById("mill-subtitle");
    const startEl = document.getElementById("mill-start-btn");
    const bestEl = document.getElementById("mill-best-score");

    if (titleEl) titleEl.textContent = this._t("title");
    if (subEl) subEl.textContent = this._t("subtitle");
    if (startEl) startEl.textContent = this._t("startBtn");
    if (bestEl)
      bestEl.textContent = `${this._t("bestScore")}: ${this.bestStars} ⭐`;
  }

  // ─── Game Logic ───────────────────────────────────────────────
  _startGame() {
    this.currentLevel = 0;
    this.stars = 0;
    this.lifelines = {
      fiftyFifty: true,
      askFriend: true,
      askCrowd: true,
      skip: true,
    };
    this.answered = false;

    // Shuffle and pick 15 questions with increasing difficulty
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    const byDifficulty = [[], [], [], [], []];
    shuffled.forEach((q) => byDifficulty[q.difficulty - 1].push(q));

    this.shuffledQuestions = [];
    for (let d = 0; d < 5; d++) {
      const pool = byDifficulty[d];
      for (let i = 0; i < 3 && i < pool.length; i++) {
        this.shuffledQuestions.push(pool[i]);
      }
    }

    this._showScreen("mill-game-screen");
    this._updateLifelineButtons();
    this._renderPrizeLadder();
    this._renderQuestion();
  }

  _renderQuestion() {
    if (this.currentLevel >= this.shuffledQuestions.length) {
      this._endGame();
      return;
    }

    this.answered = false;
    this._renderPrizeLadder();

    // Hide crowd poll from previous question
    const pollEl = document.getElementById("mill-crowd-poll");
    if (pollEl) pollEl.style.display = "none";

    const qData = this.shuffledQuestions[this.currentLevel];
    const langData = qData[this.language] || qData.en;
    const dir = this.language === "ar" ? "rtl" : "ltr";

    // Progress
    const progressEl = document.getElementById("mill-progress");
    if (progressEl) {
      progressEl.textContent = `${this._t("question")} ${
        this.currentLevel + 1
      } ${this._t("of")} ${this.shuffledQuestions.length}`;
    }

    // Stars display
    const starsEl = document.getElementById("mill-stars");
    if (starsEl) starsEl.textContent = `⭐ ${this.stars}`;

    // Level indicator
    const levelEl = document.getElementById("mill-level-indicator");
    if (levelEl)
      levelEl.textContent = `${this._t("levelLabel")} ${qData.difficulty}`;

    // Progress bar
    const barEl = document.getElementById("mill-progress-bar");
    if (barEl) {
      barEl.style.width = `${
        (this.currentLevel / this.shuffledQuestions.length) * 100
      }%`;
    }

    // Question emoji
    const emojiEl = document.getElementById("mill-question-emoji");
    if (emojiEl) emojiEl.textContent = qData.img || "❓";

    // Question text
    const questionEl = document.getElementById("mill-question-text");
    if (questionEl) {
      questionEl.textContent = langData.q;
      questionEl.dir = dir;
    }

    // Answer buttons — shuffle so correct answer isn't always first
    const answersEl = document.getElementById("mill-answers");
    if (answersEl) {
      answersEl.innerHTML = "";
      answersEl.dir = dir;
      const labels = ["A", "B", "C", "D"];
      const correctText = langData.a[langData.c];
      const shuffled = [...langData.a].sort(() => Math.random() - 0.5);
      this.currentCorrectIndex = shuffled.indexOf(correctText);
      this.currentShuffledAnswers = shuffled;
      shuffled.forEach((ans, i) => {
        const btn = document.createElement("button");
        btn.className = "mill-answer-btn";
        btn.dataset.index = i;
        btn.innerHTML = `<span class="mill-answer-label">${labels[i]}</span><span class="mill-answer-text">${ans}</span>`;
        btn.addEventListener("click", () => this._selectAnswer(i));
        answersEl.appendChild(btn);
      });
    }

    // Feedback area
    const feedbackEl = document.getElementById("mill-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.className = "mill-feedback";
    }

    // Next button
    const nextEl = document.getElementById("mill-next-btn");
    if (nextEl) nextEl.style.display = "none";
  }

  _selectAnswer(index) {
    if (this.answered) return;
    this.answered = true;

    const qData = this.shuffledQuestions[this.currentLevel];
    const correct = this.currentCorrectIndex;
    const buttons = document.querySelectorAll(".mill-answer-btn");
    const feedbackEl = document.getElementById("mill-feedback");
    const nextEl = document.getElementById("mill-next-btn");

    buttons.forEach((btn) => {
      const idx = parseInt(btn.dataset.index);
      btn.disabled = true;
      if (idx === correct) {
        btn.classList.add("mill-answer-correct");
      }
      if (idx === index && idx !== correct) {
        btn.classList.add("mill-answer-wrong");
      }
    });

    if (index === correct) {
      const reward = this._rewardTiers()[this.currentLevel] || { stars: 1 };
      this.stars += reward.stars;
      if (feedbackEl) {
        feedbackEl.textContent = this._t("correct");
        feedbackEl.className = "mill-feedback mill-feedback-correct";
      }
      this._playSound("correct");
      this._spawnConfetti();
    } else {
      if (feedbackEl) {
        feedbackEl.textContent = this._t("wrong");
        feedbackEl.className = "mill-feedback mill-feedback-wrong";
      }
      this._playSound("wrong");
    }

    if (nextEl) {
      nextEl.style.display = "inline-block";
      nextEl.textContent =
        this.currentLevel + 1 >= this.shuffledQuestions.length
          ? this._t("quizComplete")
          : this._t("nextBtn");
      nextEl.onclick = () => {
        this.currentLevel++;
        this._renderQuestion();
      };
    }
  }

  // ─── Lifelines ────────────────────────────────────────────────
  _useFiftyFifty() {
    if (!this.lifelines.fiftyFifty || this.answered) return;
    this.lifelines.fiftyFifty = false;
    this._playSound("lifeline");

    const correct = this.currentCorrectIndex;

    // Hide 2 wrong answers
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correct);
    const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);

    const buttons = document.querySelectorAll(".mill-answer-btn");
    buttons.forEach((btn) => {
      if (toHide.includes(parseInt(btn.dataset.index))) {
        btn.classList.add("mill-answer-hidden");
        btn.disabled = true;
      }
    });

    this._updateLifelineButtons();
  }

  _useAskFriend() {
    if (!this.lifelines.askFriend || this.answered) return;
    this.lifelines.askFriend = false;
    this._playSound("lifeline");

    const correct = this.currentCorrectIndex;

    // Highlight the correct answer with a "friend" hint
    const buttons = document.querySelectorAll(".mill-answer-btn");
    buttons[correct].classList.add("mill-answer-friend-hint");

    const feedbackEl = document.getElementById("mill-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = this._t("hintUsed");
      feedbackEl.className = "mill-feedback mill-feedback-hint";
    }

    this._updateLifelineButtons();
  }

  _useAskCrowd() {
    if (!this.lifelines.askCrowd || this.answered) return;
    this.lifelines.askCrowd = false;
    this._playSound("lifeline");

    const correct = this.currentCorrectIndex;
    const correctPct = 50 + Math.floor(Math.random() * 30);
    const wrongPcts = [];
    let rem = 100 - correctPct;
    for (let i = 0; i < 2; i++) {
      const p = Math.floor(Math.random() * (rem / (3 - i)));
      wrongPcts.push(p);
      rem -= p;
    }
    wrongPcts.push(rem);

    const pcts = [];
    let wi = 0;
    for (let i = 0; i < 4; i++)
      pcts.push(i === correct ? correctPct : wrongPcts[wi++]);

    const labels = ["A", "B", "C", "D"];
    const pollEl = document.getElementById("mill-crowd-poll");
    if (pollEl) {
      pollEl.style.display = "block";
      pollEl.innerHTML =
        `<div class="mill-crowd-title">${this._t("crowdVote")}</div>` +
        pcts
          .map(
            (pct, i) => `
          <div class="mill-crowd-bar-row">
            <span class="mill-crowd-label">${labels[i]}</span>
            <div class="mill-crowd-bar-track">
              <div class="mill-crowd-bar-fill" style="width:0%" data-target="${pct}"></div>
            </div>
            <span class="mill-crowd-pct">${pct}%</span>
          </div>`
          )
          .join("");
      // Animate bars after paint
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          pollEl.querySelectorAll(".mill-crowd-bar-fill").forEach((bar) => {
            bar.style.width = bar.dataset.target + "%";
          });
        })
      );
    }
    this._updateLifelineButtons();
  }

  _useSkip() {
    if (!this.lifelines.skip || this.answered) return;
    this.lifelines.skip = false;
    this._playSound("lifeline");
    this._updateLifelineButtons();

    const feedbackEl = document.getElementById("mill-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = this._t("skipped");
      feedbackEl.className = "mill-feedback mill-feedback-hint";
    }

    setTimeout(() => {
      this.currentLevel++;
      this._renderQuestion();
    }, 800);
  }

  _updateLifelineButtons() {
    const fiftyBtn = document.getElementById("mill-fifty-btn");
    const friendBtn = document.getElementById("mill-friend-btn");
    const crowdBtn = document.getElementById("mill-crowd-btn");
    const skipBtn = document.getElementById("mill-skip-btn");
    const readBtn = document.getElementById("mill-read-btn");

    if (fiftyBtn) {
      fiftyBtn.disabled = !this.lifelines.fiftyFifty;
      fiftyBtn.textContent = this._t("fiftyFifty");
    }
    if (friendBtn) {
      friendBtn.disabled = !this.lifelines.askFriend;
      friendBtn.textContent = this._t("askFriend");
    }
    if (crowdBtn) {
      crowdBtn.disabled = !this.lifelines.askCrowd;
      crowdBtn.textContent = this._t("askCrowd");
    }
    if (skipBtn) {
      skipBtn.disabled = !this.lifelines.skip;
      skipBtn.textContent = this._t("skip");
    }
    if (readBtn) readBtn.textContent = this._t("readAloud");
  }

  // ─── End Game ─────────────────────────────────────────────────
  _endGame() {
    if (this.stars > this.bestStars) {
      this.bestStars = this.stars;
      localStorage.setItem("mill_best_stars", String(this.bestStars));
    }

    this._showScreen("mill-end-screen");

    const dir = this.language === "ar" ? "rtl" : "ltr";
    const endScreen = document.getElementById("mill-end-screen");
    if (endScreen) endScreen.dir = dir;

    const congratsEl = document.getElementById("mill-congrats");
    if (congratsEl) congratsEl.textContent = this._t("congrats");

    const completeEl = document.getElementById("mill-complete-text");
    if (completeEl) completeEl.textContent = this._t("quizComplete");

    const earnedEl = document.getElementById("mill-earned");
    if (earnedEl)
      earnedEl.textContent = `${this._t("youEarned")} ${this.stars} ${this._t(
        "starsLabel"
      )}`;

    const starDisplay = document.getElementById("mill-star-display");
    if (starDisplay) {
      starDisplay.textContent = "⭐".repeat(Math.min(this.stars, 20));
    }

    const bestEl = document.getElementById("mill-end-best");
    if (bestEl)
      bestEl.textContent = `${this._t("bestScore")}: ${this.bestStars} ⭐`;

    const playAgainBtn = document.getElementById("mill-play-again-btn");
    if (playAgainBtn) playAgainBtn.textContent = this._t("playAgain");

    const menuBtn = document.getElementById("mill-menu-btn");
    if (menuBtn) menuBtn.textContent = this._t("backToMenu");

    this._playSound("win");
    this._spawnConfetti();
  }

  // ─── Read Aloud ───────────────────────────────────────────────
  _readAloud() {
    if (this.currentLevel >= this.shuffledQuestions.length) return;
    speechSynthesis.cancel();

    const qData = this.shuffledQuestions[this.currentLevel];
    const langData = qData[this.language] || qData.en;

    const langMap = { en: "en-US", ru: "ru-RU", de: "de-DE", ar: "ar-SA" };
    const lang = langMap[this.language] || "en-US";

    // Read question
    const utt = new SpeechSynthesisUtterance(langData.q);
    utt.lang = lang;
    utt.rate = 0.85;
    utt.pitch = 1.2;

    // Then read answers in displayed (shuffled) order
    const displayedAnswers = this.currentShuffledAnswers || langData.a;
    utt.onend = () => {
      displayedAnswers.forEach((ans, i) => {
        const labels = ["A", "B", "C", "D"];
        const aUtt = new SpeechSynthesisUtterance(`${labels[i]}: ${ans}`);
        aUtt.lang = lang;
        aUtt.rate = 0.85;
        aUtt.pitch = 1.1;
        speechSynthesis.speak(aUtt);
      });
    };

    speechSynthesis.speak(utt);
  }

  // ─── Sound Effects ────────────────────────────────────────────
  _playSound(type) {
    try {
      if (!this.ac)
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
      const ac = this.ac;
      const now = ac.currentTime;
      const g = ac.createGain();
      g.connect(ac.destination);

      if (type === "correct") {
        // Happy ascending notes
        [523, 659, 784].forEach((f, i) => {
          const o = ac.createOscillator();
          o.type = "sine";
          o.frequency.value = f;
          const eg = ac.createGain();
          eg.gain.setValueAtTime(0.15, now + i * 0.15);
          eg.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
          o.connect(eg);
          eg.connect(ac.destination);
          o.start(now + i * 0.15);
          o.stop(now + i * 0.15 + 0.3);
        });
      } else if (type === "wrong") {
        // Gentle descending
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(400, now);
        o.frequency.exponentialRampToValueAtTime(200, now + 0.4);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        o.connect(g);
        o.start(now);
        o.stop(now + 0.4);
      } else if (type === "lifeline") {
        const o = ac.createOscillator();
        o.type = "triangle";
        o.frequency.setValueAtTime(600, now);
        o.frequency.exponentialRampToValueAtTime(900, now + 0.2);
        g.gain.setValueAtTime(0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.connect(g);
        o.start(now);
        o.stop(now + 0.3);
      } else if (type === "win") {
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ac.createOscillator();
          o.type = "sine";
          o.frequency.value = f;
          const eg = ac.createGain();
          eg.gain.setValueAtTime(0.15, now + i * 0.2);
          eg.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.5);
          o.connect(eg);
          eg.connect(ac.destination);
          o.start(now + i * 0.2);
          o.stop(now + i * 0.2 + 0.5);
        });
      } else if (type === "start") {
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(400, now);
        o.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        o.connect(g);
        o.start(now);
        o.stop(now + 0.25);
      } else {
        // click
        const o = ac.createOscillator();
        o.type = "sine";
        o.frequency.value = 700;
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        o.connect(g);
        o.start(now);
        o.stop(now + 0.08);
      }
    } catch (e) {
      /* ignore audio errors */
    }
  }

  // ─── Confetti Effect ──────────────────────────────────────────
  _spawnConfetti() {
    const container = document.getElementById("mill-confetti");
    if (!container) return;
    container.innerHTML = "";

    const colors = [
      "#ff6b6b",
      "#ffd93d",
      "#6bcb77",
      "#4d96ff",
      "#ff6eb4",
      "#a855f7",
    ];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "mill-confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + "s";
      piece.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = "";
    }, 3000);
  }
}

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
  new MillionaireGame();
});
