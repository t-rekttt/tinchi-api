const { login } = require('./src/dangnhap');
const dangkyhoc = require('./src/dangkyhoc');
const { ketquadangkyhoc } = dangkyhoc;

login('1851160076', 'Wtf123#')
  .then(() => ketquadangkyhoc.getAndParseTkbDkh())
  .then(console.log)