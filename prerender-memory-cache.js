var cacheManager = require('cache-manager');
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
		console.log(`Stat updated!`);
	}
}

function sendStat() {
	console.log(`Statistics: ${JSON.stringify(stat)}`);
	stat.hits = 0;
	stat.misses = 0;
	stat.start = Date.now();
}

module.exports = {

	init: function() {
		this.cache = cacheManager.caching({
			store: 'memory', max: process.env.CACHE_MAXSIZE || 100, ttl: process.env.CACHE_TTL || 60 * 60 * 24 * 3 /*seconds*/
		});
		cache = this.cache;
		setInterval(updateStat, 10000);
		setInterval(sendStat, 60000);
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



