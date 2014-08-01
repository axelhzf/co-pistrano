var c = require("../lib/co-pistrano");

c.server("imac", {
  host: 'imac',
  user: "axelhzf",
  key: '/Users/axelhzf/.ssh/id_rsa'
});

c.task("main", function* () {
  var local = yield c.exec("ls -alt");
  var remote = yield c.rexec("ls -alt");
  yield c.get("example.txt", "e.txt");
  yield c.put("test/a.txt", "a.txt");
  console.log(local, remote);
});

c.run("main");