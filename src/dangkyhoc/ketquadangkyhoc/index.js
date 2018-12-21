const { request, parseSelector, parseInitialFormData } = require('../../utils');

getTkbDkh = (options = {}) => {
  return request.get(`${process.env.API}/StudyRegister/StudyRegister.aspx`, options)
}

parseTkbDkh = ($, options = {}) => {
  let tkb = $('#Table4').find('.tableborder');
  tkb.find('br').replaceWith('\n');
  // console.log(tkb.html());
  let rows = tkb.find('tr');

  let data = [];

  rows.each((i, elem) => {
    cols = $(elem).find('td');

    let rows = [];

    cols.each((i, elem) => {
      rows.push($(elem).text().trim());
    }); 

    data.push(rows);
  });

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

getAndParseTkbDkh = () => {
  return getTkbDkh()
    .then($ => {
      return [parseTkbDkh($), parseSelector($), parseInitialFormData($)];
    });
}

module.exports = { getTkbDkh, parseTkbDkh, getAndParseTkbDkh }