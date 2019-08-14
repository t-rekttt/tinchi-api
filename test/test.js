let assert = require('assert');
let tinchi = require('../index.js');
let { MemoryCookieStore } = require('tough-cookie');

let { ma_sv, password } = process.env;
console.log(JSON.stringify(process.env));
const drpSemester = '3405451fd482446a96baaae42060a689';
const drpHK = '2018_2019_2';

describe('login', () => {
  it('should success on right password', async() => {
    let jar = new MemoryCookieStore();

    await assert.doesNotReject(async() => {
      return await tinchi.login(ma_sv, password, { jar });
    });

    describe('getTkb', () => {
      it('should be able to get', async() => {
        let tkb = await tinchi.getTkb({ drpSemester }, { jar });
        assert(tkb.data && tkb.data.length);
        assert(tkb.options);

        describe('parseTkb', () => {
          it('should be able to parse', () => {
            let parsed = tinchi.parseTkb(tkb.data);
            assert(parsed && parsed.length);
          });
        });
      });

      it('should be able to get without semester', async() => {
        let tkb = await tinchi.getTkb(null, { jar });
        assert(tkb.data && tkb.data.length);
        assert(tkb.options);
      });
    });

    describe('getTkbDkh', () => {
      it('should be able to get', async() => {
        let tkb = await tinchi.getTkbDkh({ jar });
        assert(tkb.data && tkb.data.length);
        assert(tkb.options);

        describe('parseTkbDkh', () => {
          it('should be able to parse', () => {
            let parsed = tinchi.parseTkbDkh(tkb.data);
            assert(parsed && parsed.length);
          });
        });
      });
    });

    describe('getExamList', () => {
      it('should be able to get', async() => {
        let examList = await tinchi.getExamList({ drpSemester }, { jar });
        assert(examList.data && examList.data.length);
        assert(examList.options);

        describe('parseExamList', () => {
          it('should be able to parse', () => {
            let parsed = tinchi.parseExamList(examList.data);
            assert(parsed && parsed.length);
          });
        });
      });

      it('should be able to get without semester', async() => {
        let examList = await tinchi.getExamList(null, { jar });
        assert(examList.data && examList.data.length);
        assert(examList.options);
      });
    });

    describe('getStudentMark', () => {
      it('should be able to get', async() => {
        let studentMark = await tinchi.getStudentMark({ drpHK },{ jar });
        assert(studentMark.data && studentMark.data.length);
        assert(studentMark.options);

        describe('parseStudentMark', () => {
          it('should be able to parse', () => {
            let parsed = tinchi.parseStudentMark(studentMark.data);
            assert(parsed && parsed.length);
          });
        });
      });
    });
  });

  it('should reject wrong password', async() => {
    await assert.rejects(async() => {
      let jar = new MemoryCookieStore();
      return await tinchi.login(ma_sv, password + '1');
    });
  });
});