export type MessageCallback = (message: string) => void;
export type AskCallback = (from: string, message: string) => Promise<string>;

export interface Comms {
  sendMessage(from: string, message: string): void;
  addListener(to: string, callback: MessageCallback): void;
  addReply(to: string, callback: AskCallback): void;
  ask(from: string, to: string, message: string): Promise<string>;
}