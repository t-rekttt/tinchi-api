let _request = require('request-promise');

const API_SERVER_URL = 'http://sinhvien.tlu.edu.vn:8099/education';

_request = _request.defaults({
  baseUrl: API_SERVER_URL,
  strictSSL: false,
  // proxy: 'http://localhost:8888',
  // strictSSL: false
});

class tluNew {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.request = _request;
  }

  async doLogin() {
    this.session = await this.login(this.username, this.password);

    this.request = _request.defaults({
      baseUrl: API_SERVER_URL + '/api',
      headers: {
        'Authorization': 'Bearer ' + this.session.access_token
      }
    });
  }

  async login(username, password) {
    let res = await this.request.post('oauth/token', {
      form: {
        client_id: 'education_client',
        grant_type: 'password',
        username,
        password,
        client_secret: 'password'
      },
      json: true
    });

    return res;
  }

  async getCurrentUser() {
    return this.request.get('/users/getCurrentUser');
  }

  async getCurrentSemesterInfo() {
    return this.request.get('/semester/semester_info');
  }

  async getCourseHour() {
    return this.request.get('/coursehour/1/1000');
  }

  async getSchoolYears() {
    return this.request.get('/schoolyear/1/100');
  }

  async getSemesters() {
    return this.request.get('/semester/1/100');
  }

  async getStudentCourseSubjects(semesterId) {
    return this.request.get('/StudentCourseSubject/studentLoginUser/' + semesterId);
  }

  async getSemesterWithFullsub() {
    return this.request.get('/semester/getwithfullsub')
  }
}

module.exports = tluNew;