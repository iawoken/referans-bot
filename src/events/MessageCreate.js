const Event = {
    name: "messageCreate",
    execute: async (client, message) => {
        if (!message.content.startsWith("!")) return;
        
        const args = message.content.slice(1).trim().split(' ');
        const cmdName = args.shift()?.toLowerCase();
        const command = client.commands.find((cmd) => cmd.usages.includes(cmdName));

        if (command) {
            command.executive({ client, message, args });
        }
    }
}

module.exports = Event;