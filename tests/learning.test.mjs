import test from "node:test";
import assert from "node:assert/strict";
import {
  questions,
  topics,
  scoreBand,
  scoreAnswers,
  recommendations,
  newAttempt,
  submitAnswer,
} from "../src/lib/learning/quiz.ts";
import { challenges, checkChallenge } from "../src/lib/learning/challenges.ts";
import { reset, horizonY, project } from "../src/lib/simulator/model.ts";
import { scene } from "../src/lib/simulator/render.ts";
test("15 unique questions satisfy choice, answer, topic and distribution requirements", () => {
  assert.equal(questions.length, 15);
  assert.equal(new Set(questions.map((q) => q.id)).size, 15);
  const counts = {};
  for (const q of questions) {
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices.map((c) => c.text)).size, 4);
    assert.equal(q.choices.filter((c) => c.correct).length, 1);
    assert.ok(q.explanation.length > 30);
    assert.ok(topics[q.topic]);
    counts[q.topic] = (counts[q.topic] ?? 0) + 1;
  }
  assert.deepEqual(counts, {
    position: 3,
    focal: 3,
    scale: 3,
    height: 2,
    landscape: 2,
    misconception: 2,
  });
});
test("all score band boundaries and scoring are correct", () => {
  for (const [score, band] of [
    [0, "Start with the simulator"],
    [6, "Start with the simulator"],
    [7, "Developing"],
    [9, "Developing"],
    [10, "Good understanding"],
    [12, "Good understanding"],
    [13, "Perspective understood"],
    [15, "Perspective understood"],
  ])
    assert.equal(scoreBand(score), band);
  for (let correct = 0; correct <= 15; correct++) {
    const answers = Object.fromEntries(
      questions.map((q, i) => [
        q.id,
        q.choices.findIndex((c) => c.correct === i < correct),
      ]),
    );
    assert.equal(scoreAnswers(answers), correct);
  }
});
test("recommendations target only missed topics and deduplicate lessons", () => {
  const answers = Object.fromEntries(
    questions.map((q) => [q.id, q.choices.findIndex((c) => c.correct)]),
  );
  assert.deepEqual(recommendations(answers), []);
  for (const topic of ["height", "landscape", "scale"]) {
    const q = questions.find((q) => q.topic === topic);
    answers[q.id] = q.choices.findIndex((c) => !c.correct);
  }
  const recommended = recommendations(answers);
  assert.equal(recommended.length, 2);
  assert.deepEqual(recommended.map((r) => r.href).sort(), [
    "/camera-distance-perspective/",
    "/landscape-perspective/",
  ]);
  assert.equal(
    recommended.find((r) => r.href === "/landscape-perspective/").labels.length,
    2,
  );
  assert.deepEqual(recommendations({}), []);
});
test("submissions are immutable, invalid answers rejected, and restart is fresh", () => {
  const initial = newAttempt(),
    q = questions[0];
  const next = submitAnswer(initial, q.id, 1);
  assert.deepEqual(initial, {});
  assert.equal(next[q.id], 1);
  assert.equal(submitAnswer(next, q.id, 2)[q.id], 1);
  assert.deepEqual(submitAnswer(initial, q.id, 8), {});
  assert.deepEqual(submitAnswer(initial, "unknown", 0), {});
  assert.deepEqual(newAttempt(), {});
});
test("each challenge starts unmet and its recommended solution meets the objective", () => {
  assert.equal(challenges.length, 5);
  for (const c of challenges) {
    assert.equal(
      checkChallenge(c.id, c.initial).passed,
      false,
      c.id + " starting state",
    );
    assert.equal(
      checkChallenge(c.id, c.solution).passed,
      true,
      c.id + " solution",
    );
    assert.ok(c.advice && c.tradeoff && c.lesson);
  }
});
test("horizon moves with tilt, not height, and rendering stays finite at bounds", () => {
  assert.equal(horizonY(reset()), 300);
  assert.equal(horizonY({ ...reset(), height: 5 }), 300);
  assert.ok(horizonY({ ...reset(), tilt: 6 }) < 300);
  assert.ok(horizonY({ ...reset(), tilt: -6 }) > 300);
  const s = { ...reset(), tilt: 6 };
  assert.ok(Math.abs(project(s, 0, 0, 1e10).y - horizonY(s)) < 1e-5);
  for (const tilt of [-12, 12])
    for (const distance of [3, 300])
      for (const height of [0.3, 5])
        assert.doesNotMatch(
          scene({ ...reset(), tilt, distance, height }),
          /NaN|Infinity/,
        );
});
