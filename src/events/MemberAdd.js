const { stripIndents } = require("common-tags");

const Event = {
    name: "guildMemberAdd",
    execute: async (client, member) => {
        if (member?.user?.bot) return;
        
        const Date = (InDate) => {
            const moment = require('moment-timezone');
            require('moment-duration-format');
            moment.locale('tr');

            const Month = {"01": "Ocak", "02": "Şubat", "03": "Mart", "04": "Nisan", "05": "Mayıs", "06": "Haziran", "07": "Temmuz", "08": "Ağustos", "09": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık"}
            return moment(InDate).tz("Europe/Istanbul").format("DD") + " " + Month[moment(InDate).tz("Europe/Istanbul").format("MM")] + " " + moment(InDate).tz("Europe/Istanbul").format("YYYY HH:mm")
        }

        if (client?.channels?.cache.get(client?.config?.WELCOME)) {
            client?.channels?.cache.get(client?.config?.WELCOME)?.send(stripIndents`
            Sınır kapısına hoş geldin <@${member.id}> 👋

            Hesabın **${Date(member?.user?.createdTimestamp)}** tarihinde oluşturulmuş.
            Sunucuya kayıt olabilmen için sağ taraftaki herhangi birine referans talebinde bulunman gerekmektedir. Talebin onaylandığı taktirde sunucumuza tam erişim yetkisi kazanacaksın!

            🎉🎉 Seninle birlikte sunucumuz **${member?.guild?.members?.cache.size ?? 0}** kişi oldu.
            `);
        }
        
        member?.roles.set(member?.roles.cache.clone().filter((role) => role.managed).map((role) => role.id).concat(client?.config?.UNVERIFIED));
    }
}

module.exports = Event;
