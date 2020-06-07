if (process.env.NODE_ENV === 'production') {
    // console.log('Production environment detected.');
    module.exports = require('./prod');
} else {
    // console.log('Development environment assumed.');
    module.exports = require('./dev');
}
