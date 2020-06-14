if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    module.exports = require('./prod');
} else {
    module.exports = require('./dev');
}
