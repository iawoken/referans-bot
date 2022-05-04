const { stripIndents } = require("common-tags");
const Model = require("../models/User");

const Event = {
    name: "guildMemberRemove",
    execute: async (client, member) => {
        if (member?.user?.bot) return;
        const Members = await Model.find({ Admin: member?.id });
        if (Members.length == 0) return;

        const Date = (InDate) => {
            const moment = require('moment-timezone');
            require('moment-duration-format');
            moment.locale('tr');

            const Month = {"01": "Ocak", "02": "Şubat", "03": "Mart", "04": "Nisan", "05": "Mayıs", "06": "Haziran", "07": "Temmuz", "08": "Ağustos", "09": "Eylül", "10": "Ekim", "11": "Kasım", "12": "Aralık"}
            return moment(InDate).tz("Europe/Istanbul").format("DD") + " " + Month[moment(InDate).tz("Europe/Istanbul").format("MM")] + " " + moment(InDate).tz("Europe/Istanbul").format("YYYY HH:mm")
        }

        for (let doc of Members) {
            const Member = member?.guild?.members?.cache.get(doc.Id);
            Member?.send(stripIndents`
            Selam <@${Member?.id}> 👋

            Referansınız olan <@${doc.Admin}>, sunucumuzdan ayrıldı. Bu sebepten ötürü sunucu içi referansınız sistem tarafından askıya alınmıştır.
            Kişinin sunucudan ayrılma sebebi henüz bilinmiyor. Sunucu içi üyelik işlemi için tekrardan referans komutunu uygulamanız gerekmektedir...

            Size hayatınızda başarılar diliyoruz, esenlikle kalın...
            `).catch(() => {});
            Member?.roles.set(Member?.roles.cache.clone().filter((role) => role.managed).map((role) => role.id).concat(client?.config?.UNVERIFIED));
            await Model.deleteMany({ Id: Member?.id })
        }
    }
}

module.exports = Event;