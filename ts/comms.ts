export type MessageCallback = (message: string) => void;

export interface Comms {
  sendMessage(message: string): void;
  addListener(callback: MessageCallback): void;
}