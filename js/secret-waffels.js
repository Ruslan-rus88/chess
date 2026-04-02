class SecretWaffels {
  constructor() {
    this.portions = 1;
    this.currentTab = 'ingredients';
    this.currentStep = 0;
    this.baseRecipe = {
      butter: { amount: 125, unit: 'g' },
      eggs: { amount: 3, unit: '' },
      sugar: { amount: '75-125', unit: 'g' },
      milk: { amount: 250, unit: 'ml' },
      flour: { amount: 200, unit: 'g' },
      starch: { amount: 50, unit: 'g' },
      bakingPowder: { amount: 10, unit: 'g' },
      vanilla: { amount: 1, unit: '' }
    };
    this.setupEventListeners();
  }

  setupEventListeners() {
    const openBtn = document.getElementById('waffels-toggle');
    const closeBtn = document.getElementById('waffels-close');
    const modal = document.getElementById('waffels-modal');

    openBtn.addEventListener('click', () => this.openModal());
    closeBtn.addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'waffels-modal') this.closeModal();
    });

    // Tab switching
    document.querySelectorAll('.waffel-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.waffelTab;
        this.switchTab(tab);
      });
    });

    // Portion buttons
    document.querySelectorAll('.portion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.portions = parseInt(btn.dataset.portion);
        document.querySelectorAll('.portion-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateIngredients();
      });
    });

    // Step navigation
    document.getElementById('waffel-next-step').addEventListener('click', () => this.nextStep());
    document.getElementById('waffel-prev-step').addEventListener('click', () => this.prevStep());
    document.getElementById('waffel-restart-steps').addEventListener('click', () => this.restartSteps());
  }

  openModal() {
    const modal = document.getElementById('waffels-modal');
    modal.style.display = 'flex';
    this.updateIngredients();
  }

  closeModal() {
    const modal = document.getElementById('waffels-modal');
    modal.style.display = 'none';
  }

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.waffel-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.waffelTab === tab);
    });
    document.getElementById('waffel-ingredients-tab').style.display = tab === 'ingredients' ? 'block' : 'none';
    document.getElementById('waffel-steps-tab').style.display = tab === 'steps' ? 'block' : 'none';

    if (tab === 'steps') {
      this.currentStep = 0;
      this.renderStep();
    }
  }

  getScaled(key) {
    const item = this.baseRecipe[key];
    if (key === 'sugar') {
      const low = 75 * this.portions;
      const high = 125 * this.portions;
      return `${low}-${high}`;
    }
    if (key === 'vanilla') {
      return this.portions;
    }
    return item.amount * this.portions;
  }

  updateIngredients() {
    const list = document.getElementById('waffel-ingredients-list');
    const p = this.portions;
    list.innerHTML = `
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🧈</span>
        <span class="ingredient-text">Butter</span>
        <span class="ingredient-amount">${this.getScaled('butter')} g</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🥚</span>
        <span class="ingredient-text">Eggs</span>
        <span class="ingredient-amount">${this.getScaled('eggs')}</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🍬</span>
        <span class="ingredient-text">Sugar <small>(to taste)</small></span>
        <span class="ingredient-amount">${this.getScaled('sugar')} g</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🥛</span>
        <span class="ingredient-text">Milk</span>
        <span class="ingredient-amount">${this.getScaled('milk')} ml</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🌾</span>
        <span class="ingredient-text">Flour</span>
        <span class="ingredient-amount">${this.getScaled('flour')} g</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🥔</span>
        <span class="ingredient-text">Potato Starch</span>
        <span class="ingredient-amount">${this.getScaled('starch')} g</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">💨</span>
        <span class="ingredient-text">Baking Powder</span>
        <span class="ingredient-amount">${this.getScaled('bakingPowder')} g</span>
      </div>
      <div class="waffel-ingredient">
        <span class="ingredient-emoji">🌼</span>
        <span class="ingredient-text">Vanilla</span>
        <span class="ingredient-amount">${this.getScaled('vanilla')} tsp</span>
      </div>
    `;
  }

  getSteps() {
    return [
      {
        icon: '🥚',
        title: 'Mix the Eggs',
        text: `Crack and mix <strong>${this.getScaled('eggs')} eggs</strong> in a large bowl until fluffy.`,
        tip: 'Whisk vigorously for best results!'
      },
      {
        icon: '🍬',
        title: 'Add Sugar & Vanilla',
        text: `Add <strong>${this.getScaled('sugar')} g sugar</strong> and <strong>Vanilla</strong> to the eggs. Mix well.`,
        tip: 'Adjust sugar to your taste preference.'
      },
      {
        icon: '🧈',
        title: 'Add Butter & Milk',
        text: `Add <strong>${this.getScaled('butter')} g melted butter</strong> and <strong>${this.getScaled('milk')} ml milk</strong>. Stir gently.`,
        tip: 'Make sure butter is melted but not hot!'
      },
      {
        icon: '🌾',
        title: 'Add Dry Ingredients',
        text: `Add <strong>${this.getScaled('flour')} g flour</strong>, <strong>${this.getScaled('starch')} g potato starch</strong>, and <strong>${this.getScaled('bakingPowder')} g baking powder</strong>.`,
        tip: 'Sift the dry ingredients for a smoother batter.'
      },
      {
        icon: '🌀',
        title: 'Mix Well',
        text: 'Mix everything together until you get a <strong>smooth, lump-free batter</strong>.',
        tip: 'Don\'t over-mix! Stop when just combined.'
      },
      {
        icon: '🧇',
        title: 'Make the SECRET Waffels!',
        text: 'Pour batter into your waffle iron and cook until <strong>golden & crispy</strong>. Enjoy! 🎉',
        tip: '🤫 The secret ingredient is LOVE!'
      }
    ];
  }

  renderStep() {
    const steps = this.getSteps();
    const step = steps[this.currentStep];
    const container = document.getElementById('waffel-step-content');
    const progress = document.getElementById('waffel-step-progress');
    const prevBtn = document.getElementById('waffel-prev-step');
    const nextBtn = document.getElementById('waffel-next-step');
    const restartBtn = document.getElementById('waffel-restart-steps');

    const pct = ((this.currentStep + 1) / steps.length) * 100;
    progress.style.width = pct + '%';

    const isLast = this.currentStep === steps.length - 1;

    container.innerHTML = `
      <div class="waffel-step-card ${isLast ? 'waffel-step-final' : ''}">
        <div class="waffel-step-number">Step ${this.currentStep + 1} of ${steps.length}</div>
        <div class="waffel-step-icon">${step.icon}</div>
        <h3 class="waffel-step-title">${step.title}</h3>
        <p class="waffel-step-text">${step.text}</p>
        <div class="waffel-step-tip">💡 ${step.tip}</div>
      </div>
    `;

    prevBtn.style.display = this.currentStep > 0 ? 'inline-flex' : 'none';
    nextBtn.style.display = !isLast ? 'inline-flex' : 'none';
    restartBtn.style.display = isLast ? 'inline-flex' : 'none';
  }

  nextStep() {
    const steps = this.getSteps();
    if (this.currentStep < steps.length - 1) {
      this.currentStep++;
      this.renderStep();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  restartSteps() {
    this.currentStep = 0;
    this.renderStep();
  }
}
