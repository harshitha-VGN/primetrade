const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const response = { status: 'error', message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { success, error };