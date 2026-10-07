/**
 * RevoRevis - Interactive Quiz Engine
 * 5 questions with local instant scoring, explanation and reset capability
 */

export function initQuiz(questions, containerSelector = '#page-quiz') {
  const container = document.querySelector(containerSelector);
  if (!container || !Array.isArray(questions)) return;

  let answeredCount = 0;
  let correctCount = 0;

  function render() {
    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div>
            <span class="quiz-badge">Auto-évaluation Bac Première</span>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-top: 0.2rem;">Quiz de révision (5 questions)</h3>
          </div>
          <div class="quiz-score-live" id="quiz-score-box">
            Score : <span id="quiz-score-num">0</span> / ${questions.length}
          </div>
        </div>

        <div class="quiz-questions-list">
          ${questions.map((q, qIndex) => `
            <div class="quiz-question-card" data-qindex="${qIndex}">
              <div class="question-text">
                <span style="color: var(--color-primary); font-weight: 800; margin-right: 0.4rem;">Q${qIndex + 1}.</span>
                ${q.question}
              </div>
              <div class="quiz-options">
                ${q.options.map((opt, oIndex) => `
                  <button type="button" class="quiz-option-btn" data-optindex="${oIndex}">
                    <span style="font-weight: 700; width: 20px;">${String.fromCharCode(65 + oIndex)}.</span>
                    <span>${opt}</span>
                  </button>
                `).join('')}
              </div>
              <div class="quiz-feedback" id="feedback-${qIndex}"></div>
            </div>
          `).join('')}
        </div>

        <div class="quiz-footer">
          <span style="font-size: 0.9rem; color: var(--text-muted);" id="quiz-status-msg">
            Sélectionnez une réponse pour chaque question.
          </span>
          <button type="button" class="quiz-reset-btn" id="quiz-reset-btn">
            🔄 Réinitialiser le quiz
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const questionCards = container.querySelectorAll('.quiz-question-card');
    const scoreNum = container.querySelector('#quiz-score-num');
    const statusMsg = container.querySelector('#quiz-status-msg');
    const resetBtn = container.querySelector('#quiz-reset-btn');

    questionCards.forEach(card => {
      const qIndex = parseInt(card.dataset.qindex, 10);
      const qData = questions[qIndex];
      const buttons = card.querySelectorAll('.quiz-option-btn');
      const feedback = card.querySelector(`#feedback-${qIndex}`);

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Disable all buttons for this question once answered
          buttons.forEach(b => b.disabled = true);

          const chosenIndex = parseInt(btn.dataset.optindex, 10);
          const isCorrect = chosenIndex === qData.correct;

          answeredCount++;

          if (isCorrect) {
            btn.classList.add('correct');
            feedback.className = 'quiz-feedback show correct';
            feedback.innerHTML = `<strong>✓ Excellente réponse !</strong> ${qData.explanation}`;
            correctCount++;
          } else {
            btn.classList.add('incorrect');
            // highlight the actual correct answer
            buttons[qData.correct].classList.add('correct');
            feedback.className = 'quiz-feedback show incorrect';
            feedback.innerHTML = `<strong>✗ Pas tout à fait...</strong> ${qData.explanation}`;
          }

          scoreNum.textContent = correctCount;

          if (answeredCount === questions.length) {
            if (correctCount === questions.length) {
              statusMsg.innerHTML = `🎉 <strong>Félicitations ! Score parfait (${correctCount}/${questions.length}) !</strong> Notions parfaitement maîtrisées.`;
            } else if (correctCount >= 3) {
              statusMsg.innerHTML = `👍 <strong>Bon travail (${correctCount}/${questions.length}) !</strong> Relisez les explications pour consolider les détails.`;
            } else {
              statusMsg.innerHTML = `📖 <strong>Score : ${correctCount}/${questions.length}.</strong> Nous vous conseillons de revoir le schéma et les tableaux avant de réessayer !`;
            }
          }
        });
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        answeredCount = 0;
        correctCount = 0;
        render();
      });
    }
  }

  render();
}
