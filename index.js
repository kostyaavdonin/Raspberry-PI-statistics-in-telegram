const {
    Telegram,
} = require('puregram');

const os = require('os')
const si = require('systeminformation');
const domainPing = require("domain-ping");
const { Logger, Color } = require('@starkow/logger')

const { execSync } = require('child_process');

require('dotenv').config()

const {
    HearManager
} = require("@puregram/hear");

const hearManager = new HearManager()

const telegram = Telegram.fromToken(process.env.TELEGRAM_BOT_TOKEN, {
})

telegram.updates.on('message', hearManager.middleware);

hearManager.hear((text) => text === '/start', async (context) => {

    let cpuCount = os.cpus().length;
    let freeMemory = os.freemem();
    let totalMemory = os.totalmem();

    let usedDiskSpace = execSync("df -h").toString().match(/[0-9]+\.[0-9]+?../)[0];
    let diskSpace = formatBytes((await si.diskLayout())[0].size);
    let temp = Math.round((await si.cpuTemperature()).main);
    let version = await si.osInfo()

    await context.send(
`
🔹 *Информация:*

🖥 *ОС:* _${version.distro}_
ℹ️ *Version:* \`${version.release}\`

🗃 *Память:* \`${usedDiskSpace}/ ${diskSpace}\`
📥 *ОЗУ:* \`${formatBytes(totalMemory - freeMemory)} / ${formatBytes(totalMemory)}\`
🎛 *ЦПУ:* \`${cpuCount}\`

🌡 *Температура:* \`${temp}\`*°*

🌐 *Google:* \`${(await domainPing('google.com')).ping_time}\` *ms*
🛩 *Telegram:* \`${(await domainPing('api.telegram.org')).ping_time}\` *ms*

`, {
    parse_mode: "Markdown"
    })
})

async function main() {

    await telegram.updates.startPolling().then(
        async () => {
        Logger.create('Polling started from bot:', Color.Green)(`@${telegram.bot.username}!`)
    }
    ).catch(error => Logger.create('Polling error', Color.Red)(error));
}

main()

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}