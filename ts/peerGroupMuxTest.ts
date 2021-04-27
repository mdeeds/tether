import { LocalPeer } from "./localPeer";
import { Log } from "./log";
import { PeerGroup } from "./peerGroup";
import { PeerGroupMux } from "./peerGroupMux";


async function zeroChannels() {
  Log.debug('zeroChannels');
  const conduit1 = new LocalPeer();
  const baseGroup1 = await PeerGroup.make(conduit1);

  const conduit2 = new LocalPeer();
  const baseGroup2 = await PeerGroup.make(conduit2, conduit1.id);

  const bufferA = [];
  baseGroup2.addListener((fromId: string, data: string) => {
    bufferA.push(data);
  });

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');
  baseGroup1.broadcast('A', 'AAA');

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');
  console.log(`${JSON.stringify(bufferA)}`);
}

async function oneChannel() {
  Log.debug('oneChannel');
  const conduit1 = new LocalPeer();
  const baseGroup1 = await PeerGroup.make(conduit1);
  const mux1 = new PeerGroupMux(baseGroup1);
  const channelA1 = mux1.get('A');

  const conduit2 = new LocalPeer();
  const baseGroup2 = await PeerGroup.make(conduit2, conduit1.id);
  const mux2 = new PeerGroupMux(baseGroup2);
  const channelA2 = mux2.get('A');

  const bufferA = [];
  channelA2.addListener((fromId: string, data: string) => {
    bufferA.push(data);
  });

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');
  channelA1.broadcast('A', 'AAA');

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');
  console.log(`${JSON.stringify(bufferA)}`);
}

async function twoChannels() {
  Log.debug('twoChannels');
  const conduit1 = new LocalPeer();
  const baseGroup1 = await PeerGroup.make(conduit1);
  const mux1 = new PeerGroupMux(baseGroup1);
  const channelA1 = mux1.get('A');
  const channelB1 = mux1.get('B');

  const conduit2 = new LocalPeer();
  const baseGroup2 = await PeerGroup.make(conduit2, conduit1.id);
  const mux2 = new PeerGroupMux(baseGroup2);
  const channelA2 = mux2.get('A');
  const channelB2 = mux2.get('B');

  const bufferA = [];
  const bufferB = [];

  channelA2.addListener((fromId: string, data: string) => {
    bufferA.push(data);
  });

  channelB2.addListener((fromId: string, data: string) => {
    bufferB.push(data);
  });

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');

  channelA1.broadcast('A', 'AAA');
  channelB1.broadcast('B', 'BBB');

  console.log('============== pause ===============');
  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });
  console.log('====================================');

  console.log(`${JSON.stringify(bufferA)}`);
  console.log(`${JSON.stringify(bufferB)}`);
}

async function go() {
  await zeroChannels();
  await oneChannel();
  await twoChannels();
}

go();