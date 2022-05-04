const Discord = require("discord.js");
const { readdirSync } = require("fs");
const { resolve } = require("path");

class Utils {
    constructor(CLI) {
        this.client = CLI
    }

    async loadEvents() {
        const files = readdirSync(resolve(__dirname, '..', 'events'));
        for (const file of files) {
            const event = await (require(resolve(__dirname, '..', 'events', file)));
            this.client.on(event.name, (...args) => event.execute(this.client, ...args));
        }
    }

    async loadCommands() {
        const commandFiles = readdirSync(resolve(__dirname, '..', 'commands'));
        for (const name of commandFiles) {
            const command = await (require(resolve(__dirname, '..', 'commands', name)));
            this.client.commands.set(command.usages?.[0], command);
        }
    }
}

module.exports = Utils;