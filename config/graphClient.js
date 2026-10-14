const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const getGraphClient = (accessToken) => {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
};

module.exports = { getGraphClient };