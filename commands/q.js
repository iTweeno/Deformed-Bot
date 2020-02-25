const Discord = require("discord.js")

const client = require("../client.js");

const MongoDB = require("../mongodb");

const db = MongoDB.getDB()

const dbCollection = db.collection('sixman')

let gameCount = 0;

const EMBED_COLOR = "#F8534F";

let ongoingGames = [];

let storedData;

const usednums = []

const tempobject = {}

let hasvoted = false

let channelQueues = {};

let cancelqueue = {}

const shuffle = function (array) {

    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);

        currentIndex--;

        temporaryValue = array[currentIndex];

        array[currentIndex] = array[randomIndex];

        array[randomIndex] = temporaryValue;
    }

    return array;

};

function messageEndswith(message) {

    const split = message.content.split(" ");
    return split[split.length - 1];
};

const args = message => {
    const arraywords = message.content.split(" ")
    return arraywords[0].substring(1)
}


const execute = async (message) => {

    await dbCollection.find().toArray().then(dataDB => {
        storedData = dataDB
    })

    const channel_ID = message.channel.id

    const givewinLose = async (score) => {

        for (let user of storedData) {
            for (let games of ongoingGames) {

                const channelpos = user.servers.map(e => e).map(e => e.channelID).indexOf(channel_ID)

                const a = `servers.${channelpos}.${score}`

                if (user.id === games[i].id) {

                    await dbCollection.update({
                        id: user.id
                    }, {
                        $set: {
                            [a]: user.servers[user.servers.map(e => e.channelID).indexOf(channel_ID)][score] + 1
                        }
                    });
                }
            }
        }
    }

    if (!Object.keys(channelQueues).includes(channel_ID)) {

        channelQueues[channel_ID] = []
    }

    const sixmansarray = channelQueues[channel_ID]

    const userId = message.author.id

    const toAdd = {
        id: userId,
        name: message.author.username,
    };

    const embed = new Discord.RichEmbed().setColor(EMBED_COLOR)

    switch (args(message)) {

        case "leave": {
            const index = sixmansarray.map(e => e.id).indexOf(userId);

            if (index === -1) {

                embed.setTitle(":x: You are not in the queue!");

                return message.channel.send(embed);
            };

            sixmansarray.splice(index, 1);

            embed.setTitle(`:white_check_mark: ${message.author.username} left the queue!`);

            return message.channel.send(embed);
        }

        case "status": {

            embed.setTitle("Players in queue:");

            embed.setDescription(sixmansarray.map(e => e.name).join(", "));

            return message.channel.send(embed);
        }

        case "report": {
            switch (messageEndswith(message)) {
                case "win": {

                    if (ongoingGames.length === 0) {

                        embed.setTitle(":x: You are not in a game!");

                        return message.channel.send(embed);
                    }

                    if (!ongoingGames.flat().map(e => e.id).includes(userId) || ongoingGames.length === 0) {

                        embed.setTitle(":x: You are not in a game!");

                        return message.channel.send(embed)
                    }

                    for (let games of ongoingGames) {

                        if (!games.map(e => e.id).includes(userId)) {

                            continue
                        }

                        embed.setTitle(":white_check_mark: Game Completed! Thank you for Playing!");

                        const indexplayer = games.map(e => e.id).indexOf(userId);

                        if (indexplayer === 0 || indexplayer === 1 || indexplayer === 2) {
                            for (i = 0; i < 3; i++) {
                                givewinLose("wins");
                            }
                            for (i = 3; i < 6; i++) {
                                givewinLose("losses");
                            }
                        }

                        if (indexplayer === 3 || indexplayer === 4 || indexplayer === 5) {
                            for (i = 3; i < 6; i++) {
                                givewinLose("wins");
                            }
                            for (i = 0; i < 3; i++) {
                                givewinLose("losses");
                            }
                        }

                        let index = ongoingGames.indexOf(games);

                        ongoingGames.splice(index, 1);

                        for (let channel of message.guild.channels.array()) {

                            if (channel.name === `Team-1-Game-${games[6].gameID}`) {

                                channel.delete()
                            }

                            if (channel.name === `Team-2-Game-${games[6].gameID}`) {

                                channel.delete()
                            }
                        }

                        return message.channel.send(embed);
                    }
                }

                case "lose": {

                    if (ongoingGames.length === 0) {

                        embed.setTitle(":x: You are not in a game!");

                        return message.channel.send(embed)
                    }
                    if (!ongoingGames.flat().map(e => e.id).includes(userId)) {

                        embed.setTitle(":x: You are not in a game!");

                        return message.channel.send(embed);
                    }

                    for (let games of ongoingGames) {

                        if (!games.map(e => e.id).includes(userId)) {

                            continue
                        }

                        embed.setTitle(":white_check_mark: Game Completed! Thank you for Playing!");

                        const indexplayer = games.map(e => e.id).indexOf(userId);

                        if (indexplayer === 0 || indexplayer === 1 || indexplayer === 2) {
                            for (i = 0; i < 3; i++) {
                                givewinLose("losses");
                            }
                            for (i = 3; i < 6; i++) {
                                givewinLose("wins");
                            }
                        }

                        if (indexplayer === 3 || indexplayer === 4 || indexplayer === 5) {
                            for (i = 3; i < 6; i++) {
                                givewinLose("losses");
                            }
                            for (i = 0; i < 3; i++) {
                                givewinLose("wins");

                            }
                        }

                        let index = ongoingGames.indexOf(games);

                        ongoingGames.splice(index, 1);

                        for (let channel of message.guild.channels.array()) {

                            if (channel.name === `Team-1-Game-${games[6].gameID}`) {

                                channel.delete()
                            }

                            if (channel.name === `Team-2-Game-${games[6].gameID}`) {

                                channel.delete()
                            }
                        }

                        return message.channel.send(embed);
                    }
                }
                default: {
                    embed.setTitle(":x: Invalid Parameters!")
                    return message.channel.send(embed);
                }
            }
        }

        case "cancel": {
            if (!ongoingGames.flat().map(e => e.id).includes(userId) || ongoingGames.length === 0) {

                embed.setTitle(":x: You are not in a game!");

                return message.channel.send(embed);
            }
            for (let games of ongoingGames) {

                if (!games.map(e => e.id).includes(userId)) {

                    continue
                }

                const IDGame = games[6].gameID

                const index = games.map(e => e.id).indexOf(userId);

                if (!Object.keys(cancelqueue).includes(IDGame.toString())) {

                    cancelqueue[IDGame] = []
                }

                const cancelqueuearray = cancelqueue[IDGame]

                cancelqueuearray.push({
                    id: userId
                })

                embed.setTitle(`:exclamation: ${games[index].name} wants to cancel game ${IDGame}. (${cancelqueuearray.length}/4)`)

                message.channel.send(embed)

                if (cancelqueuearray.length === 4) {

                    for (let channel of message.guild.channels.array()) {

                        if (channel.name === `Team-1-Game-${games[6].gameID}`) {

                            channel.delete()
                        }

                        if (channel.name === `Team-2-Game-${games[6].gameID}`) {

                            channel.delete()
                        }
                    }

                    embed.setTitle(`:white_check_mark: Game ${games[6].gameID} Cancelled!`)

                    let index = ongoingGames.indexOf(games);

                    cancelqueue[IDGame] = []

                    ongoingGames.splice(index, 1);

                    return message.channel.send(embed)
                }

            }
            break;
        }

        case "score": {

            if (!storedData.map(e => e.id).includes(userId)) {

                embed.setTitle(":x: You haven't played any games yet!");

                return message.channel.send(embed);
            }

            for (let j = 0; j < storedData.length; j++) {
                if (storedData[j].id === userId) {

                    const scoreDirectory = storedData[j].servers[storedData[j].servers.map(e => e.channelID).indexOf(message.channel.id)]

                    if (scoreDirectory === undefined) {

                        embed.setTitle(":x: You haven't played any games in here yet!");

                        return message.channel.send(embed);
                    }

                    embed.addField("Wins:", scoreDirectory.wins);

                    embed.addField("Losses:", scoreDirectory.losses);

                    return message.channel.send(embed);
                }
            }
            break;
        }

        case "reset": {
            if (message.content.split(" ").length == 1) {
                embed.setTitle(":x: Invalid Parameters!")
                return message.channel.send(embed)
            }
            const secondarg = message.content.split(" ")[1]

            const thirdparam = message.content.split(" ")[2]

            if (!message.member.hasPermission("ADMINISTRATOR")) {

                embed.setTitle(":x: You do not have Administrator permission!")

                return message.channel.send(embed)
            }

            const winlossarray = ["wins", "losses"]

            switch (secondarg) {
                case "channel": {
                    if (message.content.split(" ").length !== 2) {

                        embed.setTitle(":x: Invalid Parameters!")

                        return message.channel.send(embed)
                    }
                    for (let user of storedData) {

                        const channelpos = user.servers.map(e => e).map(e => e.channelID).indexOf(channel_ID)

                        if (channelpos !== -1) {
                            for (let score of winlossarray) {
                                const a = `servers.${channelpos}.${score}`

                                await dbCollection.update({
                                    id: user.id
                                }, {
                                    $set: {
                                        [a]: 0
                                    }
                                });
                            }
                        }
                    }

                    embed.setTitle(":white_check_mark: Player's score reset!")

                    return message.channel.send(embed)
                }
                case "player": {
                    if (message.content.split(" ").length !== 3) {

                        embed.setTitle(":x: Invalid Parameters!")

                        return message.channel.send(embed)

                    }
                    const channelpos = storedData[storedData.map(e => e.id).indexOf(thirdparam)].servers.map(e => e).map(e => e.channelID).indexOf(channel_ID)

                    if (channelpos == -1) {
                        embed.setTitle(":x: This user hasn't played any games in this channel!")
                        return message.channel.send(embed)
                    } else {
                        for (let score of winlossarray) {

                            const a = `servers.${channelpos}.${score}`
                            await dbCollection.update({
                                id: thirdparam
                            }, {
                                $set: {
                                    [a]: 0
                                }

                            });
                        }
                    }

                    embed.setTitle(":white_check_mark: Player's score reset!")

                    return message.channel.send(embed)
                }
                default: {
                    embed.setTitle(":x: Invalid Parameters!")

                    return message.channel.send(embed);
                }
            }
        }

        case "q": {

            for (let person of sixmansarray) {
                if (person.id === userId) {

                    embed.setTitle(":x: You're already in the queue!");

                    return message.channel.send(embed);
                }
            };


            if (ongoingGames.flat().map(e => e.id).includes(userId)) {

                embed.setTitle(":x: You are in the middle of a game!");

                return message.channel.send(embed);
            };

            if (Object.entries(tempobject).length !== 0) {

                embed.setTitle(":x: Please wait for the next game to be decided!")

                return message.channel.send(embed)
            }

            sixmansarray.push(toAdd);

            embed.setTitle(":white_check_mark: Added to queue!");

            message.channel.send(embed);

            if (sixmansarray.length === 6) {
                for (let user of sixmansarray) {

                    const newUser = {
                        id: user.id,
                        name: user.name,
                        servers: []
                    };

                    // yes i know having lots of requests isnt good ill change when i can be fucked to

                    if (await dbCollection.find({
                            id: user.id
                        }).toArray().then(dataDB => dataDB.length === 0)) {
                        (async function () {
                            await dbCollection.insert(newUser);
                        })()
                    };

                    if (await dbCollection.find({
                            id: user.id,
                            ["servers.channelID"]: channel_ID
                        }).toArray().then(dataDB => dataDB.length === 0)) {

                        (async function () {
                            await dbCollection.update({
                                id: user.id
                            }, {
                                $push: {
                                    servers: {
                                        channelID: channel_ID,
                                        wins: 0,
                                        losses: 0
                                    }
                                }
                            });
                        })()

                    };
                };

                const valuesforpm = {
                    name: Math.floor(Math.random() * 99999),
                    password: Math.floor(Math.random() * 99999)
                };

                embed.setTitle("A game has been made! Please select your preferred gamemode: Captains (c) or Random (r) ")

                gameCount++

                const rorc = {}

                rorc[gameCount] = []

                const rorcArray = rorc[gameCount]

                message.channel.send(embed)

                let filter = m => m.content.split("")[1] === "r" || m.content.split("")[1] === "c"

                message.channel.createMessageCollector(filter, {
                    time: 15000
                }).on('collect', m => {
                    if (!sixmansarray.map(e => e.id).includes(m.author.id) || rorcArray.map(e => e.id).includes(m.author.id)) {

                    } else {

                        rorcArray.push({
                            id: m.author.id,
                            param: m.content.split("")[1]
                        })
                    }
                })

                await new Promise(resolve => setTimeout(resolve, 15000));

                function getOccurrence(array, value) {

                    return array.filter((v) => (v === value)).length;
                }

                const rc = ["r", "c"]
                if (rorcArray.length === 0) {

                    rorcArray.push({
                        param: rc[Math.floor(Math.random() * rc.length)]
                    })
                }

                if (getOccurrence(rorcArray.map(e => e.param), "r") === getOccurrence(rorcArray.map(e => e.param), "c")) {

                    rorcArray.push({
                        param: rorcArray[Math.floor(Math.random() * rorcArray.map(e => e.param).length)].param
                    })
                }
                if (getOccurrence(rorcArray.map(e => e.param), "r") > getOccurrence(rorcArray.map(e => e.param), "c")) {

                    shuffle(sixmansarray);

                    sixmansarray.push({
                        gameID: gameCount
                    })

                    ongoingGames.push([...sixmansarray]);

                    const discordEmbed1 = new Discord.RichEmbed()
                        .setColor(EMBED_COLOR)
                        .addField("Game is ready:", `Game ID is: ${gameCount}`)
                        .addField(":small_orange_diamond: -Team 1-", `${sixmansarray[0].name}, ${sixmansarray[1].name}, ${sixmansarray[2].name}`)
                        .addField(":small_blue_diamond: -Team 2-", `${sixmansarray[3].name}, ${sixmansarray[4].name}, ${sixmansarray[5].name}`);
                    message.channel.send(discordEmbed1);

                    const JoinMatchEmbed = new Discord.RichEmbed()
                        .setColor(EMBED_COLOR)
                        .addField("Name:", valuesforpm.name)
                        .addField("Password:", valuesforpm.password)
                        .addField("You have to:", `Join match(Created by ${sixmansarray[0].name})`);


                    for (let users of sixmansarray) {
                        if (users.id !== sixmansarray[0].id && users.id !== sixmansarray[6].id) {

                            client.users.get(users.id).send(JoinMatchEmbed).catch(error => {
                                const errorEmbed = new Discord.RichEmbed()
                                    .setColor(EMBED_COLOR)
                                    .setTitle(`:x: Couldn't sent message to ${users.name}, please check if your DM'S aren't set to friends only.`);

                                console.error(error);

                                message.channel.send(errorEmbed)
                            });
                        };
                    };

                    const CreateMatchEmbed = new Discord.RichEmbed()
                        .setColor(EMBED_COLOR)
                        .addField("Name:", valuesforpm.name)
                        .addField("Password:", valuesforpm.password)
                        .addField("You have to:", "Create Match");

                    client.users.get(sixmansarray[0].id).send(CreateMatchEmbed).catch(error => {
                        const errorEmbed = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .setTitle(`:x: Couldn't sent message to ${sixmansarray[0].name}, please check if your DM'S aren't set to friends only.`);

                        message.channel.send(errorEmbed)
                        console.error(error);
                    });

                    message.guild.createChannel(`Team-1-Game-${gameCount}`, {
                            type: 'voice',
                            parent: message.channel.parentID,
                            permissionOverwrites: [{
                                    id: message.guild.defaultRole,
                                    deny: "CONNECT"
                                },
                                {
                                    id: sixmansarray[0].id,
                                    allow: "CONNECT"
                                },
                                {
                                    id: sixmansarray[1].id,
                                    allow: "CONNECT"
                                },
                                {
                                    id: sixmansarray[2].id,
                                    allow: "CONNECT"
                                }
                            ]
                        })
                        .catch(console.error)

                    message.guild.createChannel(`Team-2-Game-${gameCount}`, {
                            type: 'voice',
                            parent: message.channel.parentID,
                            permissionOverwrites: [{
                                    id: message.guild.defaultRole,
                                    deny: "CONNECT"
                                },
                                {
                                    id: sixmansarray[3].id,
                                    allow: "CONNECT"
                                },
                                {
                                    id: sixmansarray[4].id,
                                    allow: "CONNECT"
                                },
                                {
                                    id: sixmansarray[5].id,
                                    allow: "CONNECT"
                                }
                            ]
                        })
                        .catch(console.error)

                    sixmansarray.splice(0, sixmansarray.length);

                } else if (getOccurrence(rorcArray.map(e => e.param), "c") > getOccurrence(rorcArray.map(e => e.param), "r")) {

                    //yes this code is horrible no shit sherlock

                    sixmansarray.push({
                        gameID: gameCount
                    })

                    tempobject[gameCount] = []

                    const tempobjectArray = tempobject[gameCount]

                    tempobjectArray.push([...sixmansarray]);

                    for (let tempObjectlol of tempobjectArray) {
                        if (!tempObjectlol.map(e => e.id).includes(userId)) {
                            continue
                        }
                        const tempvar = tempObjectlol[6]

                        shuffle(tempObjectlol);

                        tempObjectlol.splice(tempObjectlol.findIndex(o => o.gameID === tempvar.gameID), 1)

                        tempObjectlol.push(tempvar)

                        sixmansarray[0] = tempObjectlol[0]

                        sixmansarray[3] = tempObjectlol[1]

                        const CaptainsEmbed = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .setTitle(`Game ID: ${tempObjectlol[6].gameID}`)
                            .addField(`Captain for team 1`, tempObjectlol[0].name)
                            .addField(`Captain for team 2`, tempObjectlol[1].name);

                        message.channel.send(CaptainsEmbed)

                        const privatedm0 = client.users.get("215982178046181376")

                        const privatedm1 = client.users.get("215982178046181376")

                        tempObjectlol.shift()
                        tempObjectlol.shift()

                        const Captain1st = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .setTitle("Choose one:")
                            .addField(`1 :`, tempObjectlol[0].name)
                            .addField(`2 :`, tempObjectlol[1].name)
                            .addField(`3 :`, tempObjectlol[2].name)
                            .addField(`4 :`, tempObjectlol[3].name);

                        privatedm0.send(Captain1st).catch(error => {
                            const errorEmbed = new Discord.RichEmbed()
                                .setColor(EMBED_COLOR)
                                .setTitle(`:x: Couldn't sent message to ${privatedm0}, please check if your DM'S aren't set to friends only.`);

                            console.error(error);

                            message.channel.send(errorEmbed)
                        });

                        filter = m => !isNaN(m.content) && parseInt(m.content) > -1 && parseInt(m.content) < 4

                        await privatedm0.createDM().then(m => {
                            m.createMessageCollector(filter, {
                                time: 20000
                            }).on('collect', m => {
                                const parsedM = parseInt(m) - 1
                                if (!hasvoted) {

                                    sixmansarray[1] = tempObjectlol[parsedM]

                                    tempObjectlol.splice(parsedM, 1)

                                    hasvoted = true
                                }
                            })
                        })

                        await new Promise(resolve => setTimeout(resolve, 20000));

                        if (!hasvoted) {

                            const randomnumber = Math.floor(Math.random() * 4)

                            sixmansarray[1] = tempObjectlol[randomnumber]

                            tempObjectlol.splice(randomnumber, 1)
                        }

                        hasvoted = false

                        const Captain2nd = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .setTitle("Choose two:")
                            .addField(`1 :`, tempObjectlol[0].name)
                            .addField(`2 :`, tempObjectlol[1].name)
                            .addField(`3 :`, tempObjectlol[2].name);

                        privatedm1.send(Captain2nd).catch(error => {
                            const errorEmbed = new Discord.RichEmbed()
                                .setColor(EMBED_COLOR)
                                .setTitle(`:x: Couldn't sent message to ${privatedm1}, please check if your DM'S aren't set to friends only.`);

                            console.error(error);

                            message.channel.send(errorEmbed)
                        });

                        filter = m => !isNaN(m.content) && parseInt(m.content) > -1 && parseInt(m.content) < 4

                        privatedm1.createDM().then(m => {
                            m.createMessageCollector(filter, {
                                time: 20000
                            }).on('collect', m => {

                                const parsedM = parseInt(m) - 1

                                if (!hasvoted) {

                                    sixmansarray[4] = tempObjectlol[parsedM]

                                    hasvoted = true

                                    usednums.push(parsedM)

                                } else if (hasvoted && !usednums.includes(parsedM) && hasvoted !== "all") {

                                    sixmansarray[5] = tempObjectlol[parsedM]

                                    hasvoted = "all"

                                    usednums.push(parsedM)

                                    tempObjectlol.splice(usednums[0], 1)

                                    if (usednums[1] > usednums[0]) {

                                        tempObjectlol.splice(usednums[1] - 1, 1)
                                    } else {

                                        tempObjectlol.splice(usednums[1], 1)
                                    }

                                }

                            })
                        })

                        await new Promise(resolve => setTimeout(resolve, 20000));

                        const randomnumber = Math.floor(Math.random() * 3)

                        let randomnumber2 = Math.floor(Math.random() * 3)

                        if (!hasvoted) {

                            while (randomnumber === randomnumber2) {
                                randomnumber2 = Math.floor(Math.random() * 3)
                            }

                            sixmansarray[4] = tempObjectlol[randomnumber]

                            sixmansarray[5] = tempObjectlol[randomnumber2]

                            tempObjectlol.splice(randomnumber, 1)

                            if (randomnumber2 > randomnumber) {

                                tempObjectlol.splice(randomnumber2 - 1, 1)
                            } else {

                                tempObjectlol.splice(randomnumber2, 1)
                            }

                        } else if (hasvoted && hasvoted !== "all") {

                            while (usednums.includes(randomnumber2)) {

                                randomnumber2 = Math.floor(Math.random() * 2)
                            }

                            sixmansarray[5] = tempObjectlol[randomnumber2]

                            tempObjectlol.splice(usednums[0], 1)

                            if (randomnumber2 > usednums[0]) {

                            tempObjectlol.splice(randomnumber2 - 1, 1)
                            } else {

                                tempObjectlol.splice(randomnumber2, 1)
                            }
                        }

                        sixmansarray[2] = tempObjectlol[0]

                        tempObjectlol.splice(0, tempObjectlol.length);

                        ongoingGames.push([...sixmansarray])

                        const discordEmbed1 = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .addField("Game is ready:", `Game ID is: ${sixmansarray[6].gameID}`)
                            .addField(":small_orange_diamond: -Team 1-", `${sixmansarray[0].name}, ${sixmansarray[1].name}, ${sixmansarray[2].name}`)
                            .addField(":small_blue_diamond: -Team 2-", `${sixmansarray[3].name}, ${sixmansarray[4].name}, ${sixmansarray[5].name}`);
                        message.channel.send(discordEmbed1);

                        const JoinMatchEmbed = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .addField("Name:", valuesforpm.name)
                            .addField("Password:", valuesforpm.password)
                            .addField("You have to:", `Join match(Created by ${sixmansarray[0].name})`);


                        for (let users of sixmansarray) {
                            if (users.id !== sixmansarray[0].id && users.id !== sixmansarray[6].id) {

                                client.users.get(users.id).send(JoinMatchEmbed).catch(error => {
                                    const errorEmbed = new Discord.RichEmbed()
                                        .setColor(EMBED_COLOR)
                                        .setTitle(`:x: Couldn't sent message to ${users.name}, please check if your DM'S aren't set to friends only.`);

                                    console.error(error);

                                    message.channel.send(errorEmbed)
                                });
                            };
                        };

                        const CreateMatchEmbed = new Discord.RichEmbed()
                            .setColor(EMBED_COLOR)
                            .addField("Name:", valuesforpm.name)
                            .addField("Password:", valuesforpm.password)
                            .addField("You have to:", "Create Match");

                        client.users.get(sixmansarray[0].id).send(CreateMatchEmbed).catch(error => {
                            const errorEmbed = new Discord.RichEmbed()
                                .setColor(EMBED_COLOR)
                                .setTitle(`:x: Couldn't sent message to ${sixmansarray[0].name}, please check if your DM'S aren't set to friends only.`);

                            message.channel.send(errorEmbed)
                            console.error(error);
                        });

                        message.guild.createChannel(`Team-1-Game-${sixmansarray[6].gameID}`, {
                                type: 'voice',
                                parent: message.channel.parentID,
                                permissionOverwrites: [{
                                        id: message.guild.defaultRole,
                                        deny: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[0].id,
                                        allow: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[1].id,
                                        allow: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[2].id,
                                        allow: "CONNECT"
                                    }
                                ]
                            })
                            .catch(console.error)

                        message.guild.createChannel(`Team-2-Game-${gameCount}`, {
                                type: 'voice',
                                parent: message.channel.parentID,
                                permissionOverwrites: [{
                                        id: message.guild.defaultRole,
                                        deny: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[3].id,
                                        allow: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[4].id,
                                        allow: "CONNECT"
                                    },
                                    {
                                        id: sixmansarray[5].id,
                                        allow: "CONNECT"
                                    }
                                ]
                            })
                            .catch(console.error)

                        sixmansarray.splice(0, sixmansarray.length);

                    }
                }
            };
        }
    };

};

module.exports = {
    name: ['q', "status", "leave", "report", "score", "cancel", "reset", "r", "c"],
    description: '6man bot',
    execute
};