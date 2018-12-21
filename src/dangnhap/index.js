require('dotenv').config();
var { request, parseInitialFormData } = require('../utils');
const md5 = require('md5');

init = (options = {}) => {
  let jar = request.jar();

  return request(process.env.API, {
    ...options,
    jar
  })
  .then(res => jar);
}

login = (username, password, options = {}) => {
  if (!options.shouldNotEncrypt) {
    password = md5(password);
    delete options.shouldNotEncrypt;
  }

  let endpoint = `${process.env.API}/login.aspx`
  return init()
    .then(() => request(endpoint, options)) 
    .then(parseInitialFormData)
    .then(data => {
      return {
        ...data,
        txtUserName: username,
        txtPassword: password,
      }
    })
    .then(form => {
      return request.post(endpoint, {form, simple: false});
    })
    // .then($ => {
    //   let name = $('#PageHeader1_lblUserFullName').text();

    //   return name;
    // });
}

module.exports = { login }