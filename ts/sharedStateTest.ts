import { LocalPeer } from "./localPeer";
import { PeerGroup } from "./peerGroup";
import { SharedState } from "./sharedState";

async function setAndCheck() {
  console.log('setAndCheck()');
  const state = new SharedState(await PeerGroup.make(new LocalPeer()));

  state.set("One", "Value One");
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  state.set("One", "Value Two");
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  const actual = state.get("One");
  console.assert(actual === "Value Two", `Actual: ${actual}`);
}

async function setAndCheckFromNull() {
  console.log('setAndCheckFromNull');
  const state = new SharedState(await PeerGroup.make(new LocalPeer()));

  state.set("One", null);
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  state.set("One", "Value Ignored");
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  state.set("One", "Value Good");
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  const actual = state.get("One");
  console.assert(actual === "Value Good", `Actual: ${actual}`);
}

// function setAndCheck2() {
//   console.log('setAndCheck2()');
//   const comms = new LocalCommChannel();

//   const state = new SharedState("A", comms);

//   state.setMy("One", "Value One");
//   console.assert(state.getAll("One")[0] === "Value One");
// }

// function setAndCheckAB() {
//   console.log('setAndCheckAB()');
//   const comms = new LocalCommChannel();
//   const stateA = new SharedState("A", comms);
//   const stateB = new SharedState("B", comms);

//   stateA.setMy("One", "Value A");
//   stateB.setMy("One", "Value B");


//   console.assert(stateA.getMy("One") === "Value A", 1);
//   console.assert(stateB.getMy("One") === "Value B", 2);
//   console.assert(stateA.getAll("One").indexOf("Value A") >= 0, 3);
//   console.assert(stateB.getAll("One").indexOf("Value B") >= 0, 4);
//   setTimeout(() => {
//     console.assert(stateA.getAll("One").indexOf("Value B") >= 0, 5);
//     console.assert(stateB.getAll("One").indexOf("Value A") >= 0, 6);
//   }, 0);
// }

// function updateShared() {
//   console.log('updateShared');
//   const comms = new LocalComms();
//   const stateA = new SharedState("A", comms);
//   const stateB = new SharedState("B", comms);
//   stateA.updateShared("One", "Value 1");
//   stateA.updateShared("One", "Value 2");
//   console.assert(stateA.getMy("One") === "Value 2"), 1;

//   setTimeout(() => {
//     console.assert(stateB.getMy("One") === "Value 2", 2);
//   })
// }

async function go() {
  await setAndCheck();
  await setAndCheckFromNull();
  // setAndCheck2();
  // setAndCheckAB();
}

go();
