import Peer, { DataConnection } from "peerjs";

type NamedCallbackFn = (data: string) => void;
type DataCallbackFn = (ev: string, id: string, message: string) => void;

export class PeerGroup {
  static make(joinId: string = null, callback: DataCallbackFn = null)
    : Promise<PeerGroup> {
    return new Promise((resolve, reject) => {
      const result = new PeerGroup(joinId);
      if (callback) {
        result.addDataCallback(callback);
      }
      result.getId().then(() => {
        resolve(result);
      });
    });
  }

  private conn: Peer;
  private peers
    : Map<string, DataConnection> = new Map<string, DataConnection>();
  private id: string = null;
  private readyCallback: Function[] = [];
  private dataCallbacks: DataCallbackFn[] = [];
  private namedCallbacks: Map<string, NamedCallbackFn> =
    new Map<string, NamedCallbackFn>();

  private constructor(joinId: string = null) {
    // https://github.com/peers/peerjs-server
    // peerjs --port 9000 --key peerjs --path /
    // this.peer = new Peer(id, { host: '/', port: 9000 });
    // Go here to start the host:
    // https://ivory-python-8wtvfdje.ws-us03.gitpod.io/#/workspace/peerjs-server
    // this.peer = new Peer(
    //   id, { host: '9000-ivory-python-8wtvfdje.ws-us03.gitpod.io' });
    this.conn = new Peer(null, {});
    this.conn.on('open', (id: string) => {
      this.runCallbacks('open', id, '');
      this.id = id;
      if (joinId) {
        this.meet(joinId);
      }
      for (const cb of this.readyCallback) {
        cb(id);
      }
    });

    this.conn.on('connection', (conn) => {
      this.runCallbacks('connection', conn.peer, '');
      if (!conn.open) {
        conn.on('open', () => {
          this.setAndIntroduce(conn.peer, conn);
        });
      } else {
        this.setAndIntroduce(conn.peer, conn);
      }
      conn.on('data', (data) => {
        this.runCallbacks('data', conn.peer, data);
        this.handleData(data);
      });
    });
    this.conn.on('disconnected', () => {
      this.runCallbacks('disconnected', '', '');
      setTimeout(() => { this.conn.reconnect() }, 5000);
    });
  }

  private setAndIntroduce(id: string, conn: DataConnection) {
    if (!this.peers.has(id)) {
      this.broadcast(`meet: ${id}`);
      this.peers.set(id, conn);
    }
  }

  addCallback(name: string, f: NamedCallbackFn) {
    this.namedCallbacks.set(name, f);
  }

  private addDataCallback(f: DataCallbackFn) {
    this.dataCallbacks.push(f);
  }

  private runCallbacks(ev: string, id: string, data: string) {
    for (const f of this.dataCallbacks) {
      f(ev, id, data);
    }
    if (ev === 'data') {
      const reName = /^([^:]+): (.*)$/;
      const match = data.match(reName);
      if (match && match.length > 0) {
        const name = match[1];
        const message = match[2];
        if (this.namedCallbacks.has(name)) {
          const fn = this.namedCallbacks.get(name);
          fn(message);
          return;
        }
      }
    }
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

  broadcast(message: string) {
    for (const [id, conn] of this.peers) {
      if (id === this.conn.id) {
        continue;
      }
      this.runCallbacks('send', id, message);
      if (conn.open) {
        conn.send(message);
      } else {
        this.runCallbacks('send', conn.peer, 'NOT OPEN');
      }
    }
  }

  private meet(joinId: string) {
    const masterConnection = this.conn.connect(joinId);
    masterConnection.on('open', () => {
      this.runCallbacks('open', joinId, '');
    });
    masterConnection.on('data', (data) => {
      this.runCallbacks('data', masterConnection.peer, data);
      this.handleData(data);
    })
    this.setAndIntroduce(joinId, masterConnection);
  }

  private handleData(data: string) {
    const keyPhrase = 'meet: ';
    if (data.startsWith(keyPhrase)) {
      const id = data.substr(keyPhrase.length);
      if (!this.peers.has(id)) {
        this.meet(id);
      }
    }
  }
}