const Model = require("../models/User");
const { MessageActionRow, MessageButton } = require("discord.js");
const { stripIndents } = require("common-tags");

const Event = {
    name: "interactionCreate",
    execute: async (client, interaction) => {
        if (!interaction.isButton()) return;
        const Guild = client.guilds.cache.get(client?.config?.GUILD) || client.guilds.cache.first(); 

        if (interaction?.customId.startsWith("accept")) {
            const Member = Guild.members.cache.get(interaction?.customId.split("-")[1]);
            const Referans = Guild.members.cache.get(interaction?.customId.split("-")[2]);
            if (!Member || !Referans) return interaction.reply({content: `Hata: Üye veya referans sahibi sunucuda bulunamadı.`, ephemeral: true});;
            const Schema = await Model.findOne({Id: Member.id});
            if (interaction.member.id !== Referans.id) return interaction.reply({content: `Hata: Sadece referans sahibi kullanıcı, kişiyi sunucuya kabul edebilir.`, ephemeral: true});
            if (Schema && Schema?.Verified !== false) return interaction.reply({content: `Hata: Bu kişinin referansı halihazırda kabul edilmiş.`, ephemeral: true});

            Member.roles.set(Member.roles.cache.clone().filter((role) => role.managed).map((role) => role.id).concat(client?.config?.VERIFIED));
            await Model.findOneAndUpdate(
                { Id: Member.id },
                { $set: { Verified: true, Admin: interaction.member.id, Joined: Date.now() } },
                { upsert: true }
            );

            Member.send(stripIndents`
            Selam <@${Member?.id}> 👋

            Sunucumuzda kayıt işlemin referansın olan <@${Referans.id}> tarafından gerçekleştirildi!
            Sunucu içerisinde ki tüm aktiviten kayıt altına alınmaktadır bu sebepten ötürü alacağın herhangi bir cezadan referansın olan kişi de sorumlu tutulacaktır!
            Sorun teşkil eden kişiler sunucumuzda barınamaz, sistemlerimizden kalıcı olarak yasaklanırlar.

            Eğlenceli vakit geçirmen dileğiyle, esenlikle kal...
            `).catch(() => {});

            const row = new MessageActionRow().addComponents([
                new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId(`accept-${Member.id}-${Referans.id}`).setDisabled(true),
                new MessageButton().setStyle('DANGER').setLabel('Refuse').setCustomId(`refuse-${Member.id}-${Referans.id}`).setDisabled(true)
            ]);

            interaction.reply({ content: `<@${Member.id}> üyesi başarılı bir şekilde sunucuya kayıt edildi.`, ephemeral: true })
            if (interaction.message) interaction.message?.edit({ components: [row] });
            return interaction;
        } else if (interaction?.customId.startsWith("refuse")) {
            const Member = Guild.members.cache.get(interaction?.customId.split("-")[1]);
            const Referans = Guild.members.cache.get(interaction?.customId.split("-")[2]);
            if (!Member || !Referans) return interaction.reply({content: `Hata: Üye veya referans sahibi sunucuda bulunamadı.`, ephemeral: true});;
            const Schema = await Model.findOne({Id: Member.id});
            if (interaction.member.id !== Referans.id) return interaction.reply({content: `Hata: Sadece referans sahibi kullanıcı, kişiyi sunucuya kabul edebilir.`, ephemeral: true});
            if (Schema && Schema?.Verified == true) return interaction.reply({content: `Hata: Bu kişinin referansı kabul edilmiş bu sebepten ötürü işleminiz iptal edildi.`, ephemeral: true});
            
            await Model.deleteMany({ Id: Member.id });
            const row = new MessageActionRow().addComponents([
                new MessageButton().setStyle('SUCCESS').setLabel('Accept').setCustomId(`accept-${Member.id}-${Referans.id}`).setDisabled(true),
                new MessageButton().setStyle('DANGER').setLabel('Refuse').setCustomId(`refuse-${Member.id}-${Referans.id}`).setDisabled(true)
            ]);

            Member.send(stripIndents`
            Selam <@${Member?.id}> 👋

            Sunucuya kayıt talebin <@${Referans.id}> tarafından reddedildi!
            
            Sebebi şunlardan herhangi birisi olabilir;
            \`1\` Kişi, sizi tanımıyor veyahut referans olmak istemiyor.
            \`2\` Sicil kayıtınız çok kabarık bu nedenle sunucu düzenini bozacağınızdan korkuyor.
            \`3\` Sorun teşkil edebilecek özelliklere sahip olduğunuzu tespit etmiş olabilir.
            `).catch(() => {});

            interaction.reply({ content: `<@${Member.id}> üyesinin talebi başarılı bir şekilde reddedildi.`, ephemeral: true })
            if (interaction.message) interaction.message?.edit({ components: [row] });
            return interaction;
        }
    }
}

module.exports = Event;
