//=============================================================================
// NoItemCommand.js
//=============================================================================

/*:
 * @plugindesc (v1.0.0) Prevents actors from having the Item command in battle
 * @author Reedo
 * @version 1.0.0
 * @license MIT
 *
 * @help
 *
 * This plugin does not use commands or parameters.
 * 
 * Place the tag <no_item> in an actor's note box to prevent the item command
 * from displaying in battle.
 */

//Main Script
(function() {

	//--OVERRIDE WINDOW_ACTORCOMMAND CLASS-------------------------------------------------------
	// whenever the actor command window tries to add the item command, skip it if the <no_item> tag exists
	Window_ActorCommand.prototype.addItemCommand = function() {
		var a = this._actor.actor();
		var flag = a.meta.no_item;
		if (!flag) {
			this.addCommand(TextManager.item, 'item');
		}
	};

})();