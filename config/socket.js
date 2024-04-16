require("dotenv/config");
const { WebSocketServer, WebSocket } = require("ws");
const { getSelectedKeysForNft } = require("../contants");
const { parseAndValidateMessage } = require("../utils/helpers");
const { findByChainIdAndAddress } = require("../controllers/nft.controller");
const validateSocketApiKeyMiddleware = require("../middlewares/socketApiKeyValidator");

const clients = {
  rooms: {},
};

/**
 * Adds a WebSocket connection to a specific room.
 * @param {WebSocket} ws The WebSocket connection to add.
 * @param {string} roomId The ID of the room to add the WebSocket to.
 */
const addSocketToRoom = (ws, roomId) => {
  if (!roomId) {
    console.log("No roomId passed");
    return;
  }

  const rooms = clients.rooms;

  if (!rooms[roomId]) {
    rooms[roomId] = [ws];
  } else if (!rooms[roomId].includes(ws)) {
    rooms[roomId].push(ws);
  }

  console.log("Client added: ", rooms[roomId].length);
};

/**
 * Removes a WebSocket connection from a specific room.
 * @param {WebSocket} ws The WebSocket connection to remove.
 * @param {string} roomId The ID of the room to remove the WebSocket from.
 */
const removeSocketFromRoom = (ws, roomId) => {
  const rooms = clients.rooms;

  const idx = rooms[roomId].indexOf(ws);
  if (idx >= 0) {
    rooms[roomId].splice(idx, 1);
    if (rooms[roomId].length === 0) {
      delete rooms[roomId];
    }
  }

  console.log("Client removed: ", rooms[roomId].length);
  return;
};

/**
 * Broadcasts a message to all connected WebSocket clients.
 * @param {WebSocketServer} wss The WebSocket server instance.
 * @param {string} response The message to broadcast.
 * @param {boolean} isBinary Whether the message is binary.
 */
const broadcastToAll = (wss, response, isBinary) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response, { binary: isBinary });
    }
  });
  return;
};

/**
 * Broadcasts a message to all WebSocket clients in a specific room.
 * @param {string} roomId The ID of the room to broadcast the message to.
 * @param {string} response The message to broadcast.
 * @param {boolean} isBinary Whether the message is binary.
 */
const broadcastToRoom = (roomId, response, isBinary) => {
  const rooms = clients.rooms;
  rooms[roomId].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response, { binary: isBinary });
    }
  });

  return;
};

/**
 * Handles errors that occur before a WebSocket upgrade.
 * @param {Error} error The error that occurred.
 */

const preSocketUpgradeError = (error) => {
  console.log("Pre Socket Upgrade Error - ", error);
};

/**
 * Handles errors that occur after a WebSocket upgrade.
 * @param {Error} error The error that occurred.
 * @param {WebSocketServer} wss The WebSocket server instance.
 */
const postSocketUpgradeError = (error, wss) => {
  broadcastToAll(wss, JSON.stringify({ error: "Some error occurred" }), true);
  console.log("Post Socket Upgrade Error - ", error);
};

/**
 * Handles the WebSocket 'close' event.
 * @param {number} code The close code.
 * @param {string} reason The reason for closing.
 */
const handleOnClose = (code, reason) => {
  console.log("socket closed ", code, "-", reason);
};

/**
 * Builds a response message based on the received WebSocket message.
 * @param {Buffer} data The message data received from the WebSocket.
 * @returns {Promise<Object>} A Promise that resolves to the response message.
 */
const buildResponseOnMessage = async (data) => {
  const message = data.toString("utf-8");

  const parsedData = parseAndValidateMessage(message);

  if (!parsedData) {
    return { data: JSON.stringify({ error: "Error validating message." }) };
  }

  if (parsedData && parsedData.errors && parsedData.errors.length) {
    return { data: JSON.stringify({ error: parsedData.errors[0] }) };
  }

  const { chain_id, address, metric_name } = parsedData.data;

  const doc = await findByChainIdAndAddress(chain_id, address, getSelectedKeysForNft(metric_name));

  if (!doc) {
    return { data: JSON.stringify({ error: "No document found" }) };
  }

  const response = metric_name ? { metric_name: metric_name, value: doc[metric_name] } : doc;

  return { data: JSON.stringify(response) };
};

/**
 * Configures WebSocket connections for the given HTTP server.
 * @param {http.Server} server The HTTP server to upgrade to WebSocket connections.
 */
const configureSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    socket.on("error", preSocketUpgradeError);

    validateSocketApiKeyMiddleware(req, socket);

    wss.handleUpgrade(req, socket, head, (ws) => {
      socket.removeListener("error", preSocketUpgradeError);
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req) => {
    ws.on("error", postSocketUpgradeError);

    const url = new URL(req.url, `ws://${req.headers.host}`);

    const paths = url.pathname.split("/").filter((x) => x);
    console.log(paths);

    if (paths.length >= 1 && paths[0] === "room") {
      addSocketToRoom(ws, paths[1]);
    }

    ws.on("message", async (data, isBinary) => {
      try {
        const response = await buildResponseOnMessage(data);

        if (paths.length >= 1 && paths[0] === "room") {
          broadcastToRoom(paths[1], response.data, isBinary);
        } else {
          broadcastToAll(wss, response.data, isBinary);
        }
      } catch (error) {
        console.log(error);
        if (paths.length >= 1 && paths[0] === "room") {
          broadcastToRoom(
            paths[1],
            JSON.stringify({ error: "Some error occurred while handlding message" }),
            isBinary
          );
        } else {
          broadcastToAll(
            wss,
            JSON.stringify({ error: "Some error occurred while handlding message" }),
            isBinary
          );
        }
      }
    });

    ws.on("close", (code, reason) => {
      handleOnClose(code, reason);
      if (paths.length >= 1 && paths[0] === "room") {
        removeSocketFromRoom(ws, paths[1]);
      }
    });
  });
};

module.exports = configureSocket;
