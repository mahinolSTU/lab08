// assets/js/custom.js
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const resultsContainer = document.getElementById('form-results');
  const popup = document.getElementById('success-popup');
  const submitBtn = document.getElementById('submitButton');

  if (!form) return;

  const fields = Array.from(form.querySelectorAll('[data-validate]'));
  const phoneInput = document.getElementById('phone');

  // Real-time validation for all fields (except phone masking handled separately)
  fields.forEach((field) => {
    if (field === phoneInput) return; // phone has its own handler below

    field.addEventListener('input', () => {
      validateField(field);
      checkFormValidity();
    });

    field.addEventListener('blur', () => {
      validateField(field);
      checkFormValidity();
    });
  });

  // Phone input masking + validation (global)
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      handlePhoneInput(phoneInput);
      checkFormValidity();
    });

    phoneInput.addEventListener('blur', () => {
      handlePhoneInput(phoneInput);
      checkFormValidity();
    });
  }

  // Initial state: keep button disabled
  checkFormValidity();

  // SUBMIT HANDLER (no reload)
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Final validation before submit
    fields.forEach((field) => validateField(field));
    handlePhoneInput(phoneInput);
    checkFormValidity();

    if (submitBtn && submitBtn.disabled) {
      // form is not valid, do not continue
      return;
    }

    // Collect values
    const name = document.getElementById('firstName').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const rating1 = parseFloat(document.getElementById('rating1').value);
    const rating2 = parseFloat(document.getElementById('rating2').value);
    const rating3 = parseFloat(document.getElementById('rating3').value);

    // Average rating
    const average = (rating1 + rating2 + rating3) / 3;
    const averageRounded = parseFloat(average.toFixed(1));

    // Store data in JS object (no helper tag)
    const formData = {
      name,
      surname,
      email,
      phone,
      address,
      rating1,
      rating2,
      rating3,
      average: averageRounded,
    };

    // Print object in console
    console.log('Contact form data:', formData);

    // Show result under the form
    const lines = [
      `Name: ${name}`,
      `Surname: ${surname}`,
      `Email: ${email}`,
      `Phone number: ${phone}`,
      `Address: ${address}`,
      `Rating 1: ${rating1}`,
      `Rating 2: ${rating2}`,
      `Rating 3: ${rating3}`,
    ];

    resultsContainer.innerHTML = `
      ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
      <p class="average-result">
        <strong>${escapeHtml(name)} ${escapeHtml(surname)}:</strong>
        <span class="average-value">${averageRounded}</span>
      </p>
    `;

    // Color-code average
    const avgEl = resultsContainer.querySelector('.average-value');
    if (avgEl) {
      avgEl.classList.remove('avg-low', 'avg-mid', 'avg-high');

      if (averageRounded < 4) {
        avgEl.classList.add('avg-low'); // 0–4
      } else if (averageRounded < 7) {
        avgEl.classList.add('avg-mid'); // 4–7
      } else {
        avgEl.classList.add('avg-high'); // 7–10
      }
    }

    // Show success popup
    if (popup) {
      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 3000);
    }

    // Reset form after successful submission
    form.reset();

    // Clear validation states
    fields.forEach((field) => {
      field.classList.remove('is-valid', 'is-invalid');
      const fb = field.parentElement.querySelector('.invalid-feedback');
      if (fb) fb.textContent = '';
    });

    if (phoneInput) {
      phoneInput.classList.remove('is-valid', 'is-invalid');
      const fb = phoneInput.parentElement.querySelector('.invalid-feedback');
      if (fb) fb.textContent = '';
    }

    checkFormValidity();
  });

  // ---------- VALIDATION HELPERS ----------

  function validateField(field) {
    const type = field.dataset.validate;
    const value = field.value.trim();
    let error = '';

    if (!value) {
      error = 'This field is required.';
    } else {
      switch (type) {
        case 'name':
        case 'surname':
          // Only letters (allow spaces, - and ')
          if (!/^[A-Za-zÀ-ž\s'-]+$/.test(value)) {
            error = 'Use letters only.';
          }
          break;

        case 'email':
          // Basic email format check
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            error = 'Enter a valid email address.';
          }
          break;

        case 'address':
          // "Meaningful" address: at least 5 chars and some letters
          if (value.length < 5 || !/[A-Za-z]/.test(value)) {
            error = 'Enter a more detailed address.';
          }
          break;

        case 'rating':
          const num = parseFloat(value);
          if (isNaN(num) || num < 0 || num > 10) {
            error = 'Rating must be between 0 and 10.';
          }
          break;

        default:
          break;
      }
    }

    setFieldState(field, error);
  }

  function setFieldState(field, errorMessage) {
    const feedback = field.parentElement.querySelector('.invalid-feedback');

    if (errorMessage) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (feedback) feedback.textContent = errorMessage;
    } else {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (feedback) feedback.textContent = '';
    }
  }

  // ---------- PHONE MASKING (GLOBAL) ----------

  function handlePhoneInput(input) {
    if (!input) return;

    // Keep digits only
    let digits = input.value.replace(/\D/g, '');

    // Limit to reasonable international length (E.164 max is 15 digits)
    if (digits.length > 15) {
      digits = digits.slice(0, 15);
    }

    // Show with + prefix
    input.value = digits ? '+' + digits : '';

    const valid = isValidGlobalPhone(digits);
    const feedback = input.parentElement.querySelector('.invalid-feedback');

    if (!digits) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (feedback) feedback.textContent = 'Phone number is required.';
    } else if (!valid) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (feedback) {
        feedback.textContent = 'Enter a valid phone number (7–15 digits).';
      }
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (feedback) feedback.textContent = '';
    }
  }

  // 7–15 digits = "global" reasonable phone condition
  function isValidGlobalPhone(digits) {
    return digits.length >= 7 && digits.length <= 15;
  }

  // ---------- FORM-LEVEL VALID STATE ----------

  function checkFormValidity() {
    let allValid = true;

    fields.forEach((field) => {
      if (field.classList.contains('is-invalid') || !field.value.trim()) {
        allValid = false;
      }
    });

    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, '');
      if (!isValidGlobalPhone(digits)) {
        allValid = false;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = !allValid;
    }
  }

  // ---------- UTILS ----------

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
});



