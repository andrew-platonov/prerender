var cacheManager = require('cache-manager');
const TelegramBot = require('node-telegram-bot-api');

const token = '6580099025:AAHPCIXg6ml5waXlm6lgutS5ZsklHh0Mf98';
const chatId = -749894895;
const bot = new TelegramBot(token, {polling: true});

var stat = {
	totalHits: 0, 
	totalMisses: 0, 
	hits: 0, 
	misses: 0, 
	keys: 0,
	size: 0,
	totalStart: Date.now(), 
	start: Date.now()
};
var cache;

function updateStat() {
	if( cache ) {
		cache.keys().then( keys => {
			stat.keys = keys.length;
			stat.size = 0;
			keys.forEach((key) => {
				cache.get(key, function (err, content) {
					if (!err && content) {
						stat.size += Buffer.from(content).length;
					}
				});
			});
		});
		console.log(`Stat updated.`);
	}
}

function sendStat() {
	console.log(`Statistics: ${JSON.stringify(stat)}`);
	bot.sendMessage(chatId, getHumanStatistics());
	stat.hits = 0;
	stat.misses = 0;
	stat.start = Date.now();
}

function getHumanStatistics() {
	return `Cache: ${stat.keys} keys of ${ Math.round(stat.size / 1024 / 1024 * 10) / 10 } Mb.
Total (started at ${new Date(stat.totalStart).toLocaleString('ru-ru')})
- hits  : ${stat.totalHits}
- misses: ${stat.totalMisses}
	
Last (started at ${new Date(stat.start).toLocaleString('ru-ru')})
- hits  : ${stat.hits}
- misses: ${stat.misses}`;
}

bot.on('message', (msg) => {
	console.log(msg);
	bot.sendMessage(msg.chat.id, `Message: ${JSON.stringify(msg)}\n\nCurrent statistics: ${JSON.stringify(stat)}`);
	bot.sendMessage(msg.chat.id, getHumanStatistics());
});

module.exports = {

	init: function() {
		this.cache = cacheManager.caching({
			store: 'memory', max: process.env.CACHE_MAXSIZE || 1000, ttl: process.env.CACHE_TTL || 60 * 60 * 24 * 3 /*seconds*/
		});
		cache = this.cache;
		setInterval(updateStat, (60 * 10 *  1) * 1000); // each 10 min
		setInterval(sendStat  , (60 * 60 * 24) * 1000); // once a day
	},

	requestReceived: function(req, res, next) {
		this.cache.get(req.prerender.url, function (err, result) {
			if (!err && result) {
				req.prerender.cacheHit = true;
				stat.hits ++;
				stat.totalHits ++;
				res.send(200, result);
			} else {
				stat.misses ++;
				stat.totalMisses ++;
				next();
			}
		});
	},

	beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, req.prerender.content);
		}
		next();
	},
};



