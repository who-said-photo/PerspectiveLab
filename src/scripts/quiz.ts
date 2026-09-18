import {
  questions,
  topics,
  newAttempt,
  submitAnswer,
  scoreAnswers,
  scoreBand,
  recommendations,
} from "../lib/learning/quiz";
export function mountQuiz() {
  const root = document.querySelector<HTMLElement>("#quiz");
  if (!root) return;
  const get = <T extends HTMLElement>(id: string) =>
    root.querySelector<T>("#" + id)!;
  let answers = newAttempt(),
    index = 0;
  const feedback = get("quiz-feedback");
  const complete = () => Object.keys(answers).length === questions.length;
  const render = (focus = false) => {
    const q = questions[index],
      selected = answers[q.id],
      answered = selected !== undefined;
    get("quiz-form").hidden = false;
    get("quiz-result-panel").hidden = true;
    get("quiz-progress-text").textContent =
      `Question ${index + 1} of ${questions.length} · ${Object.keys(answers).length} answered · ${topics[q.topic].label}`;
    get<HTMLProgressElement>("quiz-progress").value =
      Object.keys(answers).length;
    get("quiz-prompt").textContent = q.prompt;
    const choices = get("quiz-choices");
    choices.replaceChildren();
    q.choices.forEach((choice, i) => {
      const label = document.createElement("label");
      label.className = "quiz-choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(i);
      input.checked = selected === i;
      input.disabled = answered;
      const span = document.createElement("span");
      span.textContent = choice.text;
      label.append(input, span);
      choices.append(label);
    });
    get<HTMLButtonElement>("quiz-submit").disabled = answered;
    feedback.textContent = answered
      ? `${q.choices[selected].correct ? "Correct." : "Not quite."} Your answer: ${q.choices[selected].text} Correct answer: ${q.choices.find((c) => c.correct)!.text} ${q.explanation}`
      : "";
    get<HTMLButtonElement>("quiz-previous").disabled = index === 0;
    get<HTMLButtonElement>("quiz-next").disabled =
      !answered || index === questions.length - 1;
    get("quiz-next").hidden = index === questions.length - 1;
    get("quiz-results").hidden = !complete();
    if (focus) get("quiz-prompt").focus();
  };
  get("quiz-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = root.querySelector<HTMLInputElement>(
      'input[name="answer"]:checked',
    );
    if (!selected) {
      feedback.textContent = "Choose one answer, then submit.";
      return;
    }
    answers = submitAnswer(
      answers,
      questions[index].id,
      Number(selected.value),
    );
    render();
    // Keep a keyboard user at the next useful action after locking the answer.
    get(complete() ? "quiz-results" : "quiz-next").focus();
  });
  get("quiz-previous").addEventListener("click", () => {
    if (index > 0) {
      index--;
      render(true);
    }
  });
  get("quiz-next").addEventListener("click", () => {
    if (
      answers[questions[index].id] !== undefined &&
      index < questions.length - 1
    ) {
      index++;
      render(true);
    }
  });
  get("quiz-results").addEventListener("click", () => {
    if (!complete()) return;
    get("quiz-form").hidden = true;
    feedback.textContent = "";
    get("quiz-result-panel").hidden = false;
    const score = scoreAnswers(answers);
    get("quiz-score").textContent = `Your score: ${score} / 15`;
    get("quiz-band").textContent = scoreBand(score);
    const container = get("quiz-recommendations");
    container.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "Your next steps";
    container.append(heading);
    const missed = recommendations(answers);
    if (!missed.length) {
      const p = document.createElement("p");
      p.textContent =
        "You answered every question correctly. Put your understanding into practice with the perspective challenges.";
      const a = document.createElement("a");
      a.href = "/perspective-challenges/";
      a.textContent = "Explore the challenges";
      container.append(p, a);
    } else {
      const ul = document.createElement("ul");
      for (const lesson of missed) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = lesson.href;
        a.textContent = `Review: ${lesson.labels.join(", ")}`;
        li.append(a);
        ul.append(li);
      }
      container.append(ul);
      if (score < 7) {
        const a = document.createElement("a");
        a.href = "/perspective-simulator/";
        a.textContent = "Start with the simulator";
        container.append(a);
      }
    }
    get("quiz-score").focus();
  });
  get("quiz-review").addEventListener("click", () => {
    index = 0;
    render(true);
  });
  get("quiz-retake").addEventListener("click", () => {
    answers = newAttempt();
    index = 0;
    render(true);
  });
  render();
  get("quiz-app").hidden = false;
  get("quiz-loading").hidden = true;
}
