import { LocalPeer } from "./localPeer";
import { LockedText } from "./lockedText";
import { PeerGroup } from "./peerGroup";
import { PeerGroupInterface } from "./peerGroupInterface";
import { PeerInterface } from "./peerInterface";

async function TestUpdateText() {
  console.log('##### TestUpdateText #####');
  const peer: PeerInterface = new LocalPeer();
  const peerGroup: PeerGroupInterface = await PeerGroup.make(peer, null);
  const text = new LockedText(peerGroup);

  text.takeLock();
  text.update('AAAA');
  console.assert(text.get() === 'AAAA', 1);
  text.update('CCCC');
  console.assert(text.get() === 'CCCC', 2);
}

async function TestUpdateTextAB() {
  console.log('##### TestUpdateTextAB #####');
  const peerA: PeerInterface = new LocalPeer();
  const commsA: PeerGroupInterface = await PeerGroup.make(peerA, null);

  const peerB: PeerInterface = new LocalPeer();
  const commsB: PeerGroupInterface = await PeerGroup.make(peerB, peerA.id);

  // Imagine that textA is on one machine and textB is on another.
  // They are both views on the same underlying text.
  const textA = new LockedText(commsA);
  const textB = new LockedText(commsB);

  await textA.takeLock();
  await new Promise((resolve, reject) => { setTimeout(resolve, 10); });

  textA.update('AAAA');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });

  console.assert(textA.get() === 'AAAA', 1);
  console.assert(textB.get() === 'AAAA', `2: Actually ${textB.get()}`);

  await textB.takeLock();
  await new Promise((resolve, reject) => { setTimeout(resolve, 10); });
  textB.update('BBBB');
  textA.update('A22A');
  await new Promise((resolve, reject) => { setTimeout(resolve, 10); });

  console.assert(textA.get() === 'BBBB', `3: Actually ${textA.get()}`);
  console.assert(textB.get() === 'BBBB', `4: Actually ${textB.get()}`);
}

async function go() {
  await TestUpdateText();
  await TestUpdateTextAB();
}

go();
