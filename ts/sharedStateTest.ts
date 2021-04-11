import { LocalComms } from "./localComms";
import { SharedState } from "./sharedState";

function setAndCheck() {
  console.log('setAndCheck()');
  const comms = new LocalComms();

  const state = new SharedState("A", comms);

  state.setMy("One", "Value One");
  console.assert(state.getMy("One") === "Value One");
}

function setAndCheck2() {
  console.log('setAndCheck2()');
  const comms = new LocalComms();

  const state = new SharedState("A", comms);

  state.setMy("One", "Value One");
  console.assert(state.getAll("One")[0] === "Value One");
}

function setAndCheckAB() {
  console.log('setAndCheckAB()');
  const comms = new LocalComms();
  const stateA = new SharedState("A", comms);
  const stateB = new SharedState("B", comms);

  stateA.setMy("One", "Value A");
  stateB.setMy("One", "Value B");


  console.assert(stateA.getMy("One") === "Value A", 1);
  console.assert(stateB.getMy("One") === "Value B", 2);
  console.assert(stateA.getAll("One").indexOf("Value A") >= 0, 3);
  console.assert(stateA.getAll("One").indexOf("Value B") >= 0, 4);
  console.assert(stateB.getAll("One").indexOf("Value A") >= 0, 5);
  console.assert(stateB.getAll("One").indexOf("Value B") >= 0, 6);
}

setAndCheck();
setAndCheck2();
setAndCheckAB();
