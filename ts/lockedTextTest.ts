import { Comms } from "./comms";
import { LocalComms } from "./localComms";
import { LockedText } from "./lockedText";

async function TestUpdateText() {
  console.log('TestUpdateText');
  const comms: Comms = new LocalComms();
  const text = new LockedText('ID1', comms);

  text.takeLock();
  text.update('AAAA');
  console.assert(text.get() === 'AAAA', 1);
  text.update('CCCC');
  console.assert(text.get() === 'CCCC', 2);
}

async function TestUpdateTextAB() {
  console.log('TestUpdateTextAB');
  const comms: Comms = new LocalComms();
  // Imagine that textA is on one machine and textB is on another.
  const textA = new LockedText('IDA', comms);
  const textB = new LockedText('IDB', comms);

  textA.takeLock();
  textA.update('AAAA');
  await new Promise((resolve, reject) => { setTimeout(resolve, 0); });

  console.assert(textA.get() === 'AAAA', 1);
  console.assert(textB.get() === 'AAAA', 2);

  textB.takeLock();
  await new Promise((resolve, reject) => { setTimeout(resolve, 0); });
  textB.update('BBBB');
  textA.update('A22A');
  await new Promise((resolve, reject) => { setTimeout(resolve, 0); });

  console.assert(textA.get() === 'BBBB', `3: Actually ${textA.get()}`);
  console.assert(textB.get() === 'BBBB', `4: Actually ${textB.get()}`);
}



async function go() {
  await TestUpdateText();
  await TestUpdateTextAB();
}

go();
