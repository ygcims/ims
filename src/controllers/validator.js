import Joi from "joi";

export const inputLeadValidation = (data) => {
  const schema = Joi.object({
    scheduledto: Joi.date().allow(null),
    date: Joi.date().required(),
    newest_date: Joi.date().allow(null),
    status: Joi.string().required(),
    source: Joi.string().required(),
    course: Joi.string().required().allow(null),
    batch: Joi.string().required().allow(null),
    name: Joi.string().required().allow(null),
    email: Joi.string().email().allow(null),
    contact1: Joi.string().min(10).max(10).required().allow(null),
    contact2: Joi.string().min(10).max(10).allow(null),
    dob: Joi.string().allow(null),
    gender: Joi.string().allow(null),
    nic: Joi.string().min(10).max(12).allow(null),
    passport: Joi.string().min(7).max(12).allow(null),
    school: Joi.string().allow(null),
    address: Joi.string().required().allow(null),
    comment: Joi.string().allow(null),
    assignto: Joi.number().allow(null),
  });

  return schema.validate(data);
};

export const updateLeadValidation = (data) => {
  const schema = Joi.object({
    scheduled_to: Joi.date().allow(null),
    date: Joi.date().required(),
    statusid: Joi.number().required(),
    source_id: Joi.number().required(),
    course_id: Joi.number().required().allow(null),
    batch_id: Joi.number().required().allow(null),
    name: Joi.string().required().allow(null),
    email: Joi.string().email().allow(null),
    mobile1: Joi.string().min(10).max(10).required().allow(null),
    mobile2: Joi.string().min(10).max(10).allow(null),
    dob: Joi.string().allow(null),
    gender: Joi.string().allow(null),
    nic: Joi.string().min(10).max(12).allow(null),
    passport: Joi.string().min(7).max(12).allow(null),
    school: Joi.string().allow(null),
    address: Joi.string().required().allow(null),
    userid: Joi.number().allow(null),
    fdate: Joi.date().allow(null),
    fstatus: Joi.string().allow(null),
    fcomment: Joi.string().allow(null),
    lead_id: Joi.number().allow(null),
    course_name: Joi.string().allow(null),
    batch_name: Joi.string().allow(null),
    source_name: Joi.string().allow(null),
    status_name: Joi.string().allow(null),
    duration: Joi.string().allow(null),
    leadid: Joi.number().allow(null),
    comment: Joi.string().allow(null),
    scheduled_at: Joi.date().allow(null),
    username: Joi.string().allow(null),
    id: Joi.number().allow(null),
    max_fid: Joi.number().allow(null),
  });

  return schema.validate(data);
};

export const customPasswordValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    roleid: Joi.number().required(),
    password: Joi.string()
      .min(6)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .allow(null)
      .messages({
        'string.pattern.base': 'Password must contain at least one special character, one uppercase letter, one lowercase letter, and one number',
      }),
    id: Joi.number().required(),
    profileImage: Joi.string().allow(null),
    currentPassword: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.string().allow(null).messages({
        'any.required': 'Current password is required when updating the password',
      }),
      otherwise: Joi.string().allow(null),
    }),
    rePassword: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.string().valid(Joi.ref('password')).allow(null).messages({
        'any.only': 'Re-entered password must match the password',
        'any.required': 'Re-entered password is required when updating the password',
      }),
      otherwise: Joi.string().allow(null),
    }),
  });

  return schema.validate(data);
};
