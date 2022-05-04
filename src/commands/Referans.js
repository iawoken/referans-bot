const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const Model = require("../models/User");

const Command = {
    usages: ["referans", "ref"],
    executive: async ({ client, message, args }) => {
        if (!message.member._roles.includes(client?.config?.UNVERIFIED)) return;
        const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!Member) return message.reply({content: `Hata: Geçerli bir kullanıcı etiketleyin veya ID'sini girin!`});
        if (!client?.config?.STAFFS.some((x) => Member._roles.includes(x))) return message.reply({content: `Hata: Belirttiğiniz kullanıcıyı referans olarak gösteremezsiniz!`});
        if (Member.id == message.author.id) return message.reply({content: `Hata: Kendinizi referans olarak gösteremezsiniz!`});

        const Schema = await Model.findOne({ Id: message.author.id });
        if (Schema && Schema?.Verified !== false) return message.reply({content: `Hata: Sistemde kayıtlı olarak gözükmektesiniz, bir üst yetkiliye ulaşınız!`})
    
        message.react(client?.config?.TICK);
        
        const row = new MessageActionRow().addComponents([
            new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId(`accept-${message.member.id}-${Member.id}`),
            new MessageButton().setStyle('DANGER').setLabel('Refuse').setCustomId(`refuse-${message.member.id}-${Member.id}`)
        ]);

        if (client.channels.cache.get(client?.config?.LOG)) {
            const Embed = new MessageEmbed().setColor("RANDOM").setAuthor({name: message?.guild?.name, iconURL: message?.guild?.iconURL({dynamic: true})})
            .setDescription(stripIndents`
            ${client?.config?.TICK} <@${message.author.id}> isimli kişi, <@${Member.id}> üyesini referans olarak gösterdi.

            Referansı kabul ediyor iseniz **Accept** butonuna tıklayınız.
            Referansı red ediyor iseniz **Refuse** butonuna tıklayınız.

            **__NOT:__** İşlemi sadece referans olarak gösterilen üye (<@${Member.id}>) tamamlayabilir.
            `)
            client.channels.cache.get(client?.config?.LOG)?.send({ embeds: [Embed], components: [row] });
        }
    }
}

module.exports = Command;
