require("dotenv/config");
const { WebSocketServer, WebSocket } = require("ws");
const { getSelectedKeysForNft } = require("../contants");
const url = require("url");
const { parseAndValidateMessage } = require("../utils/helpers");
const { findByChainIdAndAddress } = require("../controllers/nft.controller");
const validateSocketApiKeyMiddleware = require("../middlewares/socketApiKeyValidator");

const sendClient = (wss, ws, response, isBinary) => {
  wss.clients.forEach((client) => {
    if (ws === client && client.readyState === WebSocket.OPEN) {
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

const handleOnMessage = async (wss, ws, data, isBinary) => {
  const message = data.toString("utf-8");

  const parsedData = parseAndValidateMessage(message);

  if (!parsedData) {
    sendClient(wss, ws, JSON.stringify({ error: "Error validating message." }), isBinary);
    return;
  }

  if (parsedData && parsedData.errors && parsedData.errors.length) {
    sendClient(wss, ws, JSON.stringify({ error: parsedData.errors[0] }), isBinary);
    return;
  }

  const { chain_id, address, metric_name } = parsedData.data;

  const doc = await findByChainIdAndAddress(chain_id, address, getSelectedKeysForNft(metric_name));

  if (!doc) {
    sendClient(wss, ws, JSON.stringify({ error: "No document found" }), isBinary);
    return;
  }

  const response = metric_name ? { metric_name: metric_name, value: doc[metric_name] } : doc;

  sendClient(wss, ws, JSON.stringify(response), isBinary);
  return;
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

    ws.on("message", async (data, isBinary) => {
      try {
        await handleOnMessage(wss, ws, data, isBinary);
      } catch (error) {
        console.log(error);
        sendClient(
          wss,
          ws,
          JSON.stringify({ error: "Some error occurred while handlding message" })
        );
      }
    });

    ws.on("close", (code, reason) => {
      console.log("inside - close");
      console.log("socket closed ", code, "-", reason);
    });
  });
};

module.exports = configureSocket;
