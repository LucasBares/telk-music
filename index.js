const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const search = require('./yt-search/index.js');
var lyrics = require('./lyr/index.js');
module.exports = function (client, options) {
	// Get all options.
	let PREFIX = (options && options.prefix) || '!';
	let GLOBAL = (options && options.global) || false;
	let MAX_QUEUE_SIZE = (options && options.maxQueueSize) || 100;
	let ALLOW_ALL_SKIP = (options && options.anyoneCanSkip) || true;
	let TIMELIMIT = (options && options.timelimit) || true;
	let CLEAR_MSG = (options && options.deletemsg) || false;
	let SEARCHMSG = (options && options.searchmsg) || ':mag_right: **Searching**  \`{song}\` . . .';
	let ADDEDMSG = (options && options.addedmsg) || ':musical_note: Added **{song}** to the queue!';
	let PLAYMSG = (options && options.playmsg) || ':notes: Now Playing **{song}**!';
	let LOOPMSG = (options && options.loopmsg) || ':white_check_mark: loop turned **{toggle}**!';
	let API_KEY = (options && options.apikey) || "no";
	if (API_KEY.length < 10) return console.log("\"No U\" pls insert a valid API key")

	let queues = {};
	var somestuff = {};


	client.on('message', msg => {
		const message = msg.content.trim();
		if (msg.author.bot) return;
		if (message.toLowerCase().startsWith(PREFIX.toLowerCase())) {
			const command = message.substring(PREFIX.length).split(/[ \n]/)[0].toLowerCase().trim();
			const suffix = message.substring(PREFIX.length + command.length).trim();
			if(msg.channel.type === 'text') {
			if (!somestuff[msg.guild.id]) somestuff[msg.guild.id] = {
			  loop: 0,
				volume: 50,
			}
			}
			switch (command) {
				case 'play':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return play(msg, suffix);
				case 'p':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return play(msg, suffix);
				case 'search':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return play(msg, suffix);
				case 'skip':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return skip(msg, suffix);
				case 'queue':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return queue(msg, suffix);
				case 'pause':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return pause(msg, suffix);
				case 'resume':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return resume(msg, suffix);
				case 'volume':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return volume(msg, suffix);
				case 'leave':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return leave(msg, suffix);
				case 'stop':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return clearqueue(msg, suffix);
				case 'clearqueue':
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return clearqueue(msg, suffix);
				case "loop":
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
					return loop(msg, suffix);
				case "nowplaying":
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
				return np(msg)
				case "np":
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
				return np(msg)
				case "lyrics":
				if(msg.channel.type === 'dm') return msg.channel.send(':x: Perdon, \`' + command + ' \` solo puede ser utilizado en un servidor!')
				return lyric(msg)
			}
			if (CLEAR_MSG) {
				msg.delete();
			}
		}
	});

	function isAdmin(member) {
		return member.roles.find("name", "DJ");
	}

	function canSkip(member, queue) {
		if (ALLOW_ALL_SKIP) return true;
		else if (queue[0].requester === member.id) return true;
		else if (isAdmin(member)) return true;
		else return false;
	}

	function getQueue(server) {
		if (GLOBAL) server = '_';

		if (!queues[server]) queues[server] = [];
		return queues[server];
	}

	function np(msg) {
		const queue = getQueue(msg.guild.id);
		if (!queue[0]) return msg.channel.send(":x: No hay musica sonando.")
		var npmsg = PLAYMSG.replace("{song}", `${queue[0].title}`)
		msg.channel.send(npmsg)
	}

	function play(msg, suffix) {
		if (msg.member.voiceChannel === undefined) return msg.channel.send(':x: No estás en ningun canal de voz.');

		if (!suffix) return msg.channel.send(':x: Dame algo que reproducir, pendejo');

		const queue = getQueue(msg.guild.id);
		if (queue.length >= MAX_QUEUE_SIZE) {
			return msg.channel.send('No puedo agregar nada más a la queue!');
		}
var searchmsg = SEARCHMSG.replace("{song}", `${suffix}`)
		msg.channel.send(searchmsg).then(response => {
			var searchstring = suffix

			let opts = {
				key: API_KEY,
			}
			search(searchstring, opts, (err, results) => {
					if(err) {
						response.edit(":x: Link de canción invalida")
					console.log(err);
					return
				} else {
					if (TIMELIMIT) {
						ytdl.getInfo(results[0].link, function(err, info) {
					if (info.length_seconds >= 3600) return response.edit(":x: Solo puedo reproducir canciones que no exeda 1 hora")
					var addedmsg = ADDEDMSG.replace("{song}", `${results[0].title}`)
					results[0].requester = msg.author.id;
					var lolz = suffix.split(" ")
					results[0].requesttitle = lolz[0]
					response.edit(addedmsg).then(() => {
						queue.push(results[0])
						if (queue.length === 1) executeQueue(msg, queue);
					})
})
} else {
	var addedmsg = ADDEDMSG.replace("{song}", `${results[0].title}`)
	results[0].requester = msg.author.id;
	var lolz = suffix.split(" ")			
	results[0].requesttitle = lolz[0]
	response.edit(addedmsg).then(() => {
		queue.push(results[0])
		if (queue.length === 1) executeQueue(msg, queue);
	})
}
				}
				})
	})
}



	function skip(msg, suffix) {
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection === null) return msg.channel.send(':x: No hay musica sonando.');

		const queue = getQueue(msg.guild.id);

		if (!canSkip(msg.member, queue)) return msg.channel.send(':x: You cannot skip this as you didn\'t queue it.').then((response) => {
			response.delete(5000);
		});

		msg.channel.send('Pasando **' + queue[0].title + '**!');
		queue.splice(0, 0);

		const dispatcher = voiceConnection.player.dispatcher;
		if (voiceConnection.paused) dispatcher.resume();
		dispatcher.end();

	}

	function lyric(msg) {
		const queue = getQueue(msg.guild.id);
		if (!queue[0]) return msg.channel.send(":x: No hay musica reproduciendose!")
		var author = queue[0].channelTitle.replace("VEVO", "")
		lyrics.getLyrics(author, queue[0].title, function(err, title, lyrics) {
			var songtitle = queue[0].requesttitle
			if (title.indexOf(songtitle) >= 0) {
			if(lyrics === "Lyrics could not be found.") return msg.channel.send(":x: No pude encontrar nada con ese nombre")
		    var lyricembed = new Discord.RichEmbed()
				.setTitle(title + " lyrics")
				.setDescription(lyrics)
				msg.channel.send(lyricembed)
			} else {
				msg.channel.send(":x: No pude encontrar nada con ese nombre")
			}
		});
	}

	function queue(msg, suffix) {
		const queue = getQueue(msg.guild.id);
		const text = queue.map((video, index) => (
			(index + 1) + '. ' + video.title
		)).join('\n');


		let queueStatus = ':stop_button: No reproduciendo nada';
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection !== null) {
			const dispatcher = voiceConnection.player.dispatcher;
			queueStatus = dispatcher.paused ? ':pause_button: Pausada' : 'Reproduciendo \\🎶';
		}
