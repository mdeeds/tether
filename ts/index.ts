import Peer from "peerjs";
import { PeerGroup } from "./peerGroup";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  const host = new Peer();
  const hostGroup = await PeerGroup.make(host);
  console.log(`Host: ${host.id}`);
  let hostBuffer: string[] = [];
  hostGroup.addCallback('A', (fromId: string, data: string) => {
    hostBuffer.push(data);
  })

  const clients: Peer[] = [];
  const clientGroups: PeerGroup[] = [];
  let clientBuffers: string[][] = [];

  for (let i = 0; i < 2; ++i) {
    clients.push(new Peer());
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
}

if (url.searchParams.get('test')) {
  test();
} else {
  const mainArea = document.createElement('div');
  mainArea.id = 'mainArea';
  body.appendChild(mainArea);

  const tabList = document.createElement('div');
  mainArea.appendChild(tabList);

  const tab = document.createElement('span');
  tab.innerText = 'party';
  tab.classList.add('tab');
  tabList.appendChild(tab);

  const editArea = document.createElement('div');
  mainArea.appendChild(editArea);
  editArea.contentEditable = "true";
  editArea.spellcheck = false;
  editArea.id = 'editArea';

  editArea.addEventListener('mousemove', (ev) => {

  });
}