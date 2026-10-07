/**
 * RevoRevis - Interactive Quiz Engine
 * Multi-question engine with option shuffling, instant scoring, explanations and reset capability
 */

export function initQuiz(questions, containerSelector = '#page-quiz', options = {}) {
  const container = document.querySelector(containerSelector);
  if (!container || !Array.isArray(questions)) return;

  const config = typeof options === 'string'
    ? { title: options }
    : (options || {});

  const title = config.title || `Quiz de révision (${questions.length} questions)`;
  const badge = config.badge || 'Auto-évaluation Bac Première';
  const shuffleOptions = config.shuffleOptions ?? true;

  let answeredCount = 0;
  let correctCount = 0;
  let preparedQuestions = [];

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function prepareQuestions() {
    preparedQuestions = questions.map((q) => {
      let opts = q.options.map((text, idx) => ({
        text,
        isCorrect: idx === q.correct
      }));

      if (shuffleOptions) {
        opts = shuffle(opts);
      }

      const newCorrectIndex = opts.findIndex(o => o.isCorrect);

      return {
        question: q.question,
        period: q.period || null,
        options: opts.map(o => o.text),
        correct: newCorrectIndex,
        explanation: q.explanation
      };
    });
  }

  function render() {
    prepareQuestions();

    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">
          <div>
            <span class="quiz-badge">${badge}</span>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-top: 0.2rem;">${title}</h3>
          </div>
          <div class="quiz-score-live" id="quiz-score-box">
            Score : <span id="quiz-score-num">0</span> / ${preparedQuestions.length}
          </div>
        </div>

        <div class="quiz-progress-bar-container" style="background: var(--border-color); height: 6px; border-radius: 999px; margin-bottom: 1.5rem; overflow: hidden;" title="Progression du quiz">
          <div id="quiz-progress-fill" style="background: var(--color-primary); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>

        <div class="quiz-questions-list">
          ${preparedQuestions.map((q, qIndex) => `
            <div class="quiz-question-card" data-qindex="${qIndex}">
              <div class="question-text" style="display: flex; align-items: flex-start; gap: 0.5rem; flex-wrap: wrap;">
                <span style="color: var(--color-primary); font-weight: 800; min-width: 2.2rem;">Q${qIndex + 1}.</span>
                ${q.period ? `<span class="tag-badge tag-institution" style="font-size: 0.75rem; padding: 0.15rem 0.5rem; vertical-align: middle;">${q.period}</span>` : ''}
                <span style="flex: 1 1 auto;">${q.question}</span>
              </div>
              <div class="quiz-options">
                ${q.options.map((opt, oIndex) => `
                  <button type="button" class="quiz-option-btn" data-optindex="${oIndex}">
                    <span style="font-weight: 700; width: 22px; flex-shrink: 0;">${String.fromCharCode(65 + oIndex)}.</span>
                    <span style="flex-grow: 1;">${opt}</span>
                  </button>
                `).join('')}
              </div>
              <div class="quiz-feedback" id="feedback-${qIndex}"></div>
            </div>
          `).join('')}
        </div>

        <div class="quiz-footer">
          <span style="font-size: 0.9rem; color: var(--text-muted);" id="quiz-status-msg">
            Sélectionnez une réponse pour chaque question (l'ordre des choix est aléatoire).
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
    const progressFill = container.querySelector('#quiz-progress-fill');
    const statusMsg = container.querySelector('#quiz-status-msg');
    const resetBtn = container.querySelector('#quiz-reset-btn');

    questionCards.forEach(card => {
      const qIndex = parseInt(card.dataset.qindex, 10);
      const qData = preparedQuestions[qIndex];
      const buttons = card.querySelectorAll('.quiz-option-btn');
      const feedback = card.querySelector(`#feedback-${qIndex}`);

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Disable all buttons for this question once answered
          buttons.forEach(b => b.disabled = true);

          const chosenIndex = parseInt(btn.dataset.optindex, 10);
          const isCorrect = chosenIndex === qData.correct;

          answeredCount++;
          if (progressFill) {
            progressFill.style.width = `${Math.round((answeredCount / preparedQuestions.length) * 100)}%`;
          }

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

          if (scoreNum) {
            scoreNum.textContent = correctCount;
          }

          if (answeredCount === preparedQuestions.length) {
            const percent = Math.round((correctCount / preparedQuestions.length) * 100);
            if (percent === 100) {
              statusMsg.innerHTML = `🎉 <strong>Félicitations ! Score parfait (${correctCount}/${preparedQuestions.length}) !</strong> Notions parfaitement maîtrisées.`;
            } else if (percent >= 75) {
              statusMsg.innerHTML = `👍 <strong>Excellent score (${correctCount}/${preparedQuestions.length} — ${percent}%) !</strong> Vos connaissances sont solides.`;
            } else if (percent >= 50) {
              statusMsg.innerHTML = `⚠️ <strong>Score : ${correctCount}/${preparedQuestions.length} (${percent}%).</strong> Bon travail ! Consultez les fiches de cours pour approfondir les questions manquées.`;
            } else {
              statusMsg.innerHTML = `📖 <strong>Score : ${correctCount}/${preparedQuestions.length} (${percent}%).</strong> Nous vous conseillons de réécouter les podcasts et de relire les schémas avant de retenter !`;
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
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  render();
}
