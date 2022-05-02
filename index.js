const { Client } = require("minecraft-launcher-core");
const launcher = new Client();
const msmc = require("msmc");
const fetch = require("node-fetch");
const fs = require("fs");
const YAML = require("yaml");
const process = require("process");
const configFile = "config.yaml";

var config = {
  server: "buildtheearth.net",
};


if (fs.existsSync(configFile)) {
  config = YAML.parse(fs.readFileSync(configFile, "UTF-8"));
} else {
  fs.writeFileSync(configFile, YAML.stringify(config));
}


function saveAccount() {
  fs.writeFileSync(accountFile, JSON.stringify(account));
}

var account = null;
var accountFile = "account.json";

if (fs.existsSync(accountFile)) {
  account = JSON.parse(fs.readFileSync(accountFile, "UTF-8"));
}

async function logIn() {
  msmc.setFetch(fetch)
  msmc.fastLaunch("raw",
    (update) => {
      console.log("[MSMC]: " + update.data);
    }).then((result) => {
      if (msmc.errorCheck(result)) {
        console.error("Could not log in: " + result.type);
        process.exit(1);
      }
      account = msmc.getMCLC().getAuth(result);
      account.type = "msa";
      saveAccount();
      launch();
    }).catch((reason) => {
      console.error("Could not log in: " + reason);
      process.exit(1);
    });
}

if (account == null) {
  logIn();
}
else {
  (async () => {
    if (account.type === "msa") {
      if (!msmc.validate(account)) {
        account = msmc.getMCLC().getAuth(await msmc.refresh(account, (update) => {
          if (update.data) {
            console.log("[MSMC]: " + update.data);
          }
        }));
        account.type = "msa";
        saveAccount();
      }
    }
    launch();
  })();
}

function launch() {
  let opts = {
    authorization: account,
    custom: false,
    overrides: {
      detached: false
    },
    root: config.directory,
    version: {
      number: config.version,
      type: "release"
    },
    forge: 'C:/Users/sujal/AppData/Roaming/.minecraft/versions/1.12.2-forge-14.23.5.2859/forge-1.12.2-14.23.5.2860-installer.jar',
    server: {
      host: '0'
    },
    memory: config.memory,
    java: true,
    javapath: null,
    screen: true,
  };

  launcher.launch(opts);
  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));
}