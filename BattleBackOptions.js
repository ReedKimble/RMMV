//=============================================================================
// BattleBackOptions.js
//=============================================================================

/*:
 * @plugindesc (v1.0.0) Provides additional options for auto battle backgrounds.
 * @author Reedo
 * @version 1.0.0
 * @license MIT
 *
 * @param Default Battleback1 Name
 * @desc The default image used for Battleback1 when no other image can be found.
 * @default Grassland
 *
 * @param Default Battleback2 Name
 * @desc The default image used for Battleback2 when no other image can be found.
 * @default Grassland
 *
 * @param Default Ship Battleback1 Name
 * @desc The default image used for Battleback1 when figting while onboard the ship.
 * @default Ship
 *
 * @param Default Ship Battleback2 Name
 * @desc The default image used for Battleback2 when figting while onboard the ship.
 * @default Ship
 *
 * @param Default Autotile Battlebacks 1
 * @desc The default image used for autotiles. Same as original game with addition of Lava Cave tiles and backgrounds.
 * @default [{"ids":[4,5],"back":"PoisonSwamp"},{"ids":[24,25],"back":"Wasteland"},{"ids":[26,27],"back":"DirtField"},{"ids":[32,33],"back":"Desert"},{"ids":[34],"back":"Lava1"},{"ids":[35],"back":"Lava2"},{"ids":[40,41],"back":"Snowfield"},{"ids":[42],"back":"Clouds"},{"ids":[1554,2272,3604],"back":"LavaCave"}]
 *
 * @param Default Autotile Battlebacks 2
 * @desc The default image used for autotiles. Same as original game with addition of Lava Cave tiles and backgrounds.
 * @default [{"ids":[4,5],"back":"PoisonSwamp"},{"ids":[20,21],"back":"Forest"},{"ids":[22,30,38],"back":"Cliff"},{"ids":[24,25,26,27],"back":"Wasteland"},{"ids":[32,33],"back":"Desert"},{"ids":[34,35],"back":"Lava1"},{"ids":[40,41],"back":"Snowfield"},{"ids":[42],"back":"Clouds"},{"ids":[1554,2272,3604],"back":"LavaCave"}]
 *
 * @help
 *
 * You can modify the behavior of the default auto-battleback system used by autotiles on non-world maps.
 * Set the plugin's parameter values according to the images you want to use by default when no other
 * condition has set a battleback.  The plugin defaults for autotiles contain the values used by the
 * default system, along with an addtional entry for the "Lava Cave" tiles (tiles and backgrounds come
 * with the default game).
 *
 * You can further customize the auto-battlebacks used on a per-map basis by putting tags in
 * the map's note window.  With this method you can specify the battleback to use based on either
 * a map region id, or a map tile terrain tag.
 * 
 * === Battlebacks via Map Region Id ===
 * Place the tag <region_bb:{data}> in a map's note box to load battle backgrounds by
 * map region id.
 *
 * <region_bb:{"backs":[{"b1":"BackImageName1","b2":"BackImageName2"},...],"regions":[[regionId,backIndex],...]}>
 * 
 * The data for a <region_bb> tag consists of a simple JSON object with two properties, "backs" and "regions".
 * The "backs" property value is another small JSON object with properties "b1" and "b2" whose values are the 
 * names of the images to use for Battleback1 and Battleback2, respectively.
 * The "regions" property value is a JSON array of arrays, where each inner-array holds a game map region Id
 * and index into the "backs" property value.  In this way, a region Id is associated with the index of an
 * entry in the "backs" property.
 *
 * === Battlebacks via Terrain Tag ===
 * Place the tag <ttag_bb:{data}> in a map's note box to load battle backgrounds by
 * map tile terrain tag value.
 *
 * <ttag_bb:{"backs":[{"b1":"BackImageName1","b2":"BackImageName2"},...],"tags":[[tagNumber,backIndex],...]}>
 * 
 * The data for a <ttag_bb> tag is nearly identical to the <region_bb> tag except that the "regions" property
 * is replaced with the "tags" property, and instead of map region Id values, terrain tag id values are used.
 */

 //Polyfill find() method on Array Object
 //SOURCE:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find

 if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

 //Main Script
