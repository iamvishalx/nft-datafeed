const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  200: "OK",
  201: "CREATED",
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
  500: "INTERNAL_SERVER_ERROR",
};

const allowedMetricNames = ["marketcap", "assets", "floorprice"];

const getSelectedKeysForNft = (metric_name) => {
  if (metric_name) {
    return { [metric_name]: 1, _id: 0 };
  } else return { name: 1, image_url: 1, description: 1, _id: 0 };
};

module.exports = {
  HttpStatus,
  allowedMetricNames,
  getSelectedKeysForNft,
};
