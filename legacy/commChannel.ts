import { AskCallback, CommChannelInterface, MessageCallback } from "./commChannelInterface";
import { DataConnectionInterface, PeerInterface } from "./peerInterface";

type NamedCallbackFn = (data: string) => void;
type DebugCallbackFn = (ev: string, id: string, message: string) => void;

export class CommChannel implements CommChannelInterface {
  callbacks: Map<string, MessageCallback> = new Map<string, MessageCallback>();
  agents: Map<string, AskCallback> = new Map<string, AskCallback>();
  private namedCallbacks: Map<string, NamedCallbackFn> =
    new Map<string, NamedCallbackFn>();

  private conn: PeerInterface;
  private id: string = null;
  private debugCallbacks: DebugCallbackFn[] = [];
  private readyCallbacks: Function[] = [];
  private peers
    : Map<string, DataConnectionInterface> = new Map<string, DataConnectionInterface>();


  constructor(conn: PeerInterface, joinId: string) {
    this.conn = conn;
    this.conn.on('open', (id: string) => {
      this.runCallbacks('open', id, '');
      if (joinId) {
        this.meet(joinId);
      }
      this.id = conn.id;
      for (const cb of this.readyCallbacks) {
        cb(id);
      }
    });

    this.conn.on('connection', (dataConnection: DataConnectionInterface) => {
      this.runCallbacks('connection', dataConnection.peer, '');
      if (!dataConnection.open) {
        dataConnection.on('open', () => {
          this.setAndIntroduce(dataConnection.peer, dataConnection);
        });
      } else {
        this.setAndIntroduce(dataConnection.peer, dataConnection);
      }
      dataConnection.on('data', (data) => {
        this.runCallbacks('data', dataConnection.peer, data);
        this.handleData(data);
      });
    });
    this.conn.on('disconnected', () => {
      this.runCallbacks('disconnected', '', '');
      setTimeout(() => { this.conn.reconnect() }, 5000);
    });

  }

  private runCallbacks(ev: string, id: string, data: string) {
    for (const f of this.debugCallbacks) {
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

  private meet(joinId: string) {
    const masterConnection = this.conn.connect(joinId);
    masterConnection.on('open', () => {
      this.runCallbacks('open', joinId, '');
    });
    masterConnection.on('data', (data: string) => {
      this.runCallbacks('data', masterConnection.peer, data);
      this.handleData(data);
    })
    this.setAndIntroduce(joinId, masterConnection);
  }


  sendMessage(message: string): void {
    console.log(`===== sendMessage ${message} =====`)
    this.broadcast(message);
  }

  addListener(to: string, callback: MessageCallback): void {
    if (this.callbacks.has(to)) {
      const previousCallback = this.callbacks.get(to);
      // Chain
      this.callbacks.set(to, (message) => {
        previousCallback(message);
        callback(message);
      })
    } else {
      this.callbacks.set(to, callback);
    }
  }

  addReply(name: string, callback: AskCallback): void {
    if (this.agents.has(name)) {
      const previousCallback = this.agents.get(name);
      // Chain the new callback before the first callback.
      // If the new callback fails, we process the previous one.
      this.agents.set(name, (from: string, message: string) => {
        return new Promise((resolve, reject) => {
          callback(from, message)
            .then((response: string) => {
              resolve(response);
            })
            .catch(() => {
              return previousCallback(from, message);
            });
        });
      });
    } else {
      this.agents.set(name, callback);
    }
  }

  ask(from: string, to: string, message: string): Promise<string> {
    console.log(`===== ask ${from} ${to} ${message} =====`);
    if (this.agents.has(to)) {
      return this.agents.get(to)(from, message);
    }
    else return new Promise((resolve, reject) => {
      reject(`No such agent: ${to}`);
    })
  }

  broadcast(message: string) {
    for (const [id, dataConnection] of this.peers) {
      if (id === this.conn.id) {
        continue;
      }
      this.runCallbacks('send', id, message);
      if (dataConnection.open) {
        dataConnection.send(message);
      } else {
        this.runCallbacks('send', dataConnection.peer, 'NOT OPEN');
      }
    }
  }

  private setAndIntroduce(id: string, dataConnection: DataConnectionInterface) {
    if (!this.peers.has(id)) {
      this.broadcast(`meet: ${id}`);
      this.peers.set(id, dataConnection);
    }
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