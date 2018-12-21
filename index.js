var request = require('request-promise');
const cheerio = require('cheerio');
const md5 = require('md5');
var moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
moment.locale('vi-VN');
const period_board = require('./period_board.js');

request = request.defaults({
  transform(body) {
    let $ = cheerio.load(body);
    err_text = $('#lblErrorInfo').text();
    if (err_text && err_text.trim()) throw err_text;

    return $;
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  },
  jar: true
});

init = (options = {}, API='http://dkh.tlu.edu.vn/CMCSoft.IU.Web.info/') => {
  let jar = request.jar();

  return request(API, {
    ...options,
    jar
  })
  .then(res => jar);
}

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

parseDate = (date) => {
  return moment(date, "DD/MM/YYYY");
}

generateTimestamps = (start, end, weekday) => {
  let res = [];
  start.weekday(weekday);

  while (start.isSameOrBefore(end)) {
    if (start.isSameOrBefore(end)) {
      res.push(start.clone());
    }
    start.add(1, 'week');
  }


  return res;
}

generateClasses = (time_arr, start_period, end_period) => {
  return time_arr.map(timestamp => {
    return {
      start: timestamp.clone().hour(period_board[start_period].start.hour).minute(period_board[start_period].start.minute),
      end: timestamp.clone().hour(period_board[end_period].end.hour).minute(period_board[end_period].end.minute),
    };
  });
}

generateTimeline = (schedule) => {
  let timeline = [];

  schedule.map(subject => {
    subject.ranges.map(range => {
      range.phases.map(phase => {
        let timestamps = generateClasses(generateTimestamps(parseDate(range.start), parseDate(range.end), parseInt(phase.day)-2), parseInt(phase.periods[0]), parseInt(phase.periods[phase.periods.length-1]));

        timestamps.map(timestamp => {
          let data = {
            timestamp,
            ...subject,
            phase: range.phase,
            type: phase.type
          };

          delete data.ranges;

          timeline.push(data);
        });
      });
    });
  });

  timeline.sort((a, b) => a.timestamp.start - b.timestamp.start);
  return timeline;
}

groupTimelineByDay = (timeline) => {
  let days = {};

  timeline.map(subject => {
    let timestamp = subject.timestamp.start.clone().startOf('day');

    if (!days[timestamp]) days[timestamp] = {
      day: timestamp,
      subjects: []
    }

    days[timestamp].subjects.push(subject);
  });

  let result = Object.values(days)

  result = result.map(day => {
    if (day.day.clone().isSame(moment(), 'day')) {
      day.today = true;
    }

    return day;
  });

  return result;
}

module.exports = { init, parseSelector, parseInitialFormData, generateTimeline, groupTimelineByDay }
