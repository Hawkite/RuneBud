'use strict';
const electron = require('electron');
const remote = electron.remote;
const {app, BrowserWindow, ipcMain} = electron;
const locals = {appname: 'RuneBud'};
const pug = require('electron-pug')({pretty: true}, locals);
const path = require('path');
const url = require('url');
const fs = require('fs');
const osrs = require('osrs-wrapper');
const request = require('request');
const cheerio = require('cheerio');
const headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        "Host": "oldschoolrunescape.wikia.com",
        "Connection":"keep-alive",
        "Accept-Language":"en-US,en;q=0.5",
        "Accept":"text/html",
        //"Accept-Encoding":"gzip, deflate, br",
        "Referer":"http://oldschoolrunescape.wikia.com"
};

global.osrs = osrs;

let accountSaveData = {};
let win;
let wbCon;

/**
 * Saves account data for the runescape accounts
 * @param {object} data Runescape account names
 */
function saveAccountsData(data) {
    if (!fs.existsSync(app.getPath('documents') + '\\RuneBud\\')) {
        fs.mkdirSync(app.getPath('documents') + '\\RuneBud\\');
    }
    fs.writeFile(app.getPath('documents') + '\\RuneBud\\data',
        JSON.stringify(data || {}), ()=>{});
}

/**
 * Creates the window for the program
 */
function createWindow() {
    win = new BrowserWindow({width: 800,
        height: 600,
        autoHideMenuBar: true,
        title: locals.appname, show: false});
    wbCon = win.webContents;
    win.once('ready-to-show', () => {
        win.show();
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'view/home.pug'),
        protocol: 'file:',
        slashes: true,
    }));

  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
}


ipcMain.on('addprops', (ev, data)=>{
    if (!accountSaveData[data.accountName]) {
        accountSaveData[data.accountName] = {};
    }
    Object.assign(accountSaveData[data.accountName], data.data);
    saveAccountsData(accountSaveData);
}).on('removeprop', (ev, data)=>{
    delete accountSaveData[data['accountName']];
    saveAccountsData(accountSaveData);
}).on('requestExchangeItemData', (event,arg)=>{
  let url = "https://oldschoolrunescape.wikia.com/wiki/Category:Grand_Exchange";
  request({url: url, headers: headers},(error, response, body)=>{
    if (!error && response.statusCode == 200) {
      let $ = cheerio.load(body);
      let mwpages_li = $("#mw-pages li");
      let file = {items:{

      }}
      for(let i = 0; i < mwpages_li.length; i++){
        let li = $(mwpages_li[i]);
        let page = li.children()[0].attr("href");
        request({url: page, headers: headers}, (err,res,bod)=>{
          
        })//8
      }
      fs.writeFile("./text.txt", body, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
      });
      //for(var i of a) for(var j of a.children) console.log(j.innerText)
      console.log(mwpages_li.length);
    } else {
      console.log(error);
    }
  });
});


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    saveAccountsData(accountSaveData);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
