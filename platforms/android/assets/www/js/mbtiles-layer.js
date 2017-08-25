// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.TileLayer.MBTiles = L.TileLayer.extend({
	//db: SQLitePlugin
	mbTilesDB: null,

	initialize: function(url, options, db) {
		this.mbTilesDB = db;

		console.log(options);

		L.Util.setOptions(this, options);
	},
	getTileUrl: function (coords, tile, callback) {
		var z = this._getZoomForUrl();
		var x = coords.x;
		// var y = coords.y;
		var y = Math.pow(2, z) - coords.y - 1; // manual conversion to TMS because 'tms: true' has no effect (because of the CRS perhaps)
		var base64Prefix = 'data:image/png;base64,';

		var sql = 'SELECT BASE64(tile_data) AS tile_data_64 FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?';
		
		console.log('\'%s\', [%d, %d, %d]', sql, z, x, y);

		this.mbTilesDB.transaction(function (tx) {
			tx.executeSql(sql, [z, x, y], function (tx, rs) {
				console.log('SELECT success');

				var base64Data = rs.rows.item(0).tile_data_64;

				tile.src = base64Prefix + base64Data;
				
				callback(base64Prefix + base64Data);
			}, function (tx, error) {
				console.log('SELECT error: ' + error.message);
			});
		});
	},
	createTile: function (coords, done) {
		var tile = document.createElement('img');

		if (this.options.crossOrigin) {
			tile.crossOrigin = '';
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = '';

		/*
		 Set role="presentation" to force screen readers to ignore this
		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
		*/
		tile.setAttribute('role', 'presentation');

		this.getTileUrl(coords, tile, function(src) {
			tile.src = src;

			done(null, tile);
		});

		return tile;
	}
});
