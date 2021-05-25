import Peer from "peerjs";
import { PeerGroup } from "./peerGroup";
import { Scene } from "./scene";
import { DraggableBox } from "./draggableBox";
import { LeftRail } from "./leftRail";

const body = document.getElementsByTagName('body')[0];

const url = new URL(document.URL);

async function test() {
  const rail = new LeftRail(body);

  const middle = document.createElement('div');
  body.appendChild(middle);
  middle.classList.add('middle');

  const host = new Peer();
  const hostGroup = await PeerGroup.make(host);
  const hostScene = new Scene(hostGroup, 'KATS', 'host', middle);

  for (let i = 1; i <= 2; ++i) {
    const client = new Peer();
    const clientGroup = await PeerGroup.make(client, host.id);
    const clientScene = new Scene(clientGroup, 'KATS', `client${i}`, middle);
  }
}

async function go() {
  const rail = new LeftRail(body);
  const middle = document.createElement('div');
  body.appendChild(middle);
  middle.classList.add('middle');
  const p = new Peer();

  let group: PeerGroup = null;
  if (url.searchParams.get('join')) {
    const hostId = url.searchParams.get('join');
    group = await PeerGroup.make(p, hostId);
  } else {
    group = await PeerGroup.make(p);
    const b = document.createElement('div');
    b.classList.add('joinBox');
    middle.appendChild(b);
    const a = document.createElement('a');
    const joinUrl = new URL(url.href);
    joinUrl.searchParams.append('join', p.id);
    a.href = `${joinUrl.href}`;
    a.innerText = a.href;
    b.appendChild(a);
  }
  new Scene(group, 'KATS', p.id, middle);
}

if (url.searchParams.get('test')) {
  test();
} else {
  go();
}