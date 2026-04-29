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

      // ════════════════════════════════════════════
      // EXTRA QUESTIONS – 100 MORE
      // ════════════════════════════════════════════

      // ── Extra D1 ──
      { en:{q:"What color is grass?",a:["Green","Blue","Red","Yellow"],c:0}, ru:{q:"Какого цвета трава?",a:["Зелёная","Синяя","Красная","Жёлтая"],c:0}, de:{q:"Welche Farbe hat Gras?",a:["Grün","Blau","Rot","Gelb"],c:0}, ar:{q:"ما لون العشب؟",a:["أخضر","أزرق","أحمر","أصفر"],c:0}, img:"🌿", difficulty:1 },
      { en:{q:"How many legs does a spider have?",a:["8","4","6","2"],c:0}, ru:{q:"Сколько ног у паука?",a:["8","4","6","2"],c:0}, de:{q:"Wie viele Beine hat eine Spinne?",a:["8","4","6","2"],c:0}, ar:{q:"كم عدد أرجل العنكبوت؟",a:["8","4","6","2"],c:0}, img:"🕷️", difficulty:1 },
      { en:{q:"What do cows give us to drink?",a:["Milk","Juice","Water","Tea"],c:0}, ru:{q:"Что дают нам коровы?",a:["Молоко","Сок","Воду","Чай"],c:0}, de:{q:"Was geben uns Kühe zum Trinken?",a:["Milch","Saft","Wasser","Tee"],c:0}, ar:{q:"ماذا تعطينا البقرة للشرب؟",a:["حليب","عصير","ماء","شاي"],c:0}, img:"🐄", difficulty:1 },
      { en:{q:"What color is snow?",a:["White","Black","Blue","Pink"],c:0}, ru:{q:"Какого цвета снег?",a:["Белый","Чёрный","Синий","Розовый"],c:0}, de:{q:"Welche Farbe hat Schnee?",a:["Weiß","Schwarz","Blau","Rosa"],c:0}, ar:{q:"ما لون الثلج؟",a:["أبيض","أسود","أزرق","وردي"],c:0}, img:"❄️", difficulty:1 },
      { en:{q:"How many wheels does a bicycle have?",a:["2","3","4","1"],c:0}, ru:{q:"Сколько колёс у велосипеда?",a:["2","3","4","1"],c:0}, de:{q:"Wie viele Räder hat ein Fahrrad?",a:["2","3","4","1"],c:0}, ar:{q:"كم عدد عجلات الدراجة؟",a:["2","3","4","1"],c:0}, img:"🚲", difficulty:1 },
      { en:{q:"Where do fish live?",a:["Water","Air","Sand","Trees"],c:0}, ru:{q:"Где живут рыбы?",a:["В воде","В воздухе","В песке","На деревьях"],c:0}, de:{q:"Wo leben Fische?",a:["Im Wasser","In der Luft","Im Sand","Auf Bäumen"],c:0}, ar:{q:"أين تعيش الأسماك؟",a:["في الماء","في الهواء","في الرمل","في الأشجار"],c:0}, img:"🐟", difficulty:1 },
      { en:{q:"How many eyes do humans have?",a:["2","1","3","4"],c:0}, ru:{q:"Сколько глаз у человека?",a:["2","1","3","4"],c:0}, de:{q:"Wie viele Augen hat ein Mensch?",a:["2","1","3","4"],c:0}, ar:{q:"كم عدد عيون الإنسان؟",a:["2","1","3","4"],c:0}, img:"👀", difficulty:1 },
      { en:{q:"What color is an orange?",a:["Orange","Green","Blue","Red"],c:0}, ru:{q:"Какого цвета апельсин?",a:["Оранжевый","Зелёный","Синий","Красный"],c:0}, de:{q:"Welche Farbe hat eine Orange?",a:["Orange","Grün","Blau","Rot"],c:0}, ar:{q:"ما لون البرتقال؟",a:["برتقالي","أخضر","أزرق","أحمر"],c:0}, img:"🍊", difficulty:1 },
      { en:{q:"What do birds build to lay their eggs?",a:["Nest","House","Cave","Hole"],c:0}, ru:{q:"Что строят птицы для откладывания яиц?",a:["Гнездо","Дом","Пещеру","Нору"],c:0}, de:{q:"Was bauen Vögel für ihre Eier?",a:["Nest","Haus","Höhle","Loch"],c:0}, ar:{q:"ماذا تبني الطيور لوضع البيض؟",a:["عش","منزل","كهف","حفرة"],c:0}, img:"🐦", difficulty:1 },
      { en:{q:"What is 1 + 1?",a:["2","3","1","4"],c:0}, ru:{q:"Сколько будет 1 + 1?",a:["2","3","1","4"],c:0}, de:{q:"Was ist 1 + 1?",a:["2","3","1","4"],c:0}, ar:{q:"كم يساوي 1 + 1؟",a:["2","3","1","4"],c:0}, img:"🔢", difficulty:1 },
      { en:{q:"What color is the sun?",a:["Yellow","Green","Blue","Red"],c:0}, ru:{q:"Какого цвета солнце?",a:["Жёлтое","Зелёное","Синее","Красное"],c:0}, de:{q:"Welche Farbe hat die Sonne?",a:["Gelb","Grün","Blau","Rot"],c:0}, ar:{q:"ما لون الشمس؟",a:["أصفر","أخضر","أزرق","أحمر"],c:0}, img:"☀️", difficulty:1 },
      { en:{q:"Which animal says 'oink'?",a:["Pig","Dog","Cat","Cow"],c:0}, ru:{q:"Какое животное хрюкает?",a:["Свинья","Собака","Кошка","Корова"],c:0}, de:{q:"Welches Tier macht 'Oink'?",a:["Schwein","Hund","Katze","Kuh"],c:0}, ar:{q:"أي حيوان يقول أوينك؟",a:["خنزير","كلب","قطة","بقرة"],c:0}, img:"🐷", difficulty:1 },
      { en:{q:"How many toes does a foot have?",a:["5","4","6","3"],c:0}, ru:{q:"Сколько пальцев на ноге?",a:["5","4","6","3"],c:0}, de:{q:"Wie viele Zehen hat ein Fuß?",a:["5","4","6","3"],c:0}, ar:{q:"كم عدد أصابع القدم؟",a:["5","4","6","3"],c:0}, img:"🦶", difficulty:1 },
      { en:{q:"What is opposite of day?",a:["Night","Morning","Evening","Noon"],c:0}, ru:{q:"Что противоположно дню?",a:["Ночь","Утро","Вечер","Полдень"],c:0}, de:{q:"Was ist das Gegenteil von Tag?",a:["Nacht","Morgen","Abend","Mittag"],c:0}, ar:{q:"ما عكس النهار؟",a:["ليل","صباح","مساء","ظهر"],c:0}, img:"🌙", difficulty:1 },
      { en:{q:"What do we use to write?",a:["Pencil","Spoon","Fork","Brush"],c:0}, ru:{q:"Чем мы пишем?",a:["Карандашом","Ложкой","Вилкой","Кистью"],c:0}, de:{q:"Womit schreiben wir?",a:["Bleistift","Löffel","Gabel","Pinsel"],c:0}, ar:{q:"بماذا نكتب؟",a:["قلم رصاص","ملعقة","شوكة","فرشاة"],c:0}, img:"✏️", difficulty:1 },
      { en:{q:"What color is a ripe tomato?",a:["Red","Blue","Yellow","Purple"],c:0}, ru:{q:"Какого цвета спелый помидор?",a:["Красный","Синий","Жёлтый","Фиолетовый"],c:0}, de:{q:"Welche Farbe hat eine reife Tomate?",a:["Rot","Blau","Gelb","Lila"],c:0}, ar:{q:"ما لون الطماطم الناضجة؟",a:["أحمر","أزرق","أصفر","بنفسجي"],c:0}, img:"🍅", difficulty:1 },
      { en:{q:"How many wheels does a car have?",a:["4","2","3","6"],c:0}, ru:{q:"Сколько колёс у машины?",a:["4","2","3","6"],c:0}, de:{q:"Wie viele Räder hat ein Auto?",a:["4","2","3","6"],c:0}, ar:{q:"كم عدد عجلات السيارة؟",a:["4","2","3","6"],c:0}, img:"🚗", difficulty:1 },
      { en:{q:"What is the opposite of hot?",a:["Cold","Wet","Big","Fast"],c:0}, ru:{q:"Что является противоположностью горячего?",a:["Холодное","Мокрое","Большое","Быстрое"],c:0}, de:{q:"Was ist das Gegenteil von heiß?",a:["Kalt","Nass","Groß","Schnell"],c:0}, ar:{q:"ما عكس الحار؟",a:["بارد","مبلل","كبير","سريع"],c:0}, img:"🥶", difficulty:1 },
      { en:{q:"What do we call a baby dog?",a:["Puppy","Kitten","Cub","Chick"],c:0}, ru:{q:"Как называется детёныш собаки?",a:["Щенок","Котёнок","Медвежонок","Птенец"],c:0}, de:{q:"Wie nennt man ein junges Hund?",a:["Welpe","Kätzchen","Jungtier","Küken"],c:0}, ar:{q:"ما اسم صغير الكلب؟",a:["جرو","هريرة","شبل","كتكوت"],c:0}, img:"🐶", difficulty:1 },
      { en:{q:"What color is the moon at night?",a:["White","Blue","Green","Orange"],c:0}, ru:{q:"Какого цвета луна ночью?",a:["Белая","Синяя","Зелёная","Оранжевая"],c:0}, de:{q:"Welche Farbe hat der Mond nachts?",a:["Weiß","Blau","Grün","Orange"],c:0}, ar:{q:"ما لون القمر في الليل؟",a:["أبيض","أزرق","أخضر","برتقالي"],c:0}, img:"🌙", difficulty:1 },

      // ── Extra D2 ──
      { en:{q:"How many months are in a year?",a:["12","10","8","6"],c:0}, ru:{q:"Сколько месяцев в году?",a:["12","10","8","6"],c:0}, de:{q:"Wie viele Monate hat ein Jahr?",a:["12","10","8","6"],c:0}, ar:{q:"كم عدد أشهر السنة؟",a:["12","10","8","6"],c:0}, img:"📅", difficulty:2 },
      { en:{q:"What is 4 × 2?",a:["8","6","10","4"],c:0}, ru:{q:"Сколько будет 4 × 2?",a:["8","6","10","4"],c:0}, de:{q:"Was ist 4 × 2?",a:["8","6","10","4"],c:0}, ar:{q:"كم يساوي 4 × 2؟",a:["8","6","10","4"],c:0}, img:"✖️", difficulty:2 },
      { en:{q:"Which animal has a very long trunk?",a:["Elephant","Giraffe","Hippo","Rhino"],c:0}, ru:{q:"У какого животного длинный хобот?",a:["Слон","Жираф","Бегемот","Носорог"],c:0}, de:{q:"Welches Tier hat einen langen Rüssel?",a:["Elefant","Giraffe","Nilpferd","Nashorn"],c:0}, ar:{q:"أي حيوان لديه خرطوم طويل؟",a:["فيل","زرافة","فرس النهر","وحيد القرن"],c:0}, img:"🐘", difficulty:2 },
      { en:{q:"What is 7 - 3?",a:["4","3","5","6"],c:0}, ru:{q:"Сколько будет 7 - 3?",a:["4","3","5","6"],c:0}, de:{q:"Was ist 7 - 3?",a:["4","3","5","6"],c:0}, ar:{q:"كم يساوي 7 - 3؟",a:["4","3","5","6"],c:0}, img:"➖", difficulty:2 },
      { en:{q:"Which bird cannot fly?",a:["Penguin","Eagle","Sparrow","Parrot"],c:0}, ru:{q:"Какая птица не умеет летать?",a:["Пингвин","Орёл","Воробей","Попугай"],c:0}, de:{q:"Welcher Vogel kann nicht fliegen?",a:["Pinguin","Adler","Spatz","Papagei"],c:0}, ar:{q:"أي طائر لا يستطيع الطيران؟",a:["بطريق","نسر","عصفور","ببغاء"],c:0}, img:"🐧", difficulty:2 },
      { en:{q:"How many hours are in a day?",a:["24","12","16","20"],c:0}, ru:{q:"Сколько часов в сутках?",a:["24","12","16","20"],c:0}, de:{q:"Wie viele Stunden hat ein Tag?",a:["24","12","16","20"],c:0}, ar:{q:"كم عدد ساعات اليوم؟",a:["24","12","16","20"],c:0}, img:"🕐", difficulty:2 },
      { en:{q:"What is 6 + 4?",a:["10","8","9","11"],c:0}, ru:{q:"Сколько будет 6 + 4?",a:["10","8","9","11"],c:0}, de:{q:"Was ist 6 + 4?",a:["10","8","9","11"],c:0}, ar:{q:"كم يساوي 6 + 4؟",a:["10","8","9","11"],c:0}, img:"➕", difficulty:2 },
      { en:{q:"What shape has 3 sides?",a:["Triangle","Square","Circle","Rectangle"],c:0}, ru:{q:"Какая фигура имеет 3 стороны?",a:["Треугольник","Квадрат","Круг","Прямоугольник"],c:0}, de:{q:"Welche Form hat 3 Seiten?",a:["Dreieck","Quadrat","Kreis","Rechteck"],c:0}, ar:{q:"ما الشكل الذي له 3 أضلاع؟",a:["مثلث","مربع","دائرة","مستطيل"],c:0}, img:"📐", difficulty:2 },
      { en:{q:"What do we brush to keep them clean?",a:["Teeth","Fingers","Ears","Eyes"],c:0}, ru:{q:"Что мы чистим, чтобы они были чистыми?",a:["Зубы","Пальцы","Уши","Глаза"],c:0}, de:{q:"Was putzen wir, um sie sauber zu halten?",a:["Zähne","Finger","Ohren","Augen"],c:0}, ar:{q:"ماذا نفرش للحفاظ عليه نظيفاً؟",a:["الأسنان","الأصابع","الأذنين","العيون"],c:0}, img:"🦷", difficulty:2 },
      { en:{q:"What is the capital of France?",a:["Paris","Berlin","London","Rome"],c:0}, ru:{q:"Какова столица Франции?",a:["Париж","Берлин","Лондон","Рим"],c:0}, de:{q:"Was ist die Hauptstadt Frankreichs?",a:["Paris","Berlin","London","Rom"],c:0}, ar:{q:"ما عاصمة فرنسا؟",a:["باريس","برلين","لندن","روما"],c:0}, img:"🗼", difficulty:2 },
      { en:{q:"How many legs does a bird have?",a:["2","4","6","8"],c:0}, ru:{q:"Сколько ног у птицы?",a:["2","4","6","8"],c:0}, de:{q:"Wie viele Beine hat ein Vogel?",a:["2","4","6","8"],c:0}, ar:{q:"كم عدد أرجل الطائر؟",a:["2","4","6","8"],c:0}, img:"🐦", difficulty:2 },
      { en:{q:"What is 9 + 9?",a:["18","16","17","20"],c:0}, ru:{q:"Сколько будет 9 + 9?",a:["18","16","17","20"],c:0}, de:{q:"Was ist 9 + 9?",a:["18","16","17","20"],c:0}, ar:{q:"كم يساوي 9 + 9؟",a:["18","16","17","20"],c:0}, img:"🔢", difficulty:2 },
      { en:{q:"Which season has the most snow?",a:["Winter","Summer","Spring","Autumn"],c:0}, ru:{q:"В какое время года больше всего снега?",a:["Зима","Лето","Весна","Осень"],c:0}, de:{q:"In welcher Jahreszeit gibt es den meisten Schnee?",a:["Winter","Sommer","Frühling","Herbst"],c:0}, ar:{q:"أي فصل يكون فيه الثلج أكثر؟",a:["الشتاء","الصيف","الربيع","الخريف"],c:0}, img:"⛄", difficulty:2 },
      { en:{q:"What animal is known as man's best friend?",a:["Dog","Cat","Horse","Rabbit"],c:0}, ru:{q:"Какое животное называют лучшим другом человека?",a:["Собака","Кошка","Лошадь","Кролик"],c:0}, de:{q:"Welches Tier gilt als bester Freund des Menschen?",a:["Hund","Katze","Pferd","Kaninchen"],c:0}, ar:{q:"أي حيوان يُعرف بأنه أفضل صديق للإنسان؟",a:["كلب","قطة","حصان","أرنب"],c:0}, img:"🐕", difficulty:2 },
      { en:{q:"What do plants need from the sun?",a:["Light","Water","Soil","Air"],c:0}, ru:{q:"Что растения получают от солнца?",a:["Свет","Воду","Почву","Воздух"],c:0}, de:{q:"Was brauchen Pflanzen von der Sonne?",a:["Licht","Wasser","Erde","Luft"],c:0}, ar:{q:"ماذا تحتاج النباتات من الشمس؟",a:["ضوء","ماء","تربة","هواء"],c:0}, img:"🌻", difficulty:2 },
      { en:{q:"What is 3 × 3?",a:["9","6","12","8"],c:0}, ru:{q:"Сколько будет 3 × 3?",a:["9","6","12","8"],c:0}, de:{q:"Was ist 3 × 3?",a:["9","6","12","8"],c:0}, ar:{q:"كم يساوي 3 × 3؟",a:["9","6","12","8"],c:0}, img:"✖️", difficulty:2 },
      { en:{q:"How many continents are there on Earth?",a:["7","5","6","8"],c:0}, ru:{q:"Сколько континентов на Земле?",a:["7","5","6","8"],c:0}, de:{q:"Wie viele Kontinente gibt es auf der Erde?",a:["7","5","6","8"],c:0}, ar:{q:"كم عدد قارات الأرض؟",a:["7","5","6","8"],c:0}, img:"🌍", difficulty:2 },
      { en:{q:"What is 20 ÷ 4?",a:["5","4","6","8"],c:0}, ru:{q:"Сколько будет 20 ÷ 4?",a:["5","4","6","8"],c:0}, de:{q:"Was ist 20 ÷ 4?",a:["5","4","6","8"],c:0}, ar:{q:"كم يساوي 20 ÷ 4؟",a:["5","4","6","8"],c:0}, img:"➗", difficulty:2 },
      { en:{q:"Which is the biggest ocean on Earth?",a:["Pacific","Atlantic","Indian","Arctic"],c:0}, ru:{q:"Какой самый большой океан на Земле?",a:["Тихий","Атлантический","Индийский","Арктический"],c:0}, de:{q:"Welcher ist der größte Ozean der Erde?",a:["Pazifik","Atlantik","Indisch","Arktisch"],c:0}, ar:{q:"ما أكبر محيط على الأرض؟",a:["المحيط الهادئ","الأطلسي","الهندي","القطبي"],c:0}, img:"🌊", difficulty:2 },
      { en:{q:"What do we call a baby cat?",a:["Kitten","Puppy","Cub","Chick"],c:0}, ru:{q:"Как называется детёныш кошки?",a:["Котёнок","Щенок","Медвежонок","Птенец"],c:0}, de:{q:"Wie nennt man ein junges Kätzchen?",a:["Kätzchen","Welpe","Jungtier","Küken"],c:0}, ar:{q:"ما اسم صغير القطة؟",a:["هريرة","جرو","شبل","كتكوت"],c:0}, img:"🐱", difficulty:2 },

      // ── Extra D3 ──
      { en:{q:"What is the largest planet in our solar system?",a:["Jupiter","Saturn","Earth","Mars"],c:0}, ru:{q:"Какая самая большая планета в Солнечной системе?",a:["Юпитер","Сатурн","Земля","Марс"],c:0}, de:{q:"Was ist der größte Planet in unserem Sonnensystem?",a:["Jupiter","Saturn","Erde","Mars"],c:0}, ar:{q:"ما أكبر كوكب في المجموعة الشمسية؟",a:["المشتري","زحل","الأرض","المريخ"],c:0}, img:"🪐", difficulty:3 },
      { en:{q:"How many sides does a hexagon have?",a:["6","5","7","8"],c:0}, ru:{q:"Сколько сторон у шестиугольника?",a:["6","5","7","8"],c:0}, de:{q:"Wie viele Seiten hat ein Sechseck?",a:["6","5","7","8"],c:0}, ar:{q:"كم عدد أضلاع السداسي؟",a:["6","5","7","8"],c:0}, img:"⬡", difficulty:3 },
      { en:{q:"What is 15 - 8?",a:["7","6","8","9"],c:0}, ru:{q:"Сколько будет 15 - 8?",a:["7","6","8","9"],c:0}, de:{q:"Was ist 15 - 8?",a:["7","6","8","9"],c:0}, ar:{q:"كم يساوي 15 - 8؟",a:["7","6","8","9"],c:0}, img:"➖", difficulty:3 },
      { en:{q:"What is the hardest natural substance on Earth?",a:["Diamond","Gold","Iron","Rock"],c:0}, ru:{q:"Какое самое твёрдое природное вещество на Земле?",a:["Алмаз","Золото","Железо","Камень"],c:0}, de:{q:"Was ist die härteste natürliche Substanz auf der Erde?",a:["Diamant","Gold","Eisen","Stein"],c:0}, ar:{q:"ما أصلب مادة طبيعية على الأرض؟",a:["ماس","ذهب","حديد","صخر"],c:0}, img:"💎", difficulty:3 },
      { en:{q:"Which animal is the fastest on land?",a:["Cheetah","Lion","Horse","Tiger"],c:0}, ru:{q:"Какое животное самое быстрое на суше?",a:["Гепард","Лев","Лошадь","Тигр"],c:0}, de:{q:"Welches Tier ist das schnellste an Land?",a:["Gepard","Löwe","Pferd","Tiger"],c:0}, ar:{q:"أسرع حيوان على اليابسة؟",a:["فهد","أسد","حصان","نمر"],c:0}, img:"🐆", difficulty:3 },
      { en:{q:"What is 3 × 6?",a:["18","15","21","12"],c:0}, ru:{q:"Сколько будет 3 × 6?",a:["18","15","21","12"],c:0}, de:{q:"Was ist 3 × 6?",a:["18","15","21","12"],c:0}, ar:{q:"كم يساوي 3 × 6؟",a:["18","15","21","12"],c:0}, img:"✖️", difficulty:3 },
      { en:{q:"Which organ pumps blood through the body?",a:["Heart","Lung","Liver","Brain"],c:0}, ru:{q:"Какой орган перекачивает кровь по телу?",a:["Сердце","Лёгкое","Печень","Мозг"],c:0}, de:{q:"Welches Organ pumpt Blut durch den Körper?",a:["Herz","Lunge","Leber","Gehirn"],c:0}, ar:{q:"أي عضو يضخ الدم في الجسم؟",a:["القلب","الرئة","الكبد","الدماغ"],c:0}, img:"❤️", difficulty:3 },
      { en:{q:"What do tadpoles grow into?",a:["Frogs","Fish","Snakes","Lizards"],c:0}, ru:{q:"Кем становятся головастики?",a:["Лягушками","Рыбами","Змеями","Ящерицами"],c:0}, de:{q:"Was werden aus Kaulquappen?",a:["Frösche","Fische","Schlangen","Eidechsen"],c:0}, ar:{q:"إلى ماذا تتحول الضفادع الصغيرة؟",a:["ضفادع","أسماك","ثعابين","سحالي"],c:0}, img:"🐸", difficulty:3 },
      { en:{q:"How many legs does an insect have?",a:["6","4","8","10"],c:0}, ru:{q:"Сколько ног у насекомого?",a:["6","4","8","10"],c:0}, de:{q:"Wie viele Beine hat ein Insekt?",a:["6","4","8","10"],c:0}, ar:{q:"كم عدد أرجل الحشرة؟",a:["6","4","8","10"],c:0}, img:"🐛", difficulty:3 },
      { en:{q:"What is the capital of Germany?",a:["Berlin","Munich","Hamburg","Frankfurt"],c:0}, ru:{q:"Какова столица Германии?",a:["Берлин","Мюнхен","Гамбург","Франкфурт"],c:0}, de:{q:"Was ist die Hauptstadt Deutschlands?",a:["Berlin","München","Hamburg","Frankfurt"],c:0}, ar:{q:"ما عاصمة ألمانيا؟",a:["برلين","ميونيخ","هامبورغ","فرانكفورت"],c:0}, img:"🇩🇪", difficulty:3 },
      { en:{q:"What is 4 × 5?",a:["20","16","25","18"],c:0}, ru:{q:"Сколько будет 4 × 5?",a:["20","16","25","18"],c:0}, de:{q:"Was ist 4 × 5?",a:["20","16","25","18"],c:0}, ar:{q:"كم يساوي 4 × 5؟",a:["20","16","25","18"],c:0}, img:"✖️", difficulty:3 },
      { en:{q:"Which is the longest river in the world?",a:["Nile","Amazon","Yangtze","Mississippi"],c:0}, ru:{q:"Какая самая длинная река в мире?",a:["Нил","Амазонка","Янцзы","Миссисипи"],c:0}, de:{q:"Welcher ist der längste Fluss der Welt?",a:["Nil","Amazonas","Jangtsekiang","Mississippi"],c:0}, ar:{q:"ما أطول نهر في العالم؟",a:["النيل","الأمازون","اليانغتسي","المسيسيبي"],c:0}, img:"🌊", difficulty:3 },
      { en:{q:"What is 100 - 37?",a:["63","57","73","67"],c:0}, ru:{q:"Сколько будет 100 - 37?",a:["63","57","73","67"],c:0}, de:{q:"Was ist 100 - 37?",a:["63","57","73","67"],c:0}, ar:{q:"كم يساوي 100 - 37؟",a:["63","57","73","67"],c:0}, img:"➖", difficulty:3 },
      { en:{q:"What do we call a group of fish swimming together?",a:["School","Pack","Flock","Herd"],c:0}, ru:{q:"Как называется группа плавающих рыб?",a:["Косяк","Стая","Табун","Стадо"],c:0}, de:{q:"Was nennt man eine Gruppe schwimmender Fische?",a:["Schwarm","Rudel","Herde","Schar"],c:0}, ar:{q:"ما اسم مجموعة الأسماك السابحة معاً؟",a:["سرب","قطيع","قطيع طيور","قطيع"],c:0}, img:"🐠", difficulty:3 },
      { en:{q:"What is the capital of Russia?",a:["Moscow","Saint Petersburg","Kiev","Minsk"],c:0}, ru:{q:"Какова столица России?",a:["Москва","Санкт-Петербург","Киев","Минск"],c:0}, de:{q:"Was ist die Hauptstadt Russlands?",a:["Moskau","St. Petersburg","Kiew","Minsk"],c:0}, ar:{q:"ما عاصمة روسيا؟",a:["موسكو","سانت بطرسبرغ","كييف","مينسك"],c:0}, img:"🇷🇺", difficulty:3 },
      { en:{q:"How many minutes are in an hour?",a:["60","30","45","90"],c:0}, ru:{q:"Сколько минут в часе?",a:["60","30","45","90"],c:0}, de:{q:"Wie viele Minuten hat eine Stunde?",a:["60","30","45","90"],c:0}, ar:{q:"كم عدد دقائق الساعة؟",a:["60","30","45","90"],c:0}, img:"⏰", difficulty:3 },
      { en:{q:"What do we call the process of water turning to vapor?",a:["Evaporation","Condensation","Freezing","Melting"],c:0}, ru:{q:"Как называется процесс испарения воды?",a:["Испарение","Конденсация","Замерзание","Таяние"],c:0}, de:{q:"Wie nennt man den Prozess, bei dem Wasser zu Dampf wird?",a:["Verdunstung","Kondensation","Gefrieren","Schmelzen"],c:0}, ar:{q:"ما اسم عملية تحول الماء إلى بخار؟",a:["التبخر","التكثف","التجمد","الذوبان"],c:0}, img:"💧", difficulty:3 },
      { en:{q:"What is 8 × 7?",a:["56","48","54","63"],c:0}, ru:{q:"Сколько будет 8 × 7?",a:["56","48","54","63"],c:0}, de:{q:"Was ist 8 × 7?",a:["56","48","54","63"],c:0}, ar:{q:"كم يساوي 8 × 7؟",a:["56","48","54","63"],c:0}, img:"✖️", difficulty:3 },
      { en:{q:"Which planet is known for its rings?",a:["Saturn","Jupiter","Mars","Uranus"],c:0}, ru:{q:"Какая планета известна своими кольцами?",a:["Сатурн","Юпитер","Марс","Уран"],c:0}, de:{q:"Welcher Planet ist für seine Ringe bekannt?",a:["Saturn","Jupiter","Mars","Uranus"],c:0}, ar:{q:"أي كوكب معروف بحلقاته؟",a:["زحل","المشتري","المريخ","أورانوس"],c:0}, img:"🪐", difficulty:3 },
      { en:{q:"What is the tallest mountain in the world?",a:["Everest","K2","Kilimanjaro","Elbrus"],c:0}, ru:{q:"Какая самая высокая гора в мире?",a:["Эверест","К2","Килиманджаро","Эльбрус"],c:0}, de:{q:"Was ist der höchste Berg der Welt?",a:["Everest","K2","Kilimandscharo","Elbrus"],c:0}, ar:{q:"ما أعلى جبل في العالم؟",a:["إيفرست","كي 2","كليمنجارو","إلبروس"],c:0}, img:"🏔️", difficulty:3 },

      // ── Extra D4 ──
      { en:{q:"How many planets are in our solar system?",a:["8","9","7","10"],c:0}, ru:{q:"Сколько планет в Солнечной системе?",a:["8","9","7","10"],c:0}, de:{q:"Wie viele Planeten hat unser Sonnensystem?",a:["8","9","7","10"],c:0}, ar:{q:"كم عدد كواكب المجموعة الشمسية؟",a:["8","9","7","10"],c:0}, img:"🌌", difficulty:4 },
      { en:{q:"What is the chemical formula for water?",a:["H₂O","CO₂","O₂","H₂"],c:0}, ru:{q:"Какова химическая формула воды?",a:["H₂O","CO₂","O₂","H₂"],c:0}, de:{q:"Was ist die chemische Formel für Wasser?",a:["H₂O","CO₂","O₂","H₂"],c:0}, ar:{q:"ما الصيغة الكيميائية للماء؟",a:["H₂O","CO₂","O₂","H₂"],c:0}, img:"💧", difficulty:4 },
      { en:{q:"How many seconds are in a minute?",a:["60","30","100","45"],c:0}, ru:{q:"Сколько секунд в минуте?",a:["60","30","100","45"],c:0}, de:{q:"Wie viele Sekunden hat eine Minute?",a:["60","30","100","45"],c:0}, ar:{q:"كم عدد ثواني الدقيقة؟",a:["60","30","100","45"],c:0}, img:"⏱️", difficulty:4 },
      { en:{q:"Which continent has the most countries?",a:["Africa","Asia","Europe","America"],c:0}, ru:{q:"На каком континенте больше всего стран?",a:["Африка","Азия","Европа","Америка"],c:0}, de:{q:"Welcher Kontinent hat die meisten Länder?",a:["Afrika","Asien","Europa","Amerika"],c:0}, ar:{q:"أي قارة تضم أكثر الدول؟",a:["أفريقيا","آسيا","أوروبا","أمريكا"],c:0}, img:"🌍", difficulty:4 },
      { en:{q:"What is 9 × 9?",a:["81","72","84","90"],c:0}, ru:{q:"Сколько будет 9 × 9?",a:["81","72","84","90"],c:0}, de:{q:"Was ist 9 × 9?",a:["81","72","84","90"],c:0}, ar:{q:"كم يساوي 9 × 9؟",a:["81","72","84","90"],c:0}, img:"✖️", difficulty:4 },
      { en:{q:"What gas makes up most of Earth's atmosphere?",a:["Nitrogen","Oxygen","Carbon dioxide","Helium"],c:0}, ru:{q:"Какой газ составляет большую часть атмосферы Земли?",a:["Азот","Кислород","Углекислый газ","Гелий"],c:0}, de:{q:"Welches Gas macht den größten Teil der Erdatmosphäre aus?",a:["Stickstoff","Sauerstoff","Kohlendioxid","Helium"],c:0}, ar:{q:"ما الغاز الأكثر في الغلاف الجوي للأرض؟",a:["نيتروجين","أكسجين","ثاني أكسيد الكربون","هيليوم"],c:0}, img:"🌬️", difficulty:4 },
      { en:{q:"How many sides does an octagon have?",a:["8","6","7","9"],c:0}, ru:{q:"Сколько сторон у восьмиугольника?",a:["8","6","7","9"],c:0}, de:{q:"Wie viele Seiten hat ein Achteck?",a:["8","6","7","9"],c:0}, ar:{q:"كم عدد أضلاع المثمن؟",a:["8","6","7","9"],c:0}, img:"⭕", difficulty:4 },
      { en:{q:"Which chess piece can only move diagonally?",a:["Bishop","Rook","Knight","Queen"],c:0}, ru:{q:"Какая шахматная фигура ходит только по диагонали?",a:["Слон","Ладья","Конь","Ферзь"],c:0}, de:{q:"Welche Schachfigur bewegt sich nur diagonal?",a:["Läufer","Turm","Springer","Dame"],c:0}, ar:{q:"أي قطعة شطرنج تتحرك بشكل قطري فقط؟",a:["الفيل","الرخ","الحصان","الوزير"],c:0}, img:"♗", difficulty:4 },
      { en:{q:"What does a thermometer measure?",a:["Temperature","Pressure","Speed","Weight"],c:0}, ru:{q:"Что измеряет термометр?",a:["Температуру","Давление","Скорость","Вес"],c:0}, de:{q:"Was misst ein Thermometer?",a:["Temperatur","Druck","Geschwindigkeit","Gewicht"],c:0}, ar:{q:"ماذا يقيس الترمومتر؟",a:["الحرارة","الضغط","السرعة","الوزن"],c:0}, img:"🌡️", difficulty:4 },
      { en:{q:"How many strings does a standard guitar have?",a:["6","4","5","7"],c:0}, ru:{q:"Сколько струн у стандартной гитары?",a:["6","4","5","7"],c:0}, de:{q:"Wie viele Saiten hat eine normale Gitarre?",a:["6","4","5","7"],c:0}, ar:{q:"كم عدد أوتار الجيتار العادي؟",a:["6","4","5","7"],c:0}, img:"🎸", difficulty:4 },
      { en:{q:"What is 100 ÷ 4?",a:["25","20","30","50"],c:0}, ru:{q:"Сколько будет 100 ÷ 4?",a:["25","20","30","50"],c:0}, de:{q:"Was ist 100 ÷ 4?",a:["25","20","30","50"],c:0}, ar:{q:"كم يساوي 100 ÷ 4؟",a:["25","20","30","50"],c:0}, img:"➗", difficulty:4 },
      { en:{q:"What is the largest organ in the human body?",a:["Skin","Liver","Heart","Brain"],c:0}, ru:{q:"Какой самый большой орган тела человека?",a:["Кожа","Печень","Сердце","Мозг"],c:0}, de:{q:"Was ist das größte Organ des menschlichen Körpers?",a:["Haut","Leber","Herz","Gehirn"],c:0}, ar:{q:"ما أكبر عضو في جسم الإنسان؟",a:["الجلد","الكبد","القلب","الدماغ"],c:0}, img:"🫀", difficulty:4 },
      { en:{q:"What is 7 × 8?",a:["56","54","48","63"],c:0}, ru:{q:"Сколько будет 7 × 8?",a:["56","54","48","63"],c:0}, de:{q:"Was ist 7 × 8?",a:["56","54","48","63"],c:0}, ar:{q:"كم يساوي 7 × 8؟",a:["56","54","48","63"],c:0}, img:"✖️", difficulty:4 },
      { en:{q:"Which planet is closest to the Sun?",a:["Mercury","Venus","Mars","Earth"],c:0}, ru:{q:"Какая планета ближайшая к Солнцу?",a:["Меркурий","Венера","Марс","Земля"],c:0}, de:{q:"Welcher Planet ist der Sonne am nächsten?",a:["Merkur","Venus","Mars","Erde"],c:0}, ar:{q:"أي كوكب أقرب إلى الشمس؟",a:["عطارد","الزهرة","المريخ","الأرض"],c:0}, img:"☀️", difficulty:4 },
      { en:{q:"How many bones are in the adult human body?",a:["206","105","300","178"],c:0}, ru:{q:"Сколько костей в теле взрослого человека?",a:["206","105","300","178"],c:0}, de:{q:"Wie viele Knochen hat der menschliche Körper?",a:["206","105","300","178"],c:0}, ar:{q:"كم عدد عظام جسم الإنسان البالغ؟",a:["206","105","300","178"],c:0}, img:"💀", difficulty:4 },
      { en:{q:"What is the study of plants called?",a:["Botany","Zoology","Geology","Astronomy"],c:0}, ru:{q:"Как называется наука о растениях?",a:["Ботаника","Зоология","Геология","Астрономия"],c:0}, de:{q:"Wie nennt man die Wissenschaft der Pflanzen?",a:["Botanik","Zoologie","Geologie","Astronomie"],c:0}, ar:{q:"ما اسم علم دراسة النباتات؟",a:["علم النبات","علم الحيوان","علم الجيولوجيا","علم الفلك"],c:0}, img:"🌿", difficulty:4 },
      { en:{q:"How many eyes does a bee have?",a:["5","2","3","4"],c:0}, ru:{q:"Сколько глаз у пчелы?",a:["5","2","3","4"],c:0}, de:{q:"Wie viele Augen hat eine Biene?",a:["5","2","3","4"],c:0}, ar:{q:"كم عدد عيون النحلة؟",a:["5","2","3","4"],c:0}, img:"🐝", difficulty:4 },
      { en:{q:"What angle does a right angle measure?",a:["90°","45°","60°","120°"],c:0}, ru:{q:"Каков угол прямого угла?",a:["90°","45°","60°","120°"],c:0}, de:{q:"Wie groß ist ein rechter Winkel?",a:["90°","45°","60°","120°"],c:0}, ar:{q:"كم تساوي درجة الزاوية القائمة؟",a:["90°","45°","60°","120°"],c:0}, img:"📐", difficulty:4 },
      { en:{q:"What is 12 × 11?",a:["132","121","144","110"],c:0}, ru:{q:"Сколько будет 12 × 11?",a:["132","121","144","110"],c:0}, de:{q:"Was ist 12 × 11?",a:["132","121","144","110"],c:0}, ar:{q:"كم يساوي 12 × 11؟",a:["132","121","144","110"],c:0}, img:"✖️", difficulty:4 },
      { en:{q:"What do we call an angle greater than 90°?",a:["Obtuse","Acute","Right","Straight"],c:0}, ru:{q:"Как называется угол больше 90°?",a:["Тупой","Острый","Прямой","Развёрнутый"],c:0}, de:{q:"Wie nennt man einen Winkel größer als 90°?",a:["Stumpf","Spitz","Rechts","Gestreckt"],c:0}, ar:{q:"ماذا نسمي الزاوية الأكبر من 90°؟",a:["منفرجة","حادة","قائمة","مستقيمة"],c:0}, img:"📐", difficulty:4 },

      // ── Extra D5 ──
      { en:{q:"How many squares are on a chess board?",a:["64","32","48","56"],c:0}, ru:{q:"Сколько клеток на шахматной доске?",a:["64","32","48","56"],c:0}, de:{q:"Wie viele Felder hat ein Schachbrett?",a:["64","32","48","56"],c:0}, ar:{q:"كم عدد مربعات رقعة الشطرنج؟",a:["64","32","48","56"],c:0}, img:"♟️", difficulty:5 },
      { en:{q:"How many chess pieces does each player start with?",a:["16","8","12","20"],c:0}, ru:{q:"Сколько шахматных фигур у каждого игрока в начале?",a:["16","8","12","20"],c:0}, de:{q:"Wie viele Schachfiguren hat jeder Spieler zu Beginn?",a:["16","8","12","20"],c:0}, ar:{q:"كم قطعة شطرنج يبدأ بها كل لاعب؟",a:["16","8","12","20"],c:0}, img:"♟️", difficulty:5 },
      { en:{q:"What is 12 × 12?",a:["144","132","124","156"],c:0}, ru:{q:"Сколько будет 12 × 12?",a:["144","132","124","156"],c:0}, de:{q:"Was ist 12 × 12?",a:["144","132","124","156"],c:0}, ar:{q:"كم يساوي 12 × 12؟",a:["144","132","124","156"],c:0}, img:"✖️", difficulty:5 },
      { en:{q:"What is the chemical symbol for gold?",a:["Au","Go","Gd","Ag"],c:0}, ru:{q:"Каков химический символ золота?",a:["Au","Go","Gd","Ag"],c:0}, de:{q:"Was ist das chemische Symbol für Gold?",a:["Au","Go","Gd","Ag"],c:0}, ar:{q:"ما الرمز الكيميائي للذهب؟",a:["Au","Go","Gd","Ag"],c:0}, img:"🥇", difficulty:5 },
      { en:{q:"Who painted the Mona Lisa?",a:["Leonardo da Vinci","Michelangelo","Picasso","Rembrandt"],c:0}, ru:{q:"Кто написал Мону Лизу?",a:["Леонардо да Винчи","Микеланджело","Пикассо","Рембрандт"],c:0}, de:{q:"Wer hat die Mona Lisa gemalt?",a:["Leonardo da Vinci","Michelangelo","Picasso","Rembrandt"],c:0}, ar:{q:"من رسم لوحة الموناليزا؟",a:["ليوناردو دافنشي","مايكل أنجلو","بيكاسو","رمبرانت"],c:0}, img:"🎨", difficulty:5 },
      { en:{q:"What is the largest continent?",a:["Asia","Africa","Europe","America"],c:0}, ru:{q:"Какой самый большой континент?",a:["Азия","Африка","Европа","Америка"],c:0}, de:{q:"Was ist der größte Kontinent?",a:["Asien","Afrika","Europa","Amerika"],c:0}, ar:{q:"ما أكبر قارة؟",a:["آسيا","أفريقيا","أوروبا","أمريكا"],c:0}, img:"🌏", difficulty:5 },
      { en:{q:"What is the boiling point of water in Celsius?",a:["100°","90°","80°","120°"],c:0}, ru:{q:"Какова температура кипения воды в Цельсиях?",a:["100°","90°","80°","120°"],c:0}, de:{q:"Was ist der Siedepunkt von Wasser in Celsius?",a:["100°","90°","80°","120°"],c:0}, ar:{q:"ما درجة غليان الماء بالسيليسيوس؟",a:["100°","90°","80°","120°"],c:0}, img:"🌡️", difficulty:5 },
      { en:{q:"Which is the smallest country in the world?",a:["Vatican City","Monaco","San Marino","Liechtenstein"],c:0}, ru:{q:"Какая самая маленькая страна в мире?",a:["Ватикан","Монако","Сан-Марино","Лихтенштейн"],c:0}, de:{q:"Was ist das kleinste Land der Welt?",a:["Vatikanstadt","Monaco","San Marino","Liechtenstein"],c:0}, ar:{q:"ما أصغر دولة في العالم؟",a:["الفاتيكان","موناكو","سان مارينو","ليختنشتاين"],c:0}, img:"🏛️", difficulty:5 },
      { en:{q:"What is 15 × 15?",a:["225","200","210","250"],c:0}, ru:{q:"Сколько будет 15 × 15?",a:["225","200","210","250"],c:0}, de:{q:"Was ist 15 × 15?",a:["225","200","210","250"],c:0}, ar:{q:"كم يساوي 15 × 15؟",a:["225","200","210","250"],c:0}, img:"✖️", difficulty:5 },
      { en:{q:"What is the powerhouse of the cell?",a:["Mitochondria","Nucleus","Ribosome","Membrane"],c:0}, ru:{q:"Что является «электростанцией» клетки?",a:["Митохондрии","Ядро","Рибосома","Мембрана"],c:0}, de:{q:"Was ist das Kraftwerk der Zelle?",a:["Mitochondrien","Zellkern","Ribosom","Membran"],c:0}, ar:{q:"ما محطة توليد الطاقة في الخلية؟",a:["الميتوكوندريا","النواة","الريبوسوم","الغشاء"],c:0}, img:"⚡", difficulty:5 },
      { en:{q:"How many sides does a pentagon have?",a:["5","6","4","7"],c:0}, ru:{q:"Сколько сторон у пятиугольника?",a:["5","6","4","7"],c:0}, de:{q:"Wie viele Seiten hat ein Fünfeck?",a:["5","6","4","7"],c:0}, ar:{q:"كم عدد أضلاع المخمس؟",a:["5","6","4","7"],c:0}, img:"⬠", difficulty:5 },
      { en:{q:"What is the capital of Australia?",a:["Canberra","Sydney","Melbourne","Brisbane"],c:0}, ru:{q:"Какова столица Австралии?",a:["Канберра","Сидней","Мельбурн","Брисбен"],c:0}, de:{q:"Was ist die Hauptstadt Australiens?",a:["Canberra","Sydney","Melbourne","Brisbane"],c:0}, ar:{q:"ما عاصمة أستراليا؟",a:["كانبيرا","سيدني","ملبورن","بريزبان"],c:0}, img:"🦘", difficulty:5 },
      { en:{q:"Which gas do humans breathe out?",a:["Carbon dioxide","Oxygen","Nitrogen","Helium"],c:0}, ru:{q:"Какой газ выдыхает человек?",a:["Углекислый газ","Кислород","Азот","Гелий"],c:0}, de:{q:"Welches Gas atmen Menschen aus?",a:["Kohlendioxid","Sauerstoff","Stickstoff","Helium"],c:0}, ar:{q:"ما الغاز الذي يتنفسه الإنسان للخارج؟",a:["ثاني أكسيد الكربون","أكسجين","نيتروجين","هيليوم"],c:0}, img:"💨", difficulty:5 },
      { en:{q:"Who wrote Romeo and Juliet?",a:["Shakespeare","Dickens","Tolstoy","Dante"],c:0}, ru:{q:"Кто написал «Ромео и Джульетту»?",a:["Шекспир","Диккенс","Толстой","Данте"],c:0}, de:{q:"Wer schrieb Romeo und Julia?",a:["Shakespeare","Dickens","Tolstoi","Dante"],c:0}, ar:{q:"من كتب روميو وجولييت؟",a:["شكسبير","ديكنز","تولستوي","دانتي"],c:0}, img:"📖", difficulty:5 },
      { en:{q:"How many chromosomes do humans have?",a:["46","23","48","44"],c:0}, ru:{q:"Сколько хромосом у человека?",a:["46","23","48","44"],c:0}, de:{q:"Wie viele Chromosomen haben Menschen?",a:["46","23","48","44"],c:0}, ar:{q:"كم عدد كروموسومات الإنسان؟",a:["46","23","48","44"],c:0}, img:"🧬", difficulty:5 },
      { en:{q:"What is 2 to the power of 10?",a:["1024","512","2048","256"],c:0}, ru:{q:"Чему равно 2 в степени 10?",a:["1024","512","2048","256"],c:0}, de:{q:"Was ist 2 hoch 10?",a:["1024","512","2048","256"],c:0}, ar:{q:"ما قيمة 2 أس 10؟",a:["1024","512","2048","256"],c:0}, img:"🔢", difficulty:5 },
      { en:{q:"What do we call a triangle with all equal sides?",a:["Equilateral","Isosceles","Scalene","Right-angled"],c:0}, ru:{q:"Как называется треугольник с равными сторонами?",a:["Равносторонний","Равнобедренный","Разносторонний","Прямоугольный"],c:0}, de:{q:"Wie nennt man ein Dreieck mit allen gleichen Seiten?",a:["Gleichseitig","Gleichschenklig","Ungleichseitig","Rechtwinklig"],c:0}, ar:{q:"ما اسم المثلث ذو الأضلاع المتساوية؟",a:["متساوي الأضلاع","متساوي الساقين","مختلف الأضلاع","قائم الزاوية"],c:0}, img:"🔺", difficulty:5 },
      { en:{q:"What is the chemical symbol for iron?",a:["Fe","Ir","In","I"],c:0}, ru:{q:"Каков химический символ железа?",a:["Fe","Ir","In","I"],c:0}, de:{q:"Was ist das chemische Symbol für Eisen?",a:["Fe","Ir","In","I"],c:0}, ar:{q:"ما الرمز الكيميائي للحديد؟",a:["Fe","Ir","In","I"],c:0}, img:"⚙️", difficulty:5 },
      { en:{q:"What is 17 × 17?",a:["289","279","299","269"],c:0}, ru:{q:"Сколько будет 17 × 17?",a:["289","279","299","269"],c:0}, de:{q:"Was ist 17 × 17?",a:["289","279","299","269"],c:0}, ar:{q:"كم يساوي 17 × 17؟",a:["289","279","299","269"],c:0}, img:"✖️", difficulty:5 },
      { en:{q:"On a chess board, which color always moves first?",a:["White","Black","Either","Random"],c:0}, ru:{q:"На шахматной доске какой цвет ходит первым?",a:["Белые","Чёрные","Любой","Случайно"],c:0}, de:{q:"Welche Farbe zieht im Schach immer zuerst?",a:["Weiß","Schwarz","Beliebig","Zufällig"],c:0}, ar:{q:"في الشطرنج، أي لون يتحرك أولاً دائماً؟",a:["الأبيض","الأسود","أي منهما","عشوائي"],c:0}, img:"♙", difficulty:5 },
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
