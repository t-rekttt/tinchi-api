var request = require('request-promise');
const cheerio = require('cheerio');
const md5 = require('md5');
const API = 'http://dangky.tlu.edu.vn/CMCSoft.IU.Web.Info';
var moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
moment.locale('vi-VN');
const period_board = require('./periodBoard.js');

request = request.defaults({
  transform(body) {
    let $ = cheerio.load(body);
    err_text = $('#lblErrorInfo').text();
    if (err_text && err_text.trim()) throw err_text;

    return $;
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Accept-Encoding': 'gzip, deflate, br'
  },
  agentOptions: {
    secureProtocol: 'TLSv1_method'
  }
  // proxy: 'http://localhost:8080',
  // strictSSL: false
});

init = async(options = {}) => {
  let jar = request.jar();

  await request(API+'/', {
    ...options,
    jar
  });

  return jar;
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

    let cooked_options = options.toArray().map(option => {
      option = $(option);

      return {
        value: option.attr('value'),
        text: option.text(),
        selected: option.attr('selected') ? true : false
      };
    });

    data[$(elem).attr('name')] = cooked_options;
  });

  return data;
}

login = async(username, password, options = {}) => {
  if (!options.shouldNotEncrypt) {
    password = md5(password);
    delete options.shouldNotEncrypt;
  }

  let endpoint = `${API}/Login.aspx`;

  let res = await request(endpoint, options);

  let data = parseInitialFormData(res);

  let form = {
    ...data,
    txtUserName: username,
    txtPassword: password,
  };

  return await request.post(endpoint, {form, simple: false, ...options});
}

getTkbDkh = async(options = {}) => {
  let endpoint = `${API}/StudyRegister/StudyRegister.aspx`;

  let $ = await request.get(endpoint, options);

  if (!options) options = parseSelector($);

  initialFormData = parseInitialFormData($);

  delete initialFormData.btnView;

  let tkb = $('#Table4').find('.tableborder');

  tkb.find('br').replaceWith('\n');

  let rows = tkb.find('tr');

  let res = rows.toArray().map(elem => {
    cols = $(elem).find('td');

    return cols.toArray().map(elem1 => {
      return $(elem1).text().trim();
    });
  });

  return { data: res, options: parseSelector($) };
}

parseTkbDkh = (data, options = {}) => {
  data = data.slice(1, data.length-1);

  data = data.map(rows => {
    rows = rows.map(cell => {
      let cells = cell.split('\n');

      cells = cells.map(item => item.trim());

      if (cells.length === 1) cells = cells[0];

      return cells;
    });

    let [stt, huy, lop_hoc_phan, hoc_phan, thoi_gian, dia_diem, giang_vien, si_so, da_dk, so_tc, hoc_phi, ghi_chu] = rows;

    return {lop_hoc_phan, hoc_phan, thoi_gian, dia_diem, giang_vien, si_so, da_dk, so_tc, hoc_phi, ghi_chu}
  });

  const date_range_pattern = /(.+?) đến (.+?):( \((.{1,}?)\))?/;
  const time_pattern = /Thứ ([0-9]) tiết ([0-9,]+?) \((.+?)\)/g;

  data = data.map(subject => {
    let ranges = [];
    let khoang_thoi_gian = subject.thoi_gian
      .map(tg => tg.trim())
      .join('|')
      .split('Từ ')
      .filter(a => a)

    let matches = date_range_pattern.exec(khoang_thoi_gian[0]);

    if (matches) {
      let phases = [];

      let [orig, start, end, g3, phase] = matches;
      var match1;

      do {
        match1 = time_pattern.exec(khoang_thoi_gian);

        if (match1) {
          let [orig1, day, periods, type] = match1;

          periods = periods.split(',');

          phases.push({
            day,
            periods,
            type
          });
        };
      } while (match1);

      ranges.push({
        start,
        end,
        phases,
        phase
      });
    }

    subject.thoi_gian = subject.thoi_gian.join('\n');
    return {...subject, ranges};
  });

  return data;
}

getTkb = async(data = null, options = {}, initialFormData = null) => {
  let endpoint = `${API}/Reports/Form/StudentTimeTable.aspx`;

  let $ = null;

  if (!initialFormData) {
    $ = await request.get(endpoint, options);

    if (!options) options = parseSelector($);

    initialFormData = parseInitialFormData($);

    delete initialFormData.btnView;
  }

  $ = await request.post(endpoint, {
    ...options,
    form: {
      ...initialFormData,
      ...data
    }
  });

  let tkb = $('#Table4').find('.tableborder');

  tkb.find('br').replaceWith('\n');

  let rows = tkb.find('tr');

  let res = rows.toArray().map(elem => {
    cols = $(elem).find('td');

    return cols.toArray().map(elem1 => {
      return $(elem1).text().trim();
    });
  });

  return { data: res, options: parseSelector($) };
}

