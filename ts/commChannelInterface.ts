export type MessageCallback = (message: string) => void;
export type AskCallback = (message: string) => Promise<string>;

export interface CommChannelInterface {
  /**
   * Sends a message to all known listeners.  Does not send the message
   * back to the one sending the message.
   * @param message Message to send.  Raw text or binary data string.
   */
  sendMessage(message: string): void;

  /**
   * Called for every message recieved.
   * @param callback Callback to call on the listener
   */
  addListener(callback: MessageCallback): void;

  /**
   * Also called for every message.
   * @param callback Callback to call on the listener
   */
  addReply(callback: AskCallback): void;

  /**
   * 
   * @param to Id of the target of the message
   * @param message Message to send
   * @returns Promise with response from the `from` id specified.
   */
  ask(to: string, message: string): Promise<string>;
}