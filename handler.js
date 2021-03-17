const sharp = require('sharp');
const Joi = require('joi');
const superagent = require('superagent');
const winston = require('winston');

/* eslint-disable newline-per-chained-call */
const resizeSchema = Joi.object()
  .keys({
    width: Joi.number().positive().max(1024).integer().required(),
    height: Joi.number().positive().max(1024).integer().required(),
    image: Joi.string().base64(),
    imageUrl: Joi.string().uri(),
    format: Joi.string().allow('png').required(),
  })
  .nand('image', 'imageUrl');

const getLogger = (category) => {
  const options = {
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label: category }),
      winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
      }),
    ),
    transports: [new winston.transports.Console({ level: 'info' })],
  };
  const logger = winston.loggers.get(category, options);
  return logger;
};

const logger = getLogger('img-processing');

const transformImage = async (buffer, width, height, format) => {
  try {
    const data = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toFormat(format)
      .toBuffer();
    return {
      resizedImage: data.toString('base64'),
    };
  } catch (e) {
    logger.error(`Fail to transform image: ${e.message}`);
    return {
      error: e.message,
    };
  }
};

// eslint-disable-next-line import/prefer-default-export
const resize = async (event) => {
  const { payload } = event;

  const validationResult = resizeSchema.validate(payload);
  const { error } = validationResult;
  if (error) {
    const { message } = error.details[0];
    logger.error(`Fail to validate input: ${message}`);
    return {
      error: message,
    };
  }

  const { width, height, format, image, imageUrl } = payload;

  let buf;
  if (imageUrl) {
    try {
      const response = await superagent.get(imageUrl).buffer(true);
      const { body } = response;
      buf = body;
    } catch (e) {
      logger.error(`Fail to fetch image at ${imageUrl}: ${e.message}`);
      return {
        error: e.message,
      };
    }
  } else if (image) {
    buf = Buffer.from(image.trim(), 'base64');
  }

  const result = await transformImage(buf, width, height, format);
  logger.info(
    `Resize successful (width:${width} - height:${height} - format:${format} - source:${
      imageUrl || 'encoded'
    }): ${JSON.stringify(result)}`,
  );
  return result;
};

exports.resize = resize;
