// webSocketTestUtils.js
import http from "node:http";
import createWebSocketServer from "./createWebSocketServer.js";

/**
 * @param {number} port
 * @returns {Promise<http.Server>}
 */
export function startServer(port) {
  const server = http.createServer();
  createWebSocketServer(server);

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

export class TestWebSocket extends WebSocket {
  /**
   * @param {"open" | "close"} state
   * @param {number} [timeout]
   * @returns {void | Promise<void>}
   */

  /** @type {string[]} */
  #messages = [];

  /** @param {ConstructorParameters<typeof WebSocket>} args */
  constructor(...args) {
    super(...args);

    /** @param {import("ws").MessageEvent} event */
    const addNewMessage = (event) =>
      this.#messages.push(event.data.toString("utf8"));

    this.addEventListener("message", addNewMessage);
    this.addEventListener(
      "close",
      () => this.removeEventListener("message", addNewMessage),
      { once: true }
    );
  }

  get messages() {
    return this.#messages.slice();
  }

  waitUntil(state, timeout = 1000) {
    if (this.readyState === this.OPEN && state === "open") return;
    if (this.readyState === this.CLOSED && state === "close") return;

    return new Promise((resolve, reject) => {
      /** @type {NodeJS.Timeout | undefined} */
      let timerId;
      const handleStateEvent = () => {
        resolve();
        clearTimeout(timerId);
      };

      this.addEventListener(state, handleStateEvent, { once: true });

      timerId = setTimeout(() => {
        this.removeEventListener(state, handleStateEvent);
        if (this.readyState === this.OPEN && state === "open") return resolve();
        if (this.readyState === this.CLOSED && state === "close")
          return resolve();

        reject(new Error(`WebSocket did not ${state} in time.`));
      }, timeout);
    });
  }
}
