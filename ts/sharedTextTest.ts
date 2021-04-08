import { SharedText } from "./sharedText"

function testAdds() {
  console.log('testAdds');
  let st = SharedText.empty();
  st = st.child("A\nC\n");
  st = st.child("A\nB\nC\n");
  st = st.child("A\nB\nC\nD\n");

  const latest = st.getValue();

  console.log(`Final: ${latest}`);
  console.assert(latest === "A\nB\nC\nD\n");
}

function testSameLine() {
  console.log('testSameLine');
  let st = SharedText.empty();
  for (const c of "This has a lot of different letters.") {
    st = st.child(c);
  }
  const latest = st.getValue();
  console.log(`Final: ${latest}`);
  console.assert(latest === ".");
}

testAdds();
testSameLine();