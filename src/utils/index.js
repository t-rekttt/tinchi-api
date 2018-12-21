var request = require('request-promise');
const cheerio = require('cheerio');
var moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
moment.locale('vi-VN');
const period_board = require('../period_board.js');

request = request.defaults({
  transform(body) {
    let $ = cheerio.load(body);
    let err_text = $('#lblErrorInfo').text();
    if (err_text && err_text.trim()) throw err_text;

    return $;
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  },
  jar: true
});

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

parseSelector = ($) => {
  let data = {};
  let form = $('form');
  let select = form.find('select');

  select.each((i, elem) => {
    let options = $(elem).find($('option'));
    let cooked_options = [];

    options.each((i, option) => {
      option = $(option);

      cooked_options.push({
        value: option.attr('value'),
        text: option.text(),
        selected: option.attr('selected') ? true : false
      });
    });

    data[$(elem).attr('name')] = cooked_options;
  });

  return data;
}

module.exports = { request, parseSelector, parseInitialFormData }