import { PeerInterface, DataConnectionInterface } from "./peerInterface";

type NamedCallbackFn = (data: string) => void;
type DebugCallbackFn = (ev: string, id: string, message: string) => void;

export class PeerGroup {
  static make(conn: PeerInterface, joinId: string = null,
    debugCallback: DebugCallbackFn = null)
    : Promise<PeerGroup> {
    return new Promise((resolve, reject) => {
      const result = new PeerGroup(joinId, conn);
      if (debugCallback) {
        result.addDebugCallback(debugCallback);
      }
      result.getId().then(() => {
        resolve(result);
      });
    });
  }

  private conn: PeerInterface;
  private peers
    : Map<string, DataConnectionInterface> = new Map<string, DataConnectionInterface>();
  private id: string = null;
  private readyCallback: Function[] = [];
  private debugCallbacks: DebugCallbackFn[] = [];
  private namedCallbacks: Map<string, NamedCallbackFn> =
    new Map<string, NamedCallbackFn>();

  private runDebugCallbacks(ev: string, id: string, data: string) {
    console.log(`AAAAA: 14 (${this.id}) ${ev} '${data}'`);
    for (const f of this.debugCallbacks) {
      f(ev, id, data);
    }
  }

  private constructor(joinId: string = null, conn: PeerInterface) {
    // https://github.com/peers/peerjs-server
    // peerjs --port 9000 --key peerjs --path /
    // this.peer = new Peer(id, { host: '/', port: 9000 });
    // Go here to start the host:
    // https://ivory-python-8wtvfdje.ws-us03.gitpod.io/#/workspace/peerjs-server
    // this.peer = new Peer(
    //   id, { host: '9000-ivory-python-8wtvfdje.ws-us03.gitpod.io' });
    this.conn = conn;
    this.conn.on('open', async (id: string) => {
      this.runDebugCallbacks('open', id, '');
      this.id = id;
      if (joinId) {
        this.meet(joinId);
      }
      for (const cb of this.readyCallback) {
        cb(id);
      }
    });

    this.conn.on('connection', (dataConnection: DataConnectionInterface) => {
      this.runDebugCallbacks('connection', dataConnection.peer, '');
      if (!dataConnection.open) {
        console.log(`AAAAA: 16a (${this.conn.id}) -> ${dataConnection.peer}`);
        dataConnection.on('open', () => {
          this.setAndIntroduce(dataConnection.peer, dataConnection);
        });
      } else {
        console.log(`AAAAA: 16b (${this.conn.id}) -> ${dataConnection.peer}`);
        this.setAndIntroduce(dataConnection.peer, dataConnection);
      }
      dataConnection.on('data', (data) => {
        this.runDebugCallbacks('data', dataConnection.peer, data);
        this.handleData(data);
      });
    });
    this.conn.on('disconnected', () => {
      this.runDebugCallbacks('disconnected', '', '');
      setTimeout(() => { this.conn.reconnect() }, 5000);
    });
  }

  private setAndIntroduce(id: string, dataConnection: DataConnectionInterface) {
    console.log(`AAAAA: 1`);
    if (!this.peers.has(id)) {
      console.log(`AAAAA: 2 ${this.id} -> ${id}`);
      this.broadcast(`meet:${id}`);
      this.peers.set(id, dataConnection);
    }
  }

  addCallback(name: string, f: NamedCallbackFn) {
    this.namedCallbacks.set(name, f);
  }

  private addDebugCallback(f: DebugCallbackFn) {
    this.debugCallbacks.push(f);
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

  pingAllPeers(): Promise<void> {
    let pending = 0;
    return new Promise((resolve, reject) => {
      for (const [id, dataConnection] of this.peers) {
        if (id === this.conn.id) {
          continue;
        }
        if (dataConnection.open) {
          // TODO: implement ask and answer????
        }
      }
    });
  }

  broadcast(message: string) {
    console.log(`AAAAA: 3 (${this.id}) broadcast(${message})`);
    for (const [id, dataConnection] of this.peers) {
      console.log(`AAAAA: 4 to ${id}`);
      if (id === this.conn.id) {
        continue;
      }
      console.log(`AAAAA: 5`);
      this.runDebugCallbacks('send', id, message);
      if (dataConnection.open) {
        dataConnection.send(`${message}`);
        console.log(`AAAAA: 6a (${this.id})->(${dataConnection.peer}) ${message}`);
      } else {
        dataConnection.on('open', () => {
          console.log(`AAAAA: 6b (${this.id})->(${dataConnection.peer}) ${message}`);
          dataConnection.send(`${message}`);
        });
        dataConnection.send('');
        console.log(`AAAAA: 7 waiting for open (6b)`);
      }
    }
  }

  private meet(joinId: string) {
    console.log(`AAAAA (${this.id}): 17 meet(${joinId})`);
    const masterConnection = this.conn.connect(joinId);
    masterConnection.on('data', (data: string) => {
      this.runDebugCallbacks('data', masterConnection.peer, data);
      this.handleData(data);
    })
    this.setAndIntroduce(joinId, masterConnection);
  }

  private async handleData(data: string) {
    console.log(`AAAAA (${this.id}): 13 ${data}`);
    const keyPhrase = 'meet:';
    if (data.startsWith(keyPhrase)) {
      const id = data.substr(keyPhrase.length);
      if (!this.peers.has(id)) {
        this.meet(id);
        console.log(`AAAAA (${this.id}): 18`)
      }
    } else {
      const match = data.match(/^([^:]+):(.*)$/);
      if (match) {
        const name = match[1];
        const message = match[2];
        console.log(`AAAAA: 15 ${name}`);
        if (this.namedCallbacks.has(name)) {
          const fn = this.namedCallbacks.get(name);
          fn(message);
          return;
        }
      }
    }
  }
}