parseTkb = (data) => {
  data = data.slice(1, data.length - 1);

  data = data.map(rows => {
    rows = rows.map(cell => {
      let cells = cell.split('\n');

      cells = cells.map(item => item.trim());

      if (cells.length === 1) cells = cells[0];

      return cells;
    });

    let [stt, lop_hoc_phan, hoc_phan, thoi_gian, dia_diem, si_so, da_dk, so_tc, hoc_phi, ghi_chu] = rows;

    return {lop_hoc_phan, hoc_phan, thoi_gian, dia_diem, si_so, da_dk, so_tc, hoc_phi, ghi_chu}
  });

  const date_range_pattern = /(.+?) đến (.+?):( \((.{1,}?)\))?/;
  const time_pattern = /Thứ ([0-9]) tiết ([0-9,]+?) \((.+?)\)/g;
  const location_pattern = /\(([0-9])+\)\n(.+)/g;

  data = data.map(subject => {
    let ranges = [];
    let khoang_thoi_gian = subject.thoi_gian
      .map(tg => tg.trim())
      .join('|')
      .split('Từ ')
      .filter(a => a);

    for (thoi_gian of khoang_thoi_gian) {
      let matches = date_range_pattern.exec(thoi_gian);

      if (!matches) continue;

      let phases = [];

      let [orig, start, end, g3, phase] = matches;
      var match1;

      do {
        match1 = time_pattern.exec(thoi_gian);

        if (match1) {
          let [orig1, day, periods, type] = match1;

          periods = periods.split(',');

          phases.push({
            day,
            periods,
            type
          });
        };
      } while (match1);

      ranges.push({
        start,
        end,
        phases,
        phase
      });
    };

    subject.thoi_gian = subject.thoi_gian.join('\n');

    let locations = {};

    if (Array.isArray(subject.dia_diem)) {
      subject.dia_diem = subject.dia_diem.join('\n');

      var match;

      do {
        matches = location_pattern.exec(subject.dia_diem);

        if (matches) {
          let [orig, phase, location] = matches;

          locations[phase] = {
            phase,
            location
          }
        };
      } while (matches);
    }

    return {...subject, ranges, locations};
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

  for (subject of schedule) {
    for (range of subject) {
      for (phase of range.phases) {
        let timestamps = generateClasses(generateTimestamps(parseDate(range.start), parseDate(range.end), parseInt(phase.day)-2), parseInt(phase.periods[0]), parseInt(phase.periods[phase.periods.length-1]));

        for (timestamp of timestamps) {
          let data = {
            timestamp,
            ...subject,
            phase: range.phase,
            type: phase.type
          };

          delete data.ranges;

          timeline.push(data);
        };
      };
    };
  };

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

getStudentMark = async(data = null, options = {}, initialFormData = null) => {
  let endpoint = `${API}/StudentMark.aspx`;

  let $ = null;

  if (!initialFormData) {
    $ = await request.get(endpoint, options);

    if (!options) options = parseSelector($);

    initialFormData = parseInitialFormData($);

    delete initialFormData.btnView;
  }

  $ = await request.post(endpoint, {
    ...options,
    form: {
      ...initialFormData,
      ...data
    }
  });

  let tkb = $('#tblMarkDetail').find('.tableborder');

  tkb.find('br').replaceWith('\n');

  let rows = tkb.find('tr');

  let res = rows.toArray().map(elem => {
    let cols = $(elem).find('td');

    return cols.toArray().map(elem1 => {
      return $(elem1).text().trim();
    });
  });

  return { data: res, options: parseSelector($) };
}

parseStudentMark = (data) => {
  data = data.slice(1, data.length - 1);

  data = data.map(rows => {
    rows = rows.map(cell => {
      let cells = cell.split('\n');

      cells = cells.map(item => item.trim());

      if (cells.length === 1) cells = cells[0];

      return cells;
    });

    let [stt, ma_hoc_phan, ten_hoc_phan, so_tin_chi, lan_hoc, lan_thi, diem_thu, la_diem_tong_ket_mon, danh_gia, ma_sinh_vien, qua_trinh, thi, tkhp, diem_chu] = rows;

    return {stt, ma_hoc_phan, ten_hoc_phan, so_tin_chi, lan_hoc, lan_thi, diem_thu, la_diem_tong_ket_mon, danh_gia, ma_sinh_vien, qua_trinh, thi, tkhp, diem_chu}
  });

  return data;
}

getExamList = async(data = null, options = {}, initialFormData = null) => {
  let endpoint = `${API}/StudentViewExamList.aspx`;

  let $ = null;

  if (!initialFormData) {
    $ = await request.get(endpoint, options);

    if (!options) options = parseSelector($);

    initialFormData = parseInitialFormData($);

    delete initialFormData.btnView;
  }

  $ = await request.post(endpoint, {
    ...options,
    form: {
      ...initialFormData,
      ...data
    }
  });

  initialFormData = parseInitialFormData($);

  let tkb = $('#tblCourseList').find('tbody');

  tkb.find('br').replaceWith('\n');

  let rows = tkb.find('tr');

  let res = rows.toArray().map(elem => {
    cols = $(elem).find('td');

    return cols.toArray().map(elem1 => {
      return $(elem1).text().replace(/[\t\n]/g, '').trim();
    });
  });

  return { data: res, options: parseSelector($), initialFormData };
}

parseExamList = (data) => {
  data = data.slice(1, data.length - 1);

  data = data.map(rows => {
    rows = rows.map(cell => {
      let cells = cell.split('\n');

      cells = cells.map(item => item.trim());

      if (cells.length === 1) cells = cells[0];

      return cells;
    });

    let [stt, ma_hoc_phan, ten_hoc_phan, so_tin_chi, ngay_thi, ca_thi, hinh_thuc_thi, so_bao_danh, phong_thi, ghi_chu] = rows;

    return {stt, ma_hoc_phan, ten_hoc_phan, so_tin_chi, ngay_thi, ca_thi, hinh_thuc_thi, so_bao_danh, phong_thi, ghi_chu}
  });

  return data;
}

module.exports = { init, request, login, getTkbDkh, parseTkbDkh, getTkb, parseTkb, parseSelector, parseInitialFormData, generateTimeline, groupTimelineByDay, getStudentMark, parseStudentMark, getExamList, parseExamList }