var queueembed = new Discord.RichEmbed()
.setTitle("\\🎵 **Queue** \\🎵 - " + queueStatus)
.setDescription(text)
		msg.channel.send(queueembed);
	}

	function pause(msg, suffix) {
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection === null) return msg.channel.send(':x: No hay musica reproduciendose!');

		if (!isAdmin(msg.member))
			return msg.channel.send(':x: No tienes el rol de **Dj**');

		msg.channel.send('Playback paused.');
		const dispatcher = voiceConnection.player.dispatcher;
		if (!dispatcher.paused) dispatcher.pause();
	}


	function leave(msg, suffix) {
		if (isAdmin(msg.member)) {
			const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
			if (voiceConnection === null) return msg.channel.send(':x: No estoy en ningun canal.');
			somestuff[msg.guild.id].loop=0;
			const queue = getQueue(msg.guild.id);
			queue.splice(0, queue.length);

			voiceConnection.disconnect();
		} else {
			msg.channel.send(':x: No tienes el rol de **Dj**');
		}
	}

	function clearqueue(msg, suffix) {
		if (isAdmin(msg.member)) {
			const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
			if (voiceConnection === null) return msg.channel.send(':x: No estoy en ningun canal.');
			somestuff[msg.guild.id].loop=0;
			const queue = getQueue(msg.guild.id);
			queue.splice(0, queue.length);

			voiceConnection.disconnect();
		} else {
			msg.channel.send(':x: No tienes el rol de **Dj**');
		}
	}

	function resume(msg, suffix) {
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection === null) return msg.channel.send(':x: No hay musica sonando!');

		if (!isAdmin(msg.member))
			return msg.channel.send(':x: No tienes el rol de **Dj**');

		msg.channel.send('Playback resumed.');
		const dispatcher = voiceConnection.player.dispatcher;
		if (dispatcher.paused) dispatcher.resume();
	}

	function volume(msg, suffix) {
		const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
		if (voiceConnection === null) return msg.channel.send(':x: No hay musica sonando.');

		if (!isAdmin(msg.member))
			return msg.channel.send(':x: No tienes el rol de **Dj**');

		const dispatcher = voiceConnection.player.dispatcher;

		if (suffix > 200 || suffix < 0) return msg.channel.send('El numero que ingresaste es muy alto! *El maximo es de 200*').then((response) => {
			response.delete(5000);
		});
somestuff[msg.guild.id].volume=suffix
		msg.channel.send("Volumen al" + suffix + "%");
		dispatcher.setVolume((suffix/100));
	}

	function loop(msg, suffix) {
		if (suffix === "on") {
			var loopmsg = LOOPMSG.replace("{toggle}", `${suffix}`)
			msg.channel.send(loopmsg)
			somestuff[msg.guild.id].loop=1;
		} else if (suffix === "off") {
			var loopmsg = LOOPMSG.replace("{toggle}", `${suffix}`)
			msg.channel.send(loopmsg)
			somestuff[msg.guild.id].loop=0;
		} else {
			somestuff[msg.guild.id].loop++;
			if (somestuff[msg.guild.id].loop === 1) {
				var loopmsg = LOOPMSG.replace("{toggle}", ` Prendido!`)
				msg.channel.send(loopmsg)
			}
			if (somestuff[msg.guild.id].loop >= 2) {
				var loopmsg = LOOPMSG.replace("{toggle}", ` Apagado!`)
				somestuff[msg.guild.id].loop=0;
				msg.channel.send(loopmsg)
			}
		}
	}
	function executeQueue(msg, queue) {
		if (queue.length === 0) {
			const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
			if (voiceConnection !== null) return voiceConnection.disconnect();
		}

		new Promise((resolve, reject) => {
			const voiceConnection = client.voiceConnections.find(val => val.channel.guild.id == msg.guild.id);
			if (voiceConnection === null) {
				if (msg.member.voiceChannel) {
					msg.member.voiceChannel.join().then(connection => {
						resolve(connection);
					}).catch((error) => {
						console.log(error);
					});
				} else {

					queue.splice(0, queue.length);
					reject();
				}
			} else {
				resolve(voiceConnection);
			}
		}).then(connection => {
			const video = queue[0];
var playmsg = PLAYMSG.replace("{song}", `${video.title}`)
			msg.channel.send(playmsg).then(() => {
				let dispatcher = connection.playStream(ytdl(video.link, {filter: 'audioonly'}), {seek: 0, volume: (somestuff[msg.guild.id].volume/100)});
				connection.on('error', (error) => {
					if (somestuff[msg.guild.id].loop === 1) {queue.push(video)}
					console.log(error);
					queue.shift();
					executeQueue(msg, queue);
				});

				dispatcher.on('error', (error) => {
					if (somestuff[msg.guild.id].loop === 1) {queue.push(video)}
					console.log(error);
					queue.shift();
					executeQueue(msg, queue);
				});

				dispatcher.on('end', () => {
					if (somestuff[msg.guild.id].loop === 1) {queue.push(video)}
					setTimeout(() => {
						if (queue.length > 0) {
							queue.shift();
							executeQueue(msg, queue);
						}
					});
				});
			}).catch((error) => {
				console.log(error);
			});
		}).catch((error) => {
			console.log(error);
		});
	}
}