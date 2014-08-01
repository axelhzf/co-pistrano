var assert = require('assert');
var SSH = require('ssh2');
var debug = require("debug")("ssh");

module.exports = Connection;

/**
 * SSH connection.
 *
 * @param {Object} [opts]
 * @api public
 */
function Connection(opts) {
  if (!(this instanceof Connection)) return new Connection(opts);
  this.ssh = new SSH;
  this.opts = opts;
  this.sessions = [];
}

/**
 * Connect with `opts`.
 *
 * - `host`
 * - `port`
 * - `user`
 * - `key`
 *
 * @param {Object} opts
 * @return {Function}
 * @api public
 */

Connection.prototype.connect = function(opts){
  var self = this;
  opts = opts || this.opts || {};

  // default port
  opts.port = opts.port || 22;

  // required
  assert(opts.host, '.host required');
  assert(opts.user, '.user required');
  assert(opts.key, '.key required');
  opts.privateKey = require('fs').readFileSync(opts.key);
  opts.username = opts.user;

  return function(done){
    self.ssh.connect(opts);
    self.ssh.once('ready', function (err) {
      if (err) return done(err);
      debug("SSH ready");
      self.ssh.sftp(function (err, sftp) {
        if (err) return done(err);

        debug("SFTP ready");
        self.sftp = sftp;
        done();
      });
    });
    self.ssh.once('error', done);
  }
};

/**
 * Execute `cmd`.
 *
 * @param {String} cmd
 * @return {Function}
 * @api public
 */

Connection.prototype.exec = function(cmd){
  var ssh = this.ssh;
  return function(done){
    ssh.exec(cmd, function(err, stream){
      if (err) return done(err);
      var buf = '';
      stream.setEncoding('utf8');
      stream.on('data', function(c){ buf += c });
      stream.on('end', function(){ done(null, buf) });
    });
  }
};

/**
 * End the connection.
 *
 * @api public
 */

Connection.prototype.end = function(){
  this.ssh.end();
};

Connection.prototype.get = function (remote, local) {
  var self = this;
  return function (done) {
    self.sftp.fastGet(remote, local, done);
  }
};

Connection.prototype.put = function (remote, local) {
  var self = this;
  return function (done) {
    self.sftp.fastPut(remote, local, done);
  }
};

//fastGet(< string >remotePath, < string >localPath[, < object >options], < function >callback)
//fastPut(< string >localPath, < string >remotePath[, < object >options], < function >callback)
//step
