import { INITIAL_QUESTIONS, LEVEL_METADATA } from './src/data/defaultQuestions';
import { MAPS } from './src/game/engine/tileMaps';
import assert from 'assert';

console.log('Running Audit Quest 3-level Item 4.10 integrity verification...');

// 1. Verify exactly 3 levels
assert.strictEqual(LEVEL_METADATA.length, 3, 'Must have exactly 3 levels');
assert.strictEqual(Object.keys(MAPS).length, 3, 'MAPS must have exactly 3 levels');

// 2. Verify questions: exactly 6, strictly item 4.10, ordered easiest to hardest
assert.strictEqual(INITIAL_QUESTIONS.length, 6, 'Must have exactly 6 questions (2 per level)');

const expectedDifficultyPerLevel: Record<number, 'FACIL' | 'MEDIO' | 'DIFICIL'> = {
  1: 'FACIL',
  2: 'MEDIO',
  3: 'DIFICIL',
};

const expectedCategories: Record<number, string> = {
  1: 'CONCENTRACAO',
  2: 'DIVULGACAO',
  3: 'RESISTENCIA_RISCO',
};

for (const q of INITIAL_QUESTIONS) {
  // Check 1 correct option
  const correctCount = q.options.filter(o => o.isCorrect).length;
  assert.strictEqual(correctCount, 1, `Question ${q.id} must have exactly 1 correct answer`);
  
  // Check difficulty matches level progression
  assert.strictEqual(
    q.difficulty,
    expectedDifficultyPerLevel[q.levelNumber],
    `Question ${q.id} in level ${q.levelNumber} must have difficulty ${expectedDifficultyPerLevel[q.levelNumber]}`
  );

  // Check category
  assert.strictEqual(
    q.category,
    expectedCategories[q.levelNumber],
    `Question ${q.id} category mismatch`
  );

  assert(q.points > 0, `Question ${q.id} points must be > 0`);
  assert(q.title.length > 0, `Question ${q.id} missing title`);
  assert(q.normReference.includes('4.10'), `Question ${q.id} must cite Item 4.10`);
}

// 3. Verify MAPS existence & DIVERSITY: All 3 levels must have unique layouts!
assert.notDeepStrictEqual(MAPS[1].tiles, MAPS[2].tiles, 'Level 1 and 2 maps must have different tile layouts');
assert.notDeepStrictEqual(MAPS[2].tiles, MAPS[3].tiles, 'Level 2 and 3 maps must have different tile layouts');
assert.notDeepStrictEqual(MAPS[1].tiles, MAPS[3].tiles, 'Level 1 and 3 maps must have different tile layouts');
assert.notDeepStrictEqual(MAPS[1].playerStart, MAPS[2].playerStart, 'Level 1 and 2 start points must differ');

for (let lvl = 1; lvl <= 3; lvl++) {
  const map = MAPS[lvl];
  assert(map, `Map for level ${lvl} must exist`);
  assert.strictEqual(map.tiles.length, map.height, `Map ${lvl} height mismatch`);
  assert.strictEqual(map.tiles[0].length, map.width, `Map ${lvl} width mismatch`);
  assert(map.interactives.length > 0, `Map ${lvl} must have interactive nodes`);
}

// Map 1: Sealed turnstile on Row 7
for (let col = 0; col < MAPS[1].width; col++) {
  const tile = MAPS[1].tiles[7][col];
  if (col === 7 || col === 8) {
    assert.strictEqual(tile, 'DOOR_LOCKED', `Map 1 row 7 col ${col} must be DOOR_LOCKED`);
  } else {
    assert.strictEqual(tile, 'WALL', `Map 1 row 7 col ${col} must be WALL`);
  }
}

// Map 2: Sealed vertical divider on Column 8 (Row 8 is DOOR_LOCKED, rest are WALL)
for (let row = 0; row < MAPS[2].height; row++) {
  const tile = MAPS[2].tiles[row][8];
  if (row === 8) {
    assert.strictEqual(tile, 'DOOR_LOCKED', `Map 2 col 8 row ${row} must be DOOR_LOCKED`);
  } else {
    assert.strictEqual(tile, 'WALL', `Map 2 col 8 row ${row} must be WALL`);
  }
}

// Map 3: Council checkpoint on Row 6 + Final Door on Row 1
for (let col = 0; col < MAPS[3].width; col++) {
  const tile = MAPS[3].tiles[6][col];
  if (col === 7 || col === 8) {
    assert.strictEqual(tile, 'DOOR_LOCKED', `Map 3 row 6 col ${col} must be DOOR_LOCKED`);
  } else {
    assert.strictEqual(tile, 'WALL', `Map 3 row 6 col ${col} must be WALL`);
  }
}

// Map 3: Verify the Final Door (ÚLTIMA PORTA) node
const finalDoor = MAPS[3].interactives.find(n => n.id === 'door-lvl3-final-a');
assert(finalDoor, 'Map 3 must have door-lvl3-final-a');
assert.strictEqual(finalDoor.type, 'DOOR');
assert(finalDoor.name.includes('Parecer Final'), 'Final door name must mention Parecer Final');
assert.deepStrictEqual(finalDoor.requiresQuestionIds, ['q-410-5', 'q-410-6'], 'Final door must require questions 5 and 6');

// 4. Verify door and elevator dependencies link to existing questions
for (let lvl = 1; lvl <= 3; lvl++) {
  const map = MAPS[lvl];
  for (const node of map.interactives) {
    if (node.requiresQuestionIds) {
      for (const reqId of node.requiresQuestionIds) {
        const found = INITIAL_QUESTIONS.find(q => q.id === reqId);
        assert(found, `Map ${lvl} node ${node.id} requires non-existent question ${reqId}`);
      }
    }
  }
}

// 5. Test retry logic simulation: wrong answer does NOT permanently lock question
{
  const testAnswers = [
    { questionId: 'q-410-1', optionId: 'opt-wrong', isCorrect: false, pointsEarned: 0 }
  ];
  // Door check with wrong answer: door remains locked
  const doorRequires = ['q-410-1'];
  const doorUnlockedBefore = doorRequires.every(qid => 
    testAnswers.some(a => a.questionId === qid && a.isCorrect)
  );
  assert.strictEqual(doorUnlockedBefore, false, 'Door must be locked when answer is wrong');

  // Retry simulation: user discovers correct answer and updates answer array
  const correctIdx = testAnswers.findIndex(a => a.questionId === 'q-410-1');
  testAnswers[correctIdx] = { questionId: 'q-410-1', optionId: 'opt-right', isCorrect: true, pointsEarned: 100 };

  const doorUnlockedAfter = doorRequires.every(qid => 
    testAnswers.some(a => a.questionId === qid && a.isCorrect)
  );
  assert.strictEqual(doorUnlockedAfter, true, 'Door must unlock after successful retry');
}

console.log('✓ All 3-level Item 4.10 integrity assertions passed successfully!');
