import { Log } from "./log";
import { CallbackFn, PeerGroupInterface } from "./peerGroupInterface";
import { PeerGroupMux } from "./peerGroupMux";
import { PeerInterface, DataConnectionInterface } from "./peerInterface";

export type AnswerCallbackFn = (fromId: string, message: string) => string;
export type AnswerRecieverFn = (answer: string) => void;

export class PeerGroup implements PeerGroupInterface {
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
  private namedCallbacks: Map<string, CallbackFn> =
    new Map<string, CallbackFn>();
  private anonymousCallbacks: CallbackFn[] = [];

  private answerCallbacks: Map<string, AnswerCallbackFn> =
    new Map<string, AnswerCallbackFn>();
  private replyCallbacks: Map<string, AnswerRecieverFn> =
    new Map<string, AnswerRecieverFn>();

  private constructor(joinId: string = null, conn: PeerInterface) {
    this.conn = conn;
    this.conn.on('open', async (id: string) => {
      this.id = id;
      Log.debug(`AAAAA open (${this.id})`);
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
      Log.debug(`AAAAA connection (${this.id})<-(${dataConnection.peer})`);
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
        Log.debug(`AAAAA data (${this.id})<-${dataConnection.peer} ` +
          `data=${data}`);
        this.handleData(dataConnection.peer, data);
      });
    });
    this.conn.on('disconnected', () => {
      Log.debug(`AAAAA disconnected (${this.id})`);
      setTimeout(() => { this.conn.reconnect() }, 5000);
    });

    this.addCallback('meet', (fromId: string, peerId: string) => {
      if (!this.peers.has(peerId)) {
        if (peerId === this.id) {
          throw new Error("Meet myself!?");
        }
        const peerConnection = this.conn.connect(peerId);
        this.peers.set(peerId, peerConnection);
      }
    });

    this.addCallback('answer', async (fromId: string, data: string) => {
      const match = data.match(/([0-9]+):(.*)/);
      if (match) {
        const askId = match[1];
        if (this.replyCallbacks.has(askId)) {
          this.replyCallbacks.get(askId)(match[2]);
        } else {
          throw new Error(`Did not ask for ${askId}`)
        }
      }
    });
    this.addCallback('ask', async (fromId: string, data: string) => {
      Log.debug(`(${this.id}) inside ask callback.`)
      const match = data.match(/([0-9]+):([^:]+):(.*)/);
      if (match) {
        const id = match[1];
        const name = match[2];
        if (!this.answerCallbacks.has(name)) {
          throw new Error(`Can't answer ${name}`);
        }
        const answer = this.answerCallbacks.get(name)(fromId, match[3]);
        this.send(fromId, `answer:${id}:${answer}`);
      } else {
        Log.debug(`(${this.id}) cannot match: ${data}`);
      }
    });
  }

  broadcast(message: string) {
    Log.debug(`AAAAA broadcast (${this.id}) '${message}'`);
    for (const [id, conn] of this.peers.entries()) {
      if (id === this.id) {
        throw new Error("I know myself already.");
      }
      if (conn.open) {
        Log.debug(`AAAAA send (${this.id}) '${message}'`);
        conn.send(message);
      } else {
        Log.debug(`AAAAA wait for open (${this.id})`);
        conn.on('open', () => {
          Log.debug(`AAAAA open-send (${this.id}) '${message}'`);
          conn.send(message);
        })
      }
    }
  }

  send(toId: string, message: string) {
    if (!this.peers.has(toId)) {
      throw new Error(`Unknown target: ${toId}`);
    }
    this.peers.get(toId).send(message);
  }

  static askNumber = 0;
  ask(toId: string, message: string): Promise<string> {
    const askNumber = PeerGroup.askNumber;
    ++PeerGroup.askNumber;
    return new Promise((resolve, reject) => {
      this.replyCallbacks.set(`${askNumber}`, resolve as AnswerRecieverFn);
      this.send(toId, `ask:${askNumber}:${message}`);
    });
  }

  addAnswer(name: string, f: AnswerCallbackFn): void {
    this.answerCallbacks.set(name, f);
  }

  addCallback(name: string, f: CallbackFn) {
    Log.debug(`AAAAA addCallback (${this.id}) '${name}'`);
    this.namedCallbacks.set(name, f);
  }

  addListener(f: CallbackFn) {
    if (this.anonymousCallbacks.length > 0) {
      throw new Error("Why do we have multiple listeners?");
    }
    this.anonymousCallbacks.push(f);
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

  private async handleData(fromId: string, data: string) {
    Log.debug(`AAAAA (${this.id}): handleData(${fromId}, ${data})`);
    if (!this.peers.has(fromId)) {
      this.conn.connect(fromId);
    }
    const match = data.match(/^([^:]+):(.*)$/);
    if (match) {
      const name = match[1];
      const message = match[2];
      Log.debug(`AAAAA: callback (${this.id}) '${name}'`);
      if (this.namedCallbacks.has(name)) {
        const fn = this.namedCallbacks.get(name);
        Log.debug(`AAAAA callback (${this.id}) ${name}(${message})`);
        fn(fromId, message);
        return;
      }
    }
    Log.debug(`AAAAA: (${this.id}) no named callback for '${data}'; ` +
      `${this.anonymousCallbacks.length}`)
    for (const cb of this.anonymousCallbacks) {
      cb(fromId, data);
    }
  }
}