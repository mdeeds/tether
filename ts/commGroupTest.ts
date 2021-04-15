import { rejects } from "assert";
import { resolve } from "path";
import { CommGroup } from "./commGroup";
import { LockedText } from "./lockedText";

async function testAB() {
  console.log('testAB');
  const commGroup = CommGroup.localCommGroup();

  const channelOne = commGroup.getOrCreate('1');
  const channelTwo = commGroup.getOrCreate('2');

  const textA = [
    new LockedText('A', channelOne),
    new LockedText('A', channelTwo)];

  const textB = [
    new LockedText('B', channelOne),
    new LockedText('B', channelTwo)];

  for (let i = 0; i < 2; ++i) {
    textA[i].takeLock();
    textA[i].update(`Channel ${i}`);
  }
  await new Promise((resolve, reject) => { setTimeout(resolve, 0); });

  for (let i = 0; i < 2; ++i) {
    console.assert(textB[i].get() === `Channel ${i}`, i);
  }
}


async function go() {
  await testAB();
}

go();