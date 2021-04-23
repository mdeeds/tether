import Peer from "peerjs";
import { LockedText } from "./lockedText";
import { PeerGroup } from "./peerGroup";
import { PeerGroupInterface } from "./peerGroupInterface";
import { SharedBox } from "./sharedBox";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  const host = new Peer();
  const hostGroup = await PeerGroup.make(host);
  const hostBox = new SharedBox(hostGroup, body);

  const client = new Peer();
  const clientGroup = await PeerGroup.make(client, host.id);
  const clientBox = new SharedBox(clientGroup, body);
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