import { Levenshtein } from "./levenshtein";

function addOne() {
  console.log('## addOne ##');
  const before = [1, 2];
  const after = [1, 3, 2];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  console.assert(applied[0] === after[0]);
  console.assert(applied[2] === after[2]);
}

function removeOne() {
  console.log('## removeOne ##');
  const before = [1, 3, 2];
  const after = [1, 2];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  console.assert(applied[0] === after[0]);
  console.assert(applied[1] === after[1]);
}

function addEditDelete() {
  console.log('## addEditDelete ##');
  const before = [1, 1, 1, 2, 2, 2, 3, 3, 3];
  const after = [1, 4, 1, 1, 2, 5, 2, 3, 3];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function insertStartEnd() {
  console.log('## insertStartEnd ##');
  const before = [1, 2, 3];
  const after = [0, 1, 2, 3, 4];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  //     0 1 2 3 4
  // 1 [[0,1,2,3,4],
  // 2  [1,1,1,2,3],
  // 3  [2,2,2,1,2]]

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function insertNearStart() {
  console.log('## insertNearStart ##');
  const before = [1, 2, 3];
  const after = [1, 0, 2, 3, 4];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  // [[0,1,2,3,4],
  //  [1,1,1,2,3],
  //  [2,2,2,1,2]]

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function insertNearEnd() {
  console.log('## insertNearEnd ##');
  const before = [1, 2, 3];
  const after = [0, 1, 2, 4, 3];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  // [[0,1,2,3,4],
  //  [1,1,1,2,3],
  //  [2,2,2,2,2]]

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function deleteAtFront() {
  console.log('## deleteAtFront ##');
  const before = [0, 1, 2, 3];
  const after = [1, 2, 3];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  // [[0,1,2],
  //  [1,1,2],
  //  [2,1,2],
  //  [3,2,1]]

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function deleteNearFront() {
  console.log('## deleteNearFront ##');
  const before = [0, 1, 2, 3];
  const after = [0, 2, 3];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  // [[0,1,2],
  //  [1,1,2],
  //  [2,1,2],
  //  [3,2,1]]

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

function oneTwoTest() {
  console.log('## oneTwoTest ##');
  const before = [0];
  const after = [1, 2];
  const delta = Levenshtein.distance<number>(before, after);

  console.log(`delta: ${JSON.stringify(delta)}`);
  const applied = before.slice();
  Levenshtein.applyEdits<number>(applied, delta);
  console.log(`after:   ${JSON.stringify(after)}`);
  console.log(`applied: ${JSON.stringify(applied)}`);

  for (let i = 0; i < after.length; ++i) {
    console.assert(applied[i] === after[i], `Mismatch@${i}`);
  }
}

addOne();
removeOne();
addEditDelete();
insertStartEnd();
insertNearStart();
insertNearEnd();
deleteAtFront();
deleteNearFront();
oneTwoTest();