const { allowedMetricNames } = require("../contants");

const parseAndValidateMessage = (message) => {
  try {
    const parsedMessage = JSON.parse(message);
    const { chain_id, address, metric_name = null } = parsedMessage;

    const errors = [];
    const data = { chain_id, address, metric_name };

    if (typeof chain_id !== "string" || typeof address !== "string") {
      errors.push("Invalid message values");
      return { errors, data };
    }

    if (typeof metric_name === "string" && !allowedMetricNames.includes(metric_name)) {
      errors.push("Invalid metric_name");
      console.error("Invalid metric_name");
      return { errors, data };
    }

    return { data, errors };
  } catch (error) {
    console.error("Error parsing or validating message:", error.message);
    return null;
  }
};

module.exports = {
  parseAndValidateMessage,
};
