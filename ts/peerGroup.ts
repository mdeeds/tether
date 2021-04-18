import { PeerInterface, DataConnectionInterface } from "./peerInterface";

type NamedCallbackFn = (data: string) => void;

export class PeerGroup {
  static make(conn: PeerInterface, joinId: string = null)
    : Promise<PeerGroup> {
    return new Promise((resolve, reject) => {
      const result = new PeerGroup(joinId, conn);
      result.getId().then(() => {
        resolve(result);
      });
    });
  }

  private conn: PeerInterface;
  private peers: Map<string, DataConnectionInterface> =
    new Map<string, DataConnectionInterface>();
  private id: string = null;
  private readyCallback: Function[] = [];
  private namedCallbacks: Map<string, NamedCallbackFn> =
    new Map<string, NamedCallbackFn>();

  private constructor(joinId: string = null, conn: PeerInterface) {
    this.conn = conn;
    this.conn.on('open', async (id: string) => {
      this.id = id;
      console.log(`AAAAA open (${this.id})`);
      if (joinId) {
        const peerConnection = this.conn.connect(joinId);
        this.peers.set(peerConnection.peer, peerConnection);
      }
      for (const cb of this.readyCallback) {
        cb(id);
      }
      this.readyCallback.splice(0);
    });

    this.conn.on('connection', (dataConnection: DataConnectionInterface) => {
      console.log(`AAAAA connection (${this.id})<-(${dataConnection.peer})`);
      if (dataConnection.peer === this.id) {
        throw new Error('Self connection.  HOW?');
      }
      if (!this.peers.has(dataConnection.peer)) {
        this.broadcast(`meet:${dataConnection.peer}`);
        // dataConnection is an inbound conneciton.  We need to establish
        // a new outbound one.
        const peerConnection = this.conn.connect(dataConnection.peer);
        if (peerConnection.peer != dataConnection.peer) {
          throw new Error('WHAT?');
        }
        this.peers.set(peerConnection.peer, peerConnection);
      }
      dataConnection.on('data', (data: string) => {
        console.log(`AAAAA data (${this.id})<-${dataConnection.peer}`);
        this.handleData(dataConnection.peer, data);
      });
    });
    this.conn.on('disconnected', () => {
      console.log(`AAAAA disconnected (${this.id})`);
      setTimeout(() => { this.conn.reconnect() }, 5000);
    });

    this.addCallback('meet', (peerId: string) => {
      if (!this.peers.has(peerId)) {
        if (peerId === this.id) {
          throw new Error("Meet myself!?");
        }
        const peerConnection = this.conn.connect(peerId);
        this.peers.set(peerId, peerConnection);
      }
    });
  }

  broadcast(message: string) {
    console.log(`AAAAA broadcast (${this.id}) '${message}'`);
    for (const [id, conn] of this.peers.entries()) {
      if (id === this.id) {
        throw new Error("I know myself already.");
      }
      if (conn.open) {
        console.log(`AAAAA send (${this.id}) '${message}'`);
        conn.send(message);
      } else {
        console.log(`AAAAA wait for open (${this.id})`);
        conn.on('open', () => {
          console.log(`AAAAA open-send (${this.id}) '${message}'`);
          conn.send(message);
        })
      }
    }
  }

  addCallback(name: string, f: NamedCallbackFn) {
    console.log(`AAAAA addCallback (${this.id}) '${name}'`);
    this.namedCallbacks.set(name, f);
  }

  getId(): Promise<string> {
    if (this.id) {
      return new Promise((resolve, reject) => { resolve(this.id); });
    } else {
      return new Promise((resolve, reject) => {
        this.readyCallback.push(resolve);
      });
    }
  }

  private async handleData(from: string, data: string) {
    console.log(`AAAAA (${this.id}): 13 ${data}`);
    if (!this.peers.has(from)) {
      this.conn.connect(from);
    }
    const match = data.match(/^([^:]+):(.*)$/);
    if (match) {
      const name = match[1];
      const message = match[2];
      console.log(`AAAAA: callback (${this.id}) '${name}'`);
      if (this.namedCallbacks.has(name)) {
        const fn = this.namedCallbacks.get(name);
        console.log(`AAAAA callback (${this.id}) ${name}(${message})`);
        fn(message);
        return;
      }
    }
  }
}