const Discord = require("discord.js");
const Mongoose = require("mongoose");
const Utils = require("./Utils");

class Client extends Discord.Client {
    constructor(structures) {
        super({
            presence: { activities: [{ name: "Created by awoken", type: "WATCHING" }] },
            partials: [
                Discord.Constants.PartialTypes.GUILD_MEMBER,
                Discord.Constants.PartialTypes.MESSAGE,
                Discord.Constants.PartialTypes.CHANNEL,
                Discord.Constants.PartialTypes.USER,
                Discord.Constants.PartialTypes.REACTION
            ],
            intents: [
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MEMBERS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_PRESENCES,
                Discord.Intents.FLAGS.GUILD_VOICE_STATES,
                Discord.Intents.FLAGS.GUILD_BANS,
                Discord.Intents.FLAGS.GUILD_INVITES,
                Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
                Discord.Intents.FLAGS.GUILD_WEBHOOKS
            ],
            ...structures
        })

        this.Utils = new Utils(this);
        this.commands = new Discord.Collection()
        this.events = new Discord.Collection()
        this.config = require("../../Settings.js");
    }

    async Build() {
        this.login(this.config.TOKEN)
        .then(() => console.log("Discord ile bağlantı kuruldu."))
        .catch(() => console.log("Discord ile bağlantı kurulamadı."));

        await this.Utils.loadEvents();
        await this.Utils.loadCommands();

        await Mongoose.connect(this.config.URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        return this;
    }
}

module.exports = Client;
