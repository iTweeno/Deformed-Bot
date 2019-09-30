const Discord = require('discord.js')
const fetch = require('node-fetch');


module.exports = {
    name: 'ptmemes',
    description: 'ur gay',
    execute(message) {
        fetch("https://reddit.com/r/memesportugal.json?limit=800")
            .then(response => response.json())
            .then(responseJson => {
                const data = responseJson.data;
                const allowed = message.channel.nsfw ? data.children : data.children.filter(post => !post.over_18);
                if (!allowed.length) return message.channel.send('Não tenho memes, para de me chatear.');
                const randomnumber = Math.floor(Math.random() * allowed.length)

                const discordEmbed = new Discord.RichEmbed()
                    .setColor('#F8534F')
                    .setTitle(allowed[randomnumber].data.title)
                    .setDescription("Posted by: " + allowed[randomnumber].data.author)
                    .setImage(allowed[randomnumber].data.url)
                    .addField("Other info:", "Upvotes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
                    .setURL("https://reddit.com" + allowed[randomnumber].data.permalink)
                    .setFooter("Memes de /r/portugalmemes");
                return message.channel.send(discordEmbed)
            })
    }
}