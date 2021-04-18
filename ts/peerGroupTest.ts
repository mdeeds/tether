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
  console.log(`Host: ${host.id}`);
  let hostBuffer: string[] = [];
  hostGroup.addCallback('A', (fromId: string, data: string) => {
    hostBuffer.push(data);
  })

  const clients: LocalPeer[] = [];
  const clientGroups: PeerGroup[] = [];
  let clientBuffers: string[][] = [];

  for (let i = 0; i < 2; ++i) {
    clients.push(new LocalPeer());
    const client = clients[i];
    console.log(`AAAAA index:0`);
    const clientGroup = await PeerGroup.make(client, host.id);
    console.log(`AAAAA index:1`);
    console.log(`Client: ${client.id}`);
    clientGroup.addCallback('A', (fromId: string, data: string) => {
      clientBuffers[i].push(data);
    });
    clientGroups.push(clientGroup);
    clientBuffers.push([]);
  }

  console.log('============== pause ================');
  await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
  for (let i = 0; i < clientGroups.length; ++i) {
    clientGroups[i].broadcast(`A:${i}`);
  }
  hostGroup.broadcast('A:host');

  console.log('============== pause ================');
  await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
  console.log(JSON.stringify(hostBuffer));
  console.log(JSON.stringify(clientBuffers));

  console.assert(hostBuffer.indexOf("0") >= 0);
  console.assert(hostBuffer.indexOf("1") >= 0);
  console.assert(clientBuffers[0].indexOf("host") >= 0);
  console.assert(clientBuffers[0].indexOf("1") >= 0);
  console.assert(clientBuffers[1].indexOf("host") >= 0);
  console.assert(clientBuffers[1].indexOf("0") >= 0);
}

async function go() {
  // await testInstantiate();
  await testJoin();
}

go();

