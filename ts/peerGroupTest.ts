import { resolve } from "path";
import { LocalPeer } from "./localPeer";
import { PeerGroup } from "./peerGroup";

async function testInstantiate() {
  console.log('testInstantiate');
  const conduit = new LocalPeer();
  const group = await PeerGroup.make(conduit);
}

async function testJoin() {
  console.log('testJoin');
  const host = new LocalPeer();
  const hostGroup = await PeerGroup.make(host);
  let hostBuffer: string[] = [];
  hostGroup.addCallback('B', (data: string) => {
    hostBuffer.push(data);
  })

  const client = new LocalPeer();
  const clientGroup = await PeerGroup.make(client, host.id);
  let clientBuffer: string[] = [];
  clientGroup.addCallback('A', (data: string) => {
    clientBuffer.push(data);
  })

  clientGroup.broadcast('A:0');
  hostGroup.broadcast('B:1');

  await new Promise((resolve, reject) => { setTimeout(resolve, 100); });

  console.log(JSON.stringify(hostBuffer));
  console.log(JSON.stringify(clientBuffer));
}

async function go() {
  await testInstantiate();
  await testJoin();
}

go();

