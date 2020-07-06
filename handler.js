const sharp = require("sharp");
const Joi = require("@hapi/joi");
const httpclient = require("request");

/* eslint-disable newline-per-chained-call */
const resizeSchema = Joi.object()
  .keys({
    width: Joi.number().positive().max(1024).integer().required(),
    height: Joi.number().positive().max(1024).integer().required(),
    image: Joi.string().base64(),
    imageUrl: Joi.string().uri(),
    format: Joi.string().allow("png").required(),
  })
  .nand(["image", "imageUrl"]);

const makeResponse = (statusCode, result) => {
  let body = "";
  if (result) {
    body = JSON.stringify(result);
  }
  const response = {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body,
  };

  return response;
};

const transformImage = (buffer, width, height, format, callback) =>
  sharp(buffer)
    .resize(width, height)
    .max()
    .toFormat(format)
    .toBuffer((err, data) => {
      if (err) {
        return callback(null, makeResponse(500, { message: err.message }));
      }
      return callback(
        null,
        makeResponse(200, { resized: data.toString("base64") })
      );
    });

const resize = (event, context, callback) => {
  const request = JSON.parse(event.body);

  const validationResult = Joi.validate(request, resizeSchema);
  const { error } = validationResult;
  if (error) {
    const { message } = error.details[0];
    return callback(null, makeResponse(500, { message }));
  }

  const { width, height, format, image, imageUrl } = request;

  if (imageUrl) {
    return httpclient(
      { uri: imageUrl, method: "GET", encoding: null },
      (err, resp, buffer) => {
        if (err) {
          return callback(null, makeResponse(500, { message: err.message }));
        }
        return transformImage(buffer, width, height, format, callback);
      }
    );
  }

  const buf = Buffer.from(image.trim(), "base64");
  return transformImage(buf, width, height, format, callback);
};

exports.resize = resize;
