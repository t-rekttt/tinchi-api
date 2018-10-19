var request = require('request-promise');
const cheerio = require('cheerio');
const md5 = require('md5');
const API = 'http://dkh.tlu.edu.vn';

request = request.defaults({
  transform(body) {
    let $ = cheerio.load(body);
    err_text = $('#lblErrorInfo').text();
    if (err_text && err_text.trim()) throw err_text;

    return $;
  },
  jar: true,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  }
});

init = () => request('http://dkh.tlu.edu.vn/CMCSoft.IU.Web.info/');

parseInitialFormData = ($) => {
  let form = $('form');
  let select = form.find('select');
  let input = form.find('input');

  let data = {};

  input.each((i, elem) => {
    data[$(elem).attr('name')] = $(elem).attr('value');
  });

  select.each((i, elem) => {
    data[$(elem).attr('name')] = $(elem).find($('[selected="selected"]')).attr('value');
  });

  return data;
}

login = (username, password) => {
  let endpoint = `${API}/CMCSoft.IU.Web.info/login.aspx`
  return request(endpoint)
    .then(parseInitialFormData)
    .then(data => {
      return {
        ...data,
        txtUserName: username,
        txtPassword: md5(password),
      }
    })
    .then(form => {
      return request.post(endpoint, {form, simple: false});
    })
}

module.exports = { init, login }