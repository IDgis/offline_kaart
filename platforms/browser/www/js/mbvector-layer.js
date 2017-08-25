// inspired by: https://github.com/coomsie/topomap.co.nz/blob/master/Resources/leaflet/TileLayer.DB.js
L.VectorGrid.Protobuf.MBVector = L.VectorGrid.Protobuf.extend({
    //db: SQLitePlugin
	mbTilesDB: null,
    
    initialize: function(url, options, db) {
        this.mbTilesDB = db;

        console.log(options);

        L.VectorGrid.prototype.initialize.call(this, options);
    },
    _getVectorTilePromise: function(coords) {
		var data = {
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: coords.z
// 			z: this._getZoomForUrl()	/// TODO: Maybe replicate TileLayer's maxNativeZoom
		};
		// if (this._map && !this._map.options.crs.infinite) {
		// 	var invertedY = this._globalTileRange.max.y - coords.y;
		// 	if (this.options.tms) { // Should this option be available in Leaflet.VectorGrid?
		// 		data['y'] = invertedY;
		// 	}
		// 	data['-y'] = invertedY;
        // }

        var sql = 'SELECT tile_data AS tile_data_64 FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?';

        var geodata = this.mbTilesDB.transaction(function (tx) {
			tx.executeSql(sql, [data.z, data.x, data.y], function (tx, rs) {
				console.log('SELECT success');

				return rs.rows.item(0).tile_data;		
			}, function (tx, error) {
				console.log('SELECT error: ' + error.message);
			});
        });
        
        console.log('about to decode');
        
		return geobuf.decode(new Pbf(geodata));
	}
});
