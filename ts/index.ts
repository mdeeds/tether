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

if (url.searchParams.get('test')) {
  test();
} else if (url.searchParams.get('boxes')) {
  body.appendChild(new DraggableBox().elt);
  body.appendChild(new DraggableBox().elt);
  body.appendChild(new DraggableBox().elt);
} else {
  const rail = new LeftRail(body);
  const middle = document.createElement('div');
  body.appendChild(middle);
  middle.classList.add('middle');
  const host = new Peer();
  PeerGroup.make(host).then((hostGroup) => {
    new Scene(hostGroup, 'KATS', 'host', middle);
  });
}