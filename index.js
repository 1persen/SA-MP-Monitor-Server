//@All Rights Reserved By Lord Rama
const { Client, ActivityType, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('./config.json');
const axios = require('axios');
const SampQuery = require('samp-query');
const cheerio = require('cheerio');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
    console.log('Bot is online!');
    const updateStatus = async () => {
        const serverCount = client.guilds.cache.size;
        const ip = config.SERVER_IP;
        const port = parseInt(config.SERVER_PORT, 10);

        // Mengambil status server dan jumlah pemain online
        let serverStatus = 'offline';
        let onlinePlayers = 0;
        const options = {
            host: ip,
            port: port
        };

        console.log(`Querying server at ${ip}:${port}`); // Tambahkan log untuk debugging

        SampQuery(options, (error, response) => {
            if (error) {
                console.error('Error fetching server status:', error);
            } else {
                serverStatus = 'online';
                onlinePlayers = response['online'];
                // Tambahkan log untuk pemain online
                console.log(`Pemain online: ${onlinePlayers}`);
                console.log('@All Rights Reserved By Lord Rama'); // Tambahkan log di sini
            }

            client.user.setPresence({
                activities: [
                    { name: `JGRP: ${serverStatus} ${onlinePlayers} \nPlayers`, type: ActivityType.Watching }, // Ubah teks menjadi dua baris
                    { name: `${serverCount} servers`, type: ActivityType.Watching } // Ubah type menjadi Watching
                ],
                status: 'online'
            });
        });
    };

    // Memperbarui status setiap 2 detik
    setInterval(updateStatus, 2000); // Memanggil updateStatus setiap 2000 ms (2 detik)
});

// cmd area

const prefix = config.PREFIX;

const checkServerAvailability = (ip, port) => {
    return new Promise((resolve, reject) => {
        const options = {
            host: ip,
            port: port,
            timeout: 5000 // Waktu tunggu 5 detik
        };

        const net = require('net');
        const socket = new net.Socket();

        socket.setTimeout(5000); // Waktu tunggu 5 detik
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        }).on('error', () => {
            reject(false);
        }).on('timeout', () => {
            socket.destroy();
            reject(false);
        }).connect(options);
    });
};

client.on('messageCreate', async message => {
    
    if (!message.content.startsWith(prefix) || message.author.bot) return; // Tambahkan ini untuk memeriksa prefix dan mengabaikan pesan dari bot

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        const ip = config.SERVER_IP;
        const port = parseInt(config.SERVER_PORT, 10);
        const options = {
            host: ip,
            port: port
        };

        SampQuery(options, (error, response) => {
            if (error) {
                message.channel.send('Tidak dapat mengambil ping server.');
                console.error('Error fetching server ping:', error);
            } else {
                const serverPing = response['ping'];
                const botPing = client.ws.ping;
                const userPing = Date.now() - message.createdTimestamp; // Hitung ping pengguna
                message.channel.send(`Ping Bot: ${botPing}ms\nPing Server: ${serverPing}ms\nPing Anda: ${userPing}ms`);
            }
        });
        
    }
    // Tambahkan perintah !ip
    if (command === 'ip') {
        const ip = config.SERVER_IP;
        const port = config.SERVER_PORT;
        message.channel.send(`IP Server Jogja Gamers Reality Project: ${ip}:${port}`);
    }
    // Tambahkan perintah !status
    if (command === 'status') {
        const ip = config.SERVER_IP;
        const port = parseInt(config.SERVER_PORT, 10);

        try {
            const response = await axios.get(`https://sam.markski.ar/api/GetServerByIP?ip_addr=${ip}`);
            if (response.data.success) {
                const serverData = response.data; // Menyimpan data server
                console.log(`Server Status: ${serverData.success}, Pemain Online: ${serverData.playersOnline}`); // Menampilkan informasi di konsol
                message.channel.send(`Status Server: ${serverData.success ? 'online' : 'offline'}\nPemain Online: ${serverData.playersOnline}\nMax Pemain: ${serverData.maxPlayers}\nNama: ${serverData.name}\nGame Mode: ${serverData.gameMode}`);
            } else {
                message.channel.send('Server tidak tersedia. Silakan coba lagi nanti.');
            }
        } catch (error) {
            message.channel.send('Tidak dapat mengambil status server.');
            console.error('Error fetching server status:', error);
        }
    }
    // Tambahkan perintah !about
    if (command === 'about') {
        const bannerUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_B1DOsYJd729eAO4GOMO1UoXekklKhwCVFA2x5NwkwdJ3pQBa6Z9zXqm2vd-iqWcflA&usqp=CAU';
        message.channel.send({
            embeds: [{
                image: {
                    url: bannerUrl
                }
            }]
        }).then(() => {
            message.channel.send('Jogja Gamers Reality Project adalah komunitas gaming yang berfokus pada game SA-MP.');
        });
    }

    // Tambahkan perintah !details
    if (command === 'details') {
        const ip = config.SERVER_IP;
        const port = parseInt(config.SERVER_PORT, 10);

        try {
            const response = await axios.get(`https://sam.markski.ar/api/GetServerByIP?ip_addr=${ip}`);
            if (response.data.success) {
                const serverData = response.data; // Menyimpan data server
                message.channel.send(`**Detail Server:**
- **Nama:** ${serverData.name}
- **IP:** ${serverData.ipAddr}
- **Game Mode:** ${serverData.gameMode}
- **Pemain Online:** ${serverData.playersOnline}/${serverData.maxPlayers}
- **Versi:** ${serverData.version}
- **Bahasa:** ${serverData.language}
- **Website:** [Link](${serverData.website})`);
            } else {
                message.channel.send('Server tidak tersedia. Silakan coba lagi nanti.');
            }
        } catch (error) {
            message.channel.send('Tidak dapat mengambil detail server.');
            console.error('Error fetching server details:', error);
        }
    }

    // Tambahkan perintah !help
    if (command === 'help') {
        const helpMessage = `
**Daftar Perintah:**
\`\`\`
${prefix}ping    - Menampilkan ping bot, server, dan pengguna.
${prefix}ip      - Menampilkan IP server.
${prefix}status  - Menampilkan status server dan jumlah pemain online.
${prefix}about   - Menampilkan informasi tentang komunitas.
${prefix}maker   - Menampilkan informasi pembuat bot.
${prefix}fitnah  - [target] [pesan fitnah] - Mengirim pesan fitnah ke target.
\`\`\`
        `;
        const bannerUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_B1DOsYJd729eAO4GOMO1UoXekklKhwCVFA2x5NwkwdJ3pQBa6Z9zXqm2vd-iqWcflA&usqp=CAU';
        message.channel.send({
            embeds: [{
                image: {
                    url: bannerUrl
                }
            }]
        }).then(() => {
            message.channel.send(helpMessage);
        });
    }

    // Tambahkan perintah !owner
    if (command === 'maker') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Instagram: zex.cartez')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://www.instagram.com/zex.cartez')
            );

        message.channel.send({
            content: 'Idea Maker By Lord Rama',
            components: [row]
        });
    }

    // Tambahkan perintah !fitnah
    if (command === 'fitnah') {
        if (args.length > 1) {
            const target = args[0];
            const fitnahMessage = args.slice(1).join(' ');
            message.channel.send(`@everyone ${target} ${fitnahMessage}`);
        } else {
            message.channel.send('Format perintah salah. Gunakan: !fitnah [target] [pesan fitnah]');
        }
        }
    
});
client.login(config.DISCORD_TOKEN);
//@All Rights Reserved By Lord Rama - 12/06/2024 
