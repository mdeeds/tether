import { threadId } from "worker_threads";
import { DataConnectionInterface, PeerInterface } from "./peerInterface";

type DataCallbackFn = (data: string) => void;

/**
 * Only used externally as DataConnectionInterface.  We don't export this class.
 */
class LocalDataConnection implements DataConnectionInterface {
  peer: string;
  open: boolean = false;
  openCallbacks: Function[] = [];  // These are () => void;
  dataCallbacks: DataCallbackFn[] = [];
  constructor(id: string) {
    this.peer = id;
    setTimeout(() => { this.runOpen(); }, 0);
  }

  on(evType: string, callback: Function) {
    switch (evType) {
      case 'open':
        this.openCallbacks.push(callback);
        break;
      case 'data':
        this.dataCallbacks.push(callback as DataCallbackFn);
        break;
      default:
        throw new Error(`Not implemented: ${evType}`);
    }
  }

  private runOpen() {
    this.open = true;
    for (const cb of this.openCallbacks) {
      cb();
    }
  }

  send(message: string) {
    for (const cb of this.dataCallbacks) {
      cb(message);
    }
  }
}

class LocalDataConnnectionPair {
  readonly source: DataConnectionInterface;
  readonly target: DataConnectionInterface;
  constructor(sourceId: string, targetId: string) {
    this.source = new LocalDataConnection(sourceId);
    this.target = new LocalDataConnection(targetId);
    this.source.on('data', (message: string) => { this.target.send(message); });
  }
}

type ConnectionCallbackFn = (dataConnection: DataConnectionInterface) => void;
type OpenCallbackFn = (id: string) => void;
export class LocalPeer implements PeerInterface {

  private static allPeers: Map<string, LocalPeer> =
    new Map<string, LocalPeer>();


  id: string = `id${Math.random()}`

  private connectionCallbacks: ConnectionCallbackFn[] = [];
  private openCallbacks: OpenCallbackFn[] = [];

  constructor() {
    setTimeout(() => {
      LocalPeer.allPeers.set(this.id, this);
      for (const cb of this.openCallbacks) {
        cb(this.id);
      }
    })
  }

  on(evType: string, callback: Function) {
    switch (evType) {
      case 'open':
        this.openCallbacks.push(callback as OpenCallbackFn);
        break;
      case 'connection':
        this.connectionCallbacks.push(callback as ConnectionCallbackFn);
        break;
      case 'disconnected':
        // Never happens.
        break;
      default:
        throw new Error(`Not implemented: ${evType}`);
    }
  }

  reconnect() {
    throw new Error(`Implementation error.  This should never happen.`);
  }

  connect(to: string) {
    const connectionPair = new LocalDataConnnectionPair(to, this.id);

    if (!LocalPeer.allPeers.has(to)) {
      throw new Error(`Unknown peer: ${to}`);
    }
    for (const connectionCallback of
      LocalPeer.allPeers.get(to).connectionCallbacks) {
      setTimeout(() => { connectionCallback(connectionPair.target); }, 0);
      // TODO: doesn't this need to be a property of this?
    }
    return connectionPair.source;
  }
}