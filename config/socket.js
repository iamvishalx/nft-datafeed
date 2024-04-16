require("dotenv/config");
const { WebSocketServer, WebSocket } = require("ws");
const { getSelectedKeysForNft } = require("../contants");
const { parseAndValidateMessage } = require("../utils/helpers");
const { findByChainIdAndAddress } = require("../controllers/nft.controller");
const validateSocketApiKeyMiddleware = require("../middlewares/socketApiKeyValidator");

const clients = {
  rooms: {},
};

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

const broadcastToAll = (wss, response, isBinary) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response, { binary: isBinary });
    }
  });
  return;
};

const broadcastToRoom = (roomId, response, isBinary) => {
  const rooms = clients.rooms;
  rooms[roomId].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(response, { binary: isBinary });
    }
  });

  return;
};

const preSocketUpgradeError = (error) => {
  console.log("Pre Socket Upgrade Error - ", error);
};

const postSocketUpgradeError = (error, wss, ws) => {
  sendClient(wss, ws, JSON.stringify({ error: "Some error occurred" }));
  console.log("Post Socket Upgrade Error - ", error);
};

const handleOnClose = (code, reason) => {
  console.log("socket closed ", code, "-", reason);
};

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
