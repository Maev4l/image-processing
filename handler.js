const sharp = require('sharp');
const Joi = require('joi');

/* eslint-disable newline-per-chained-call */
const resizeSchema = Joi.object().keys({
  width: Joi.number().positive().max(1024).integer().required(),
  height: Joi.number().positive().max(1024).integer().required(),
  image: Joi.string().base64().required(),
  format: Joi.string().allow('png').required(),
});

const makeResponse = (statusCode, result) => {
  let body = '';
  if (result) {
    body = JSON.stringify(result);
  }
  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body,
  };

  return response;
};


const resize = (event, context, callback) => {
  const request = JSON.parse(event.body);

  const validationResult = Joi.validate(request, resizeSchema);
  const { error } = validationResult;
  if (error) {
    const { message } = error.details[0];
    return callback(null, makeResponse(500, { message }));
  }

  const {
    id, width, height, format, image,
  } = request;

  const buf = Buffer.from(image.trim(), 'base64');

  return sharp(buf).resize(width, height)
    .max()
    .toFormat(format)
    .toBuffer((err, data) => {
      if (err) {
        return callback(null, makeResponse(500, { message: err.message }));
      }
      return callback(null, makeResponse(200, {
        id,
        resized: data.toString('base64'),
      }));
    });
};


exports.resize = resize;
