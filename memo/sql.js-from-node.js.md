# sql.jsをNode.js上で使用する方法

* https://github.com/sql-js/sql.js/#use-from-nodejs

```sh
npm i sql.js
npm i sql-wasm
```
```javascript
const fs = require('fs');
const initSqlJs = require('sql-wasm.js');
const filebuffer = fs.readFileSync('test.sqlite');

initSqlJs().then(function(SQL){
  // Load the db
  const db = new SQL.Database(filebuffer);
});
```

