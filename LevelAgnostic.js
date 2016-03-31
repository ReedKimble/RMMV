//=============================================================================
// LevelAgnostic.js
//=============================================================================

/*:
 * @plugindesc (v1.0.0) Scales the primary parameters of enemies according to party level.
 * @author Reedo
 * @version 1.0.0
 * @license MIT
 *
 * @param Enemy Level Rate
 * @desc The default percentage rate at which the enemy's parameters scale up per level of the party.
 * @default 0.15
 *
 * @help
 * 
 * === Enemy Note Tag ===
 *  Place the <agnostic> tag in an enemy's note box to make that enemy scale by party level
 *  when used in troops.  If the tag contains no data then all of the enemy's parameters
 *  (hp, mp, attack, defense, magic attack, magic defense, agility and luck) are scaled
 *  by the default amount per level of the party.
 *
 *  Optionally, the tag may include data in the form of an array of eight floating point numbers
 *  representing the factor by which to scale each parameter. A value of zero indicates no change.
 *  For example: "<agnostic:[0.25, 0.25, 0.35, 0.25, 0.20, 0.15, 0.05, 0]>"
 *  This tag would scale the enemy's HP and MP by 25%, attack by 35%, defense by 25%, magic attack
 *  by 20%, magic defense by 15%, agility by 5%, and luck by 0% (no scaling).  If you do not
 *  supply a value for one of the entries in the array, the default rate will be used instead.
 */

//Main Script
(function() {
	//--STANDARD PLUGIN PARAMETERS------------------------------------------------------
	var parameters = PluginManager.parameters('LevelAgnostic');
    var _Rate = Number(parameters['Enemy Level Rate'] || '0.15');

	//--OVERRIDE GAME_ENEMY CLASS-------------------------------------------------------
	// whenever a base parameter value is requested, mutiply the result by the appropriate rate
	Game_Enemy.prototype.paramBase = function(paramId) {
		var delta = 1.0;
		if (this.enemy().meta.agnostic) { 
			delta = 1 + $gameParty.highestLevel() * Number(JSON.parse(this.enemy().meta.agnostic)[paramId] || _Rate); 
		}
		return Math.floor(this.enemy().params[paramId] * delta);
	};

})();