var co = require("co");
var exec = require("co-exec");
var tasks = {};
var server;
var ssh = require("./ssh");

exports.task = function (name, gen) {
  tasks[name] = gen;
};

exports.server = function (name, config) {
  server = ssh(config);
};

exports.run = function (name) {
  co(function* () {
    yield server.connect();
    yield tasks[name];
    server.end();
  })();
};

exports.exec = exec;
exports.rexec = function *(cmd) {
  return yield server.exec(cmd);
};
exports.get = function *(remote, local) {
  return yield server.get(remote, local);
};
exports.put = function *(local, remote) {
  return yield server.put(local, remote);
};