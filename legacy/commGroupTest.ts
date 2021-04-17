import { CommChannel } from "./commChannel";
import { CommGroup } from "./commGroup";
import { LocalPeer } from "./localPeer";
import { LockedText } from "./lockedText";

async function testAB() {
  console.log('testAB');
  const conduit = new LocalPeer();
  const localChannel = new CommChannel(conduit);
  const commGroup = new CommGroup(localChannel);

  const channelOne = commGroup.getOrCreate('One');
  const channelTwo = commGroup.getOrCreate('Two');

  const textA = [
    new LockedText('A', channelOne),
    new LockedText('A', channelTwo)];

  const textB = [
    new LockedText('B', channelOne),
    new LockedText('B', channelTwo)];

  for (let i = 0; i < 2; ++i) {
    await textA[i].takeLock();
    textA[i].update(`Channel ${i}`);
  }
  await new Promise((resolve, reject) => { setTimeout(resolve, 0); });

  for (let i = 0; i < 2; ++i) {
    console.assert(textB[i].get() === `Channel ${i}`,
      `${i} Actual: ${textB[i].get()}`);
  }
}


async function go() {
  await testAB();
}

go();