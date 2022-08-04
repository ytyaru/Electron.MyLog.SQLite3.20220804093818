# 透明なウインドウ

　透明または半透明ウインドウを作りたかったが、Raspberry PI 4 32bit OSでは動作しなかった。

```sh
$ uname -a
Linux raspberrypi 5.10.103-v7l+ #1529 SMP Tue Mar 8 12:24:00 GMT 2022 armv7l GNU/Linux
```

　Electron的には以下のように`transparent: true`で有効化できるらしい。

```javascript
const fs = require('fs')
const path = require('path')
const util = require('util')
const childProcess = require('child_process');
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true, // 透過
        opacity: 0.3,
        frame: false,      // フレームを非表示にする
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
}
```

　だが、ラズパイで実行しても半透明になっていなかった。

　どうやらラズパイではコンポジットマネージャという類のアプリでウインドウの状態を管理しており、そいつの設定により透明化できるらしい。デフォルトで`xcompmgr`というツールがインストールされていた。しかし起動してみてもエラーが延々と表示される。

```sh
$ xcompmgr -c
error 9: BadDrawable (invalid Pixmap or Window parameter) request 139 minor 4 serial 1288
error 143: BadPicture request 139 minor 8 serial 1289
error 143: BadPicture request 139 minor 8 serial 1427
error 143: BadPicture request 139 minor 8 serial 1469
...
```
```sh
$ xcompmgr -c -t-5 -l-5 -r4.2 -o.55
error 9: BadDrawable (invalid Pixmap or Window parameter) request 139 minor 4 serial 1277
error 143: BadPicture request 139 minor 8 serial 1278
error 143: BadPicture request 139 minor 8 serial 1413
error 143: BadPicture request 139 minor 8 serial 1455
error 143: BadPicture request 139 minor 8 serial 1497
...
```

　[コンポジットマネージャーのXcompmgrでウィンドウ透過設定][]を参考にしてみると`transset`なるアプリを使っていた。

[コンポジットマネージャーのXcompmgrでウィンドウ透過設定]:https://matoken.org/blog/2016/03/20/window-transparent-set-in-xcompmgr-of-composite-manager/

　アプリ検索すると`x11-apps`というのが出てきた。

```sh
$ apt search transset
x11-apps/oldstable,oldstable 7.7+7 armhf
  X applications
```

　インストールしてみる。

```sh
sudo apt install -y x11-apps
```

　端末のタブ1で以下コマンドを叩く。このときエラーが延々と出るが無視する。

```sh
xcompmgr -c
```

　端末のタブ2で以下コマンドを叩く。

```sh
transset 0.6
```

　このときマウスが`＋`アイコンになるので、任意のウインドウをクリックすると指定した透過率で透明になる。

# 足りない

* 背景を透明にして任意の部分だけ表示したい

# 参考

* https://wiki.archlinux.jp/index.php/Xcompmgr
* https://forums.raspberrypi.com/viewtopic.php?t=262157
* https://copyprogramming.com/howto/electron-transparent-window-on-raspberry-pi-4