//------Game memory----------------

document.addEventListener('DOMContentLoaded', function () {
  // Run only if the Memory Game section exists on this page
  const boardElement = document.getElementById('memoryGameBoard');
  if (!boardElement) return;

  const difficultySelect = document.getElementById('memoryDifficulty');
  const startButton = document.getElementById('memoryStartBtn');
  const restartButton = document.getElementById('memoryRestartBtn');
  const movesElement = document.getElementById('memoryMoves');
  const matchesElement = document.getElementById('memoryMatches');
  const totalPairsElement = document.getElementById('memoryTotalPairs');
  const winMessageElement = document.getElementById('memoryWinMessage');

  // Data set: at least 6 unique items (here: 12 emojis)
  const icons = ['🍎', '🍌', '🍇', '🍉', '🍍', '🥝', '🍒', '🍓', '🥑', '🥕', '🌽', '🍆'];

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let movesCount = 0;
  let matchesCount = 0;
  let totalPairs = 0;

  // Fisher–Yates shuffle
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function updateStats() {
    if (movesElement) movesElement.textContent = movesCount.toString();
    if (matchesElement) matchesElement.textContent = matchesCount.toString();
  }

  function clearBoard() {
    boardElement.innerHTML = '';
  }

  function resetState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    movesCount = 0;
    matchesCount = 0;
    if (winMessageElement) {
      winMessageElement.textContent = '';
    }
  }

  function initGame() {
    const difficulty = difficultySelect ? difficultySelect.value : 'easy';

    resetState();
    setupBoard(difficulty);
    updateStats();
  }

  function setupBoard(difficulty) {
    clearBoard();

    // Remove previous grid classes
    boardElement.classList.remove('memory-grid--easy', 'memory-grid--hard');
    boardElement.classList.add('memory-grid');

    if (difficulty === 'hard') {
      totalPairs = 12; // 6 x 4 = 24 cards
      boardElement.classList.add('memory-grid--hard');
    } else {
      totalPairs = 6; // 4 x 3 = 12 cards
      boardElement.classList.add('memory-grid--easy');
    }

    const selectedIcons = icons.slice(0, totalPairs);
    const cardValues = shuffleArray(selectedIcons.concat(selectedIcons)); // pair each icon

    cardValues.forEach(function (icon) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.icon = icon;
      card.setAttribute('aria-label', 'Hidden card');

      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-face memory-card-front">?</div>
          <div class="memory-card-face memory-card-back">${icon}</div>
        </div>
      `;

      card.addEventListener('click', onCardClick);
      boardElement.appendChild(card);
    });

    if (totalPairsElement) {
      totalPairsElement.textContent = totalPairs.toString();
    }
  }

  function onCardClick(event) {
    const card = event.currentTarget;

    if (lockBoard) return;
    if (card === firstCard) return;
    if (card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lockBoard = true;
    movesCount++;
    updateStats();

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch =
      firstCard && secondCard && firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      setTimeout(handleMatch, 300);
    } else {
      setTimeout(unflipCards, 900); // ~1 second delay as requested
    }
  }

  function handleMatch() {
    if (!firstCard || !secondCard) return;

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.setAttribute('aria-label', 'Matched card');
    secondCard.setAttribute('aria-label', 'Matched card');

    firstCard.removeEventListener('click', onCardClick);
    secondCard.removeEventListener('click', onCardClick);

    matchesCount++;
    updateStats();
    resetTurn();

    if (matchesCount === totalPairs && winMessageElement) {
      winMessageElement.textContent =
        'Great job! You matched all ' + totalPairs + ' pairs in ' + movesCount + ' moves.';
    }
  }

  function unflipCards() {
    if (firstCard) firstCard.classList.remove('flipped');
    if (secondCard) secondCard.classList.remove('flipped');
    resetTurn();
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // Event listeners for difficulty + buttons
  if (difficultySelect) {
    difficultySelect.addEventListener('change', initGame);
  }

  if (startButton) {
    startButton.addEventListener('click', initGame);
  }

  if (restartButton) {
    restartButton.addEventListener('click', initGame);
  }

  // Initialize once on page load
  initGame();
});


