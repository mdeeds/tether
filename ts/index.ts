import Peer from "peerjs";
import { PeerGroup } from "./peerGroup";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  const host = new Peer();
  const hostGroup = await PeerGroup.make(host);
  console.log(`Host: ${host.id}`);
  let hostBuffer: string[] = [];
  hostGroup.addCallback('B', (data: string) => {
    hostBuffer.push(data);
  })

  const client = new Peer();
  const clientGroup = await PeerGroup.make(client, host.id);
  console.log(`Client: ${client.id}`);
  let clientBuffer: string[] = [];
  clientGroup.addCallback('A', (data: string) => {
    clientBuffer.push(data);
  })

  console.log('============== pause ================');
  await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
  clientGroup.broadcast('B:0');
  hostGroup.broadcast('A:1');

  console.log('============== pause ================');
  await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
  clientGroup.broadcast('B:2');
  hostGroup.broadcast('A:3');

  console.log('============== pause ================');
  await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
  console.log(JSON.stringify(hostBuffer));
  console.log(JSON.stringify(clientBuffer));
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