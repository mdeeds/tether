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
    console.log(`AAAAA: 8`);
    this.open = true;
    for (const cb of this.openCallbacks) {
      cb();
    }
  }

  send(message: string) {
    console.log(`AAAAA: 11`);
    for (const cb of this.dataCallbacks) {
      console.log(`AAAAA: 12`);
      cb(message);
    }
  }
}

type ConnectionCallbackFn = (dataConnection: DataConnectionInterface) => void;
type OpenCallbackFn = (id: string) => void;
export class LocalPeer implements PeerInterface {
  id: string = `id${Math.random()}`

  private connectionCallbacks: ConnectionCallbackFn[] = [];
  private openCallbacks: OpenCallbackFn[] = [];

  constructor() {
    setTimeout(() => {
      console.log(`AAAAA: 9`);
      for (const cb of this.openCallbacks) {
        console.log(`AAAAA: 10`);
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
    const thatConnection = new LocalDataConnection(to);
    // TODO the peer on the other side of thatConnection needs
    // to get a connection event raised with this id.
    return thatConnection;
  }
}