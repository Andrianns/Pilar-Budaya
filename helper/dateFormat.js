const { format } = require('date-fns');

function HTMLDateFormat(date) {
  return format(new Date(date), 'yyyy-MM-dd');
}
module.exports = { HTMLDateFormat };
