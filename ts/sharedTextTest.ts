import { SharedText } from "./sharedText"

function testAdds() {
  console.log('testAdds');
  let st = SharedText.empty();
  st = st.child("A\nC\n");
  st = st.child("A\nB\nC\n");
  st = st.child("A\nB\nC\nD\n");

  const latest = st.getValue();

  st.printDebugDeltas();
  console.log(`Final: ${JSON.stringify(latest)}`);
  console.assert(latest === "A\nB\nC\nD\n");
}

function testSameLine() {
  console.log('testSameLine');
  let st = SharedText.empty();
  for (const c of "This has a lot of different letters.") {
    st = st.child(c);
  }

  st.printDebugDeltas();
  const latest = st.getValue();
  console.log(`Final: ${latest}`);
  console.assert(latest === ".");
}

function testApplyPatch() {
  console.log('testApplyPatch');
  let versionA = SharedText.empty();
  versionA = versionA.child("A\nB\nC\n");
  const versionBText = "A\nB\n1\nC\n";
  let versionB = versionA.child(versionBText);
  const patch = versionB.makePatch(versionA.hash);
  const applied = versionA.applyPatch(patch).getValue();

  console.log(`Applied: ${JSON.stringify(applied)}`);
  console.log(`versionBText: ${JSON.stringify(versionBText)}`);
  console.assert(applied === versionBText);
}

function testApplyPatchMany() {
  console.log('testApplyPatchMany');
  let versionA = SharedText.empty();
  const versions: string[] = [
    "A\nB\nC\n",
    "A\n1\nB\nC\n",
    "A\n1\nC\n",
    "1\nC\n2\n3",
  ]
  versionA = versionA.child(versions[0]);
  let versionB = versionA;
  for (let i = 1; i < versions.length; ++i) {
    versionB = versionB.child(versions[i]);
  }
  const versionBText = versionB.getValue();
  const patch = versionB.makePatch(versionA.hash);
  const applied = versionA.applyPatch(patch).getValue();

  console.log(`Applied: ${JSON.stringify(applied)}`);
  console.log(`versionBText: ${JSON.stringify(versionBText)}`);
  console.assert(applied === versionBText);
}

testAdds();
testSameLine();
testApplyPatch();
testApplyPatchMany();