(function() {
	var parameters = PluginManager.parameters('BattleBackOptions');
    var _DefaultBattleback1Name = String(parameters['Default Battleback1 Name'] || 'Grassland');
	var _DefaultBattleback2Name = String(parameters['Default Battleback2 Name'] || 'Grassland');
	var _DefaultShipBattleback1Name = String(parameters['Default Ship Battleback1 Name'] || 'Ship');
	var _DefaultShipBattleback2Name = String(parameters['Default Ship Battleback2 Name'] || 'Ship');
	var _DefaultAutotileBattlebacks1 = JSON.parse(String(parameters['Default Autotile Battlebacks 1'] || '[{"ids":[4,5],"back":"PoisonSwamp"},{"ids":[24,25],"back":"Wasteland"},{"ids":[26,27],"back":"DirtField"},{"ids":[32,33],"back":"Desert"},{"ids":[34],"back":"Lava1"},{"ids":[35],"back":"Lava2"},{"ids":[40,41],"back":"Snowfield"},{"ids":[42],"back":"Clouds"},{"ids":[1554,2272,3604],"back":"LavaCave"}]'));
	var _DefaultAutotileBattlebacks2 = JSON.parse(String(parameters['Default Autotile Battlebacks 2'] || '[{"ids":[4,5],"back":"PoisonSwamp"},{"ids":[20,21],"back":"Forest"},{"ids":[22,30,38],"back":"Cliff"},{"ids":[24,25,26,27],"back":"Wasteland"},{"ids":[32,33],"back":"Desert"},{"ids":[34,35],"back":"Lava1"},{"ids":[40,41],"back":"Snowfield"},{"ids":[42],"back":"Clouds"},{"ids":[1554,2272,3604],"back":"LavaCave"}]'));

	var _findId = -1;
	var _findTag = '';

	//--OVERRIDE SPRITESET_BATTLE CLASS---------------------------------------------------------------
	// modify battleback name methods to retrieve custom values, if any
	var _Spriteset_Battle_normalBattleback1Name = Spriteset_Battle.prototype.normalBattleback1Name;
	Spriteset_Battle.prototype.normalBattleback1Name = function() {
		var defVal = _Spriteset_Battle_normalBattleback1Name.call(this);
		var att = this.autotileType(0);
		var custBack = this.customTerrainBattleback1Name(att);
		return (custBack) ? custBack : defVal;
	};
	// modify battleback name methods to retrieve custom values, if any
	var _Spriteset_Battle_normalBattleback2Name = Spriteset_Battle.prototype.normalBattleback2Name;
	Spriteset_Battle.prototype.normalBattleback2Name = function() {
		var defVal = _Spriteset_Battle_normalBattleback2Name.call(this);
		var custBack = this.customTerrainBattleback2Name(this.autotileType(0));
		return (custBack) ? custBack : defVal;
	};
	
	// determine the custom battleback to use, if any; if not, return undefined
	// give the <region_bb> tag precedence over the <ttag_bb> tag
	Spriteset_Battle.prototype.customTerrainBattleback1Name = function(type) {
		var maptag = $dataMap.meta.region_bb;
		if (maptag != null) {
			var bbdat = JSON.parse(maptag);
			var regionId = $gameMap.regionId($gamePlayer.x, $gamePlayer.y);
			_findId = regionId;
			var f = this.findRegionId;
			var rd = bbdat.regions.find(f);
			var b = bbdat.backs[rd[1]];
			return b.b1;
		} else {
			maptag = $dataMap.meta.ttag_bb;
			if (maptag !=null) {
				var bbdat = JSON.parse(maptag);
				var tTag = $gameMap.terrainTag($gamePlayer.x, $gamePlayer.y);
				var td = bbdat.tags[tTag];
				var b = bbdat.backs[td[1]];
				return b.b1;
			}
		}
	};
	
	// determine the custom battleback to use, if any; if not, return undefined	
	Spriteset_Battle.prototype.customTerrainBattleback2Name = function(type) {
		var maptag = $dataMap.meta.region_bb;
		if (maptag != null) {
			var bbdat = JSON.parse(maptag);
			var regionId = $gameMap.regionId($gamePlayer.x, $gamePlayer.y);
			_findId = regionId;
			var f = this.findRegionId;
			var rd = bbdat.regions.find(f);
			var b = bbdat.backs[rd[1]];
			return b.b2;
		} else {
			maptag = $dataMap.meta.ttag_bb;
			if (maptag != null) {
				var bbdat = JSON.parse(maptag);
				var tTag = $gameMap.terrainTag($gamePlayer.x, $gamePlayer.y);
				var td = bbdat.tags[tTag];
				var b = bbdat.backs[td[1]];
				return b.b2;
			}
		}
	};
	
	// define method used by Array.find() extension when searching for RegionIds
	Spriteset_Battle.prototype.findRegionId = function(entry, index, array) { 
		return (entry[0] === _findId);
	};
	
	// define method used by Array.find() extension when searching for TerrainTags
	Spriteset_Battle.prototype.findTerrainTag = function(entry, index, array) { 
		return (entry[0] === _findTag);
	};
	
	// re-implement default battleback selection to use plugin parameter values for autotiles
	Spriteset_Battle.prototype.terrainBattleback1Name = function(type) {
		if (type === -1) { type = this.tileType(0); }
		for (var i=0; i<_DefaultAutotileBattlebacks1.length;i++) {
			if (_DefaultAutotileBattlebacks1[i].ids.contains(type)) {
				return _DefaultAutotileBattlebacks1[i].back;
			}
		}
	};

	// re-implement default battleback selection to use plugin parameter values for autotiles
	Spriteset_Battle.prototype.terrainBattleback2Name = function(type) {
		if (type === -1) { type = this.tileType(0); }
		for (var i=0; i<_DefaultAutotileBattlebacks2.length;i++) {
			if (_DefaultAutotileBattlebacks2[i].ids.contains(type)) {
				return _DefaultAutotileBattlebacks2[i].back;
			}
		}
	};

	// re-implement default battleback name to use plugin parameter values
	Spriteset_Battle.prototype.defaultBattleback1Name = function() {
		return _DefaultBattleback1Name;
	};

	// re-implement default battleback name to use plugin parameter values
	Spriteset_Battle.prototype.defaultBattleback2Name = function() {
		return _DefaultBattleback2Name;
	};

	// re-implement default ship battleback name to use plugin parameter values
	Spriteset_Battle.prototype.shipBattleback1Name = function() {
		return _DefaultShipBattleback1Name;
	};

	// re-implement default ship battleback name to use plugin parameter values
	Spriteset_Battle.prototype.shipBattleback2Name = function() {
		return _DefaultShipBattleback2Name;
	};

	// expose TileId of current tile on which player is standing to external callers
	Spriteset_Battle.prototype.tileType = function(z) {
		return $gameMap.tileId($gamePlayer.x, $gamePlayer.y, z);
	};

})();