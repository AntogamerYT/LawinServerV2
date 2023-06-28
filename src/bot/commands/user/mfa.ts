import { Hash } from "crypto";
import { EmbedBuilder } from "discord.js";

export { }

const { SlashCommandBuilder } = require('discord.js');
const Users = require('../../../model/user');
const Profiles = require('../../../model/profiles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mfa')
        .setDescription('Toggles the multi factor authentication for your account')
        .setDescriptionLocalizations({
            pl: 'Przełącza uwierzytelnianie wieloskładnikowe dla twojego konta',
            de: 'Aktiviert die Multi-Faktor-Authentifizierung für Ihr Konto',
            fr: 'Active l\'authentification à facteurs multiples pour votre compte',
        }),

    async execute(interaction) {

        const user = await Users.findOne({ discordId: interaction.user.id });
        if (!user) return interaction.reply({ content: "You are not registered!", ephemeral: true });

        if(!user.mfa) {
            await interaction.user.send("Checking if your dms are enabled to enable MFA. Ignore this message if you can see it. Deleting in 10 seconds").then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 10000);
            }).catch(() => {
                interaction.reply({ content: "Please enable your dms to use this command", ephemeral: true });
                return;
            });
        }

        const updatedUser = await Users.findOneAndUpdate({ discordId: interaction.user.id }, { mfa: !user.mfa }, { new: true });

        const embed = new EmbedBuilder()
            .setTitle(`MFA ${updatedUser.mfa ? "Enabled" : "Disabled"}`)
            .setDescription("MFA has been toggled")
            .setColor("#2b2d31")
            .addFields([
                {
                    name: "Username",
                    value: user.username,
                    inline: true
                },
                {
                    name: "Email",
                    value: user.email,
                    inline: true
                },
                {
                    name: "Account ID",
                    value: user.accountId
                },
            ])
            .setFooter({
                text: "Momentum",
                iconURL: "https://cdn.discordapp.com/app-assets/432980957394370572/1084188429077725287.png",
            })
            .setTimestamp();

        interaction.reply({ embeds: [embed], ephemeral: true });

    },
};