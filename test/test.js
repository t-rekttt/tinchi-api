let assert = require('assert');
let { tlu, tluNew } = require('../index.js').thuyloi;
let { MemoryCookieStore } = require('tough-cookie');

let { ma_sv, password } = process.env;
let { username, password_new } = process.env;

const drpSemester = '3405451fd482446a96baaae42060a689';
const drpHK = '2018_2019_2';

describe('tluOld', () => {
  describe('login', () => {
    it('should success on right password', async() => {
      let jar = new MemoryCookieStore();

      await assert.doesNotReject(async() => {
        return await tlu.login(ma_sv, password, { jar });
      });

      describe('getTkb', () => {
        it('should be able to get', async() => {
          let tkb = await tlu.getTkb({ drpSemester }, { jar });
          assert(tkb.data && tkb.data.length);
          assert(tkb.options);

          describe('parseTkb', () => {
            it('should be able to parse', () => {
              let parsed = tlu.parseTkb(tkb.data);
              assert(parsed && parsed.length);
            });
          });
        });

        it('should be able to get without semester', async() => {
          let tkb = await tlu.getTkb(null, { jar });
          assert(tkb.data && tkb.data.length);
          assert(tkb.options);
        });
      });

      describe('getTkbDkh', () => {
        it('should be able to get', async() => {
          let tkb = await tlu.getTkbDkh({ jar });
          assert(tkb.data && tkb.data.length);
          assert(tkb.options);

          describe('parseTkbDkh', () => {
            it('should be able to parse', () => {
              let parsed = tlu.parseTkbDkh(tkb.data);
              assert(parsed && parsed.length);
            });
          });
        });
      });

      describe('getExamList', () => {
        it('should be able to get', async() => {
          let examList = await tlu.getExamList({ drpSemester }, { jar });
          assert(examList.data && examList.data.length);
          assert(examList.options);

          describe('parseExamList', () => {
            it('should be able to parse', () => {
              let parsed = tlu.parseExamList(examList.data);
              assert(parsed && parsed.length);
            });
          });
        });

        it('should be able to get without semester', async() => {
          let examList = await tlu.getExamList(null, { jar });
          assert(examList.data && examList.data.length);
          assert(examList.options);
        });
      });

      describe('getStudentMark', () => {
        it('should be able to get', async() => {
          let studentMark = await tlu.getStudentMark({ drpHK },{ jar });
          assert(studentMark.data && studentMark.data.length);
          assert(studentMark.options);

          describe('parseStudentMark', () => {
            it('should be able to parse', () => {
              let parsed = tlu.parseStudentMark(studentMark.data);
              assert(parsed && parsed.length);
            });
          });
        });
      });
    });

    it('should reject wrong password', async() => {
      await assert.rejects(async() => {
        let jar = new MemoryCookieStore();
        return await tlu.login(ma_sv, password + '1');
      });
    });
  });
});

describe('tluNew', () => {
  describe('login', () => {
    it('should success on right password', async() => {
      let student = new tluNew(username, password_new);

      await assert.doesNotReject(async() => {
        return await student.doLogin();
      });

      describe('getCurrentUser', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getSemesters', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getCourseHour', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getSchoolYears', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getStudentCourseSubjects', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getSemesterWithFullsub', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });

      describe('getCurrentSemesterInfo', async() => {
        it('should be able to get', async() => {
          let data = await student.getCurrentUser();

          assert(data);
        });
      });
    });

    it('should reject wrong password', async() => {
      let student = new tluNew(username, password_new + '1');

      await assert.rejects(async() => {
        return await student.doLogin();
      });
    });
  });
});