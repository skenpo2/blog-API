const Joi = require('joi');

const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

const validatePost = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(150).required(),
    text: Joi.string().min(50).max(5000).required(),
    category: Joi.string()
      .valid('general', 'sport', 'entertainment', 'business', 'health')
      .required(),
    image: Joi.object({
      url: Joi.string().uri().required(),
      publicId: Joi.string().required(),
    }).optional(),
  });

  return schema.validate(data);
};

const validateEditedUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
  });

  return schema.validate(data);
};

module.exports = {
  validateRegistration,
  validateEditedUser,
  validateLogin,
  validatePost,
};
