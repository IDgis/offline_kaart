function onBodyLoad() {
	document.addEventListener("deviceready", go, false);
}

var localFileName;	// the filename of the local mbtiles file
var localFileDir;

localFileName = 'brt_achtergrondkaart.mbtiles';
// localFileName = 'the_netherlands.mbtiles';
localFileDir = 'CA-app/tiles';

function go() {
	
	var fileSystemToGet = cordova.file.externalRootDirectory;
	var devicePlatform = device.platform;
	
	console.log('requesting file system ' + fileSystemToGet);
	
	window.resolveLocalFileSystemURL(fileSystemToGet, function (rootDir) {
		console.log('file system root retrieved: ' + rootDir.toURL());

		// check to see if files already exists
		rootDir.getDirectory(localFileDir, {create: false}, function (dir) {
			console.log('dir ' + localFileDir + ' exists');
			
			dir.getFile(localFileName, {create: false}, function (file) {
				console.log('file ' + localFileName + ' exists');
			});
			
			buildMap(dir.toURL());
		}, function () {
			// file does not exist
			console.log('file ' + localFileName + ' does not exist');
		});
	}, function () {
		console.log('file system not retrieved');
	});
}

function buildMap(databaseDirURL) {
	console.log('connecting to ' + localFileName + ' in ' + databaseDirURL);
	
	var options = {
		name: localFileName,
		androidDatabaseLocation: databaseDirURL,
		iosDatabaseLocation: 'Library'
	}

	var db = window.sqlitePlugin.openDatabase(options);
	
	db.transaction(function (tr) {
		tr.executeSql("SELECT upper('Test string') AS upperString", [], function (tr, rs) {
			var result = rs.rows.item(0).upperString;
			
			console.log('Got upperString result: ' + result);
			
			if (result == 'TEST STRING') {
				console.log('DB test successfull');
				onDBTestSuccess(db);
			}
		});
	});
}

function onDBTestSuccess(db) {
	var map = L.map('map').setView([0, 0], 4);

	var lyr = new L.TileLayer.MBTiles('', {crs: L.CRS.RD, maxZoom: 9, tms: true}, db).addTo(map);
	// var lyr = new L.VectorGrid.Protobuf.MBVector('', {crs: L.CRS.RD, tms: true}, db).addTo(map);
}
