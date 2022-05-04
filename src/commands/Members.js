const { MessageActionRow, MessageButton, MessageEmbed, Interaction } = require("discord.js");
const { stripIndents } = require("common-tags");
const Model = require("../models/User");

const Command = {
    usages: ["referanslarım", "referanslar", "members"],
    executive: async ({ client, message, args }) => {
        const Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
        const Yanki = await Model.find({ Admin: Member.id }).sort({ Joined: -1 });
        const Schema = await Model.findOne({ Id: Member.id });
        if (Yanki.length == 0) return message.reply({content: `Hata: Belirtilen üyeyi referans olarak gösteren herhangi bir kullanıcı bulunmuyor.`})

        const EmbedHeader = stripIndents`
        Selam <@${Member.id}> 👋

        Sunucumuza kayıt olabilmek için sizleri referans gösteren tüm kullanıcılar aşağıda sistematik bir şekilde sıralandırılmıştır.
        Bu kişiler sizin referansınız iptal edilene kadar sunucumuza tam erişim sağlayabilecekler. Referans/Üyelik iptali için yönetim üyelerine başvurunuz!
        `;

        const Embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor({ name: message?.guild?.name, iconURL: message?.guild?.iconURL({dynamic: true}) })
        .setDescription(EmbedHeader)
        
        const UwU = Yanki.map((Awoken) => {
            return {
                User: Awoken.Id,
                Joined: Awoken.Joined
            }
        });
        
        const chunk = (array, count) => {
            let myArray = Array.from(array);
            let tempArray = [];
            for (let index = 0; index < myArray.length; index += count) {
                let chunk = myArray.slice(index, index + count);
                tempArray.push(chunk);
            }
            return tempArray;
        }

        const Date = (InDate) => {
            const moment = require('moment-timezone');
            require('moment-duration-format');
            moment.locale('tr');

            const Month = {"01": "Ocak", "02": "Şubat", "03": "Mart", "04": "Nisan", "05": "Mayıs", "06": "Haziran", "07": "Temmuz", "08": "Ağustos", "09": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık"}
            return moment(InDate).tz("Europe/Istanbul").format("DD") + " " + Month[moment(InDate).tz("Europe/Istanbul").format("MM")] + " " + moment(InDate).tz("Europe/Istanbul").format("YYYY HH:mm")
        }

        let Index = 0, Haha = 0;
        const Chunked = chunk(UwU, 10);
        const row = new MessageActionRow().addComponents([
            new MessageButton().setStyle('PRIMARY').setLabel('👈').setCustomId("back"),
            new MessageButton().setStyle('PRIMARY').setLabel('📛').setCustomId("stop"),
            new MessageButton().setStyle('PRIMARY').setLabel('👉').setCustomId("go")
        ]);

        Embed.setFooter({ text: `Sayfa ${Index+1}/${Chunked.length}` })
        Embed.description += `\n\n${Chunked?.[Index]?.map((of, pf) => `\`\u200b ${pf+1} \u200b\` <@${of.User}>: **${Date(of.Joined)}**`).join("\n")}`
        
        message.channel.send({ embeds: [Embed], components: [row] }).then(async (msg) => {
            const collector = await msg.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: (component) => component.user.id === message.author.id,
                time: 120000
            });
            
            collector.on("collect", async (interaction) => {
                interaction.deferUpdate();
                switch(interaction.customId) {
                    case "back":
                        Index = Index > 0 ? --Index : Chunked.length-1;
                        Embed.setFooter({ text: `Sayfa ${Index+1}/${Chunked.length}` })
                        Embed.description = `${EmbedHeader}\n\n${Chunked?.[Index]?.map((of, pf) => `\`\u200b ${pf+1} \u200b\` <@${of.User}>: **${Date(of.Joined)}**`).join("\n")}`
                        if (msg) msg.edit({ embeds: [Embed], components: [row] });
                        break
                    
                    case "go":
                        Index = (Index +1) < Chunked.length ? ++Index : 0;
                        Embed.setFooter({ text: `Sayfa ${Index+1}/${Chunked.length}` })
                        Embed.description = `${EmbedHeader}\n\n${Chunked?.[Index]?.map((of, pf) => `\`\u200b ${pf+1} \u200b\` <@${of.User}>: **${Date(of.Joined)}**`).join("\n")}`
                        if (msg) msg.edit({ embeds: [Embed], components: [row] });
                        break

                    case "stop":
                        collector.stop()
                        break

                    default:
                        collector.stop()
                        break
                }
            })

            collector.on("end", async (interaction) => {
                row.components[0].setDisabled(true)
                row.components[1].setDisabled(true)
                row.components[2].setDisabled(true)
                if (msg) msg.edit({ components: [row] });
            })
        });
    }
}

module.exports = Command;
