// assets/js/custom.js
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const resultsContainer = document.getElementById('form-results');
  const popup = document.getElementById('success-popup');

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // 4) prevent default reload

    const name = document.getElementById('firstName').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const rating1 = parseFloat(document.getElementById('rating1').value);
    const rating2 = parseFloat(document.getElementById('rating2').value);
    const rating3 = parseFloat(document.getElementById('rating3').value);

    // Simple validation
    if (!name || !surname || !email || !phone || !address ||
        isNaN(rating1) || isNaN(rating2) || isNaN(rating3)) {
      alert('Please fill in all fields and ratings (0–10).');
      return;
    }

    // Rating must be 0–10
    const ratings = [rating1, rating2, rating3];
    if (ratings.some(r => r < 0 || r > 10)) {
      alert('Ratings must be between 0 and 10.');
      return;
    }

    // 5) Average rating
    const average = (rating1 + rating2 + rating3) / 3;
    const averageRounded = parseFloat(average.toFixed(1));

    // 4) Helper tag
    const helperTag = generateHelperTag();

    // 4) Store in JS object
    const formData = {
      name,
      surname,
      email,
      phone,
      address,
      rating1,
      rating2,
      rating3,
      helperTag
    };

    // 4) Print in console
    console.log('Contact form data:', formData);

    // 4) Display data below the form
    const lines = [
      `Name: ${name}`,
      `Surname: ${surname}`,
      `Email: ${email}`,
      `Phone number: ${phone}`,
      `Address: ${address}`,
      `Rating 1: ${rating1}`,
      `Rating 2: ${rating2}`,
      `Rating 3: ${rating3}`,
      `Helper tag: ${helperTag}`
    ];

    resultsContainer.innerHTML = `
      ${lines.map(line => `<p>${escapeHtml(line)}</p>`).join('')}
      <p class="average-result">
        <strong>${escapeHtml(name)} ${escapeHtml(surname)}:</strong>
        <span class="average-value">${averageRounded}</span>
      </p>
    `;

    // 6) Color-code average
    const avgEl = resultsContainer.querySelector('.average-value');
    if (avgEl) {
      avgEl.classList.remove('avg-low', 'avg-mid', 'avg-high');

      if (averageRounded < 4) {
        avgEl.classList.add('avg-low');      // 0–3.9
      } else if (averageRounded < 7) {
        avgEl.classList.add('avg-mid');      // 4.0–6.9
      } else {
        avgEl.classList.add('avg-high');     // 7.0–10
      }
    }

    // 7) Success popup
    if (popup) {
      popup.classList.add('show');
      setTimeout(function () {
        popup.classList.remove('show');
      }, 3000);
    }

    // Optional: reset form after successful submit
    form.reset();
  });

  // Helper: FE24-JS-CF-XXXXX
  function generateHelperTag() {
    const prefix = 'FE24-JS-CF-';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 5; i++) {
      const index = Math.floor(Math.random() * chars.length);
      code += chars.charAt(index);
    }

    return prefix + code;
  }

  // Very small sanitizer for output
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
});
