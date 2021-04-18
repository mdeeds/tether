export type MessageCallback = (message: string) => void;
export type AskCallback = (from: string, message: string) => Promise<string>;

export interface CommChannelInterface {
  /**
   * Sends a message to all known listeners.  Does not send the message
   * back to the one sending the message.
   * @param from Id of the source of the message.
   * @param message Message to send.  Raw text or binary data string.
   */
  sendMessage(from: string, message: string): void;

  /**
   * 
   * @param to Id of the listener
   * @param callback Callback to call on the listener
   */
  addListener(to: string, callback: MessageCallback): void;

  /**
   * 
   * @param to Id of the listener
   * @param callback Callback to call on the listener
   */
  addReply(to: string, callback: AskCallback): void;

  /**
   * 
   * @param from Id of the source of the message
   * @param to Id of the target of the message
   * @param message Message to send
   * @returns Promise with response from the `from` id specified.
   */
  ask(from: string, to: string, message: string): Promise<string>;
}