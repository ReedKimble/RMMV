//=============================================================================
// SimpleCrafting.js
//=============================================================================

/*:
 * @plugindesc (v1.0.0) Manages a simple, event-driven crafting session.
 * @author Reedo
 * @version 1.0.0
 * @license MIT
 *
 * @param Return Items
 * @desc Return the items used in the crafting attempt if no matching recipe was found.
 * @default true
 *
 * @help
 * === About ===
 * The Simple Crafting plugin allows you to easily componse a game event
 * with crafting functionality. Simple crafting involves supplying a series
 * of game items in a specific sequence and results in acquiring one or more
 * items. Items supplied as ingredients in the crafing recipie will be removed
 * from the party inventory as they are added to the crafting session.  If the
 * crafting session fails due to no matching recipie being found, the supplied
 * ingredients will be returned to the player inventory if the [Return Items] 
 * script parameter is set to 'true'.
 *
 * There are no ability attributes associated with crafting. The ability to craft
 * is based solely on access to the required ingredients and knowledge of the
 * recipe's crafting order (along with access to the event containing the crafting commands).
 *
 * === Recipe Data File ===
 *  You'll need to create a new CraftingRecipes.json file in the game's Data folder.
 *  The recipe data format is a simple JSON Array of JSON Objects, following the model of other data files.
 *  A recipe object takes the form of:
 *     {"id":1, "name":"a Striker", "crafts":["Striker"], "ingredients":["Flint", "Iron"]}
 *
 *  ==Example CraftingRecipes.json File==
 *  [
 *    null,
 *    {"id":1, "name":"a Striker", "crafts":["Striker"], "ingredients":["Flint", "Iron"]},
 *    {"id":2, "name":"some Sparkpowder", "crafts":["Sparkpowder","Sparkpowder","Sparkpowder"], "ingredients":["Iron", "Sulfur", "Stinger"]},
 *    {"id":3, "name":"a Crude Bomb", "crafts":["Crude Bomb"], "ingredients":["Hide", "Slime Residue", "Striker", "Sparkpowder"]}
 *  ]
 *
 *  Each recipe has the following properties:
 *    id            # The index number of the recipe; increment this for each new recipe added.
 *    name          # The name of the recipe; useful to store in sentence format for display in text messages.
 *    crafts        # The array of item names created by the recipe.
 *    ingredients   # The array of item names used in the recipe.
 *
 * === Crafting Session Event ===
 *  The actual crafting session that the player experiences is presented from an event.
 *  It is suggested that you create a new Common Event for crafting and execute it from
 *  a Map Event on an appropriate crafting-station-looking tile.
 *	
 *  The event might begin with a text mesage from the character announcing the beginning of the
 *  crafting session to the player.  The first step in crafting is then to call the "SimpleCrafting begin"
 *  Plugin Command.  This clears the last crafted recipe name and prepares a new crafting session.
 *  Next you will want to add a Label named something like "CraftingStart" to indicate the point
 *  in the event where the player makes selections.  Following this label you may then want to show
 *  the contents of the current crafting session.  See the "Text Message Slash Commans" section below
 *  for an example.
 *
 *  The next important step is to add a Show Choices command to the event.  The choices in the list
 *  should be "Add Item", "Begin Crafting", and "Cancel" or something similar.  Under the "Add Item"
 *  choice you will add a Select Item command and set the selected item to a particular game variable;
 *  pay attention to the Id number of the variable you select.  Follow the Select Item command with
 *  the Plugin Command "SimpleCrafting add varId" where "varId" is replaced with the Id number of the
 *  variable you set with the Select Item command.  Finally, use a JumpToLabel command to return to
 *  the "CraftingStart" label.
 *
 *  Under the "Begin Crafting" choice you may wish to show some text and/or begin playing sounds
 *  and animations, or shaking the screen to indicate that crafting is underway.  The important step
 *  is to call the Plugin Command "SimpleCrafting craft swId" where "swId" is the Id number of a
 *  game switch which holds the result of the crafting attempt.  Now you can follow the Plugin command
 *  with an If-Then-Else condition that tests if the specified game switch is on.  If the switch is on
 *  the crafting succeeded and the party gained an item. You can display text and sounds to indicate this.
 *  The name of the recipe crafted is available in your text message via a slash command (see below).
 *  If the switch is off then the crafting failed because no matching recipe was found.  In this case the
 *  items used in the crafting attempt are returned to the party inventory if the Return Items parameter
 *  is set to true in the plugin.  If the Return Items parameter is set to false then the items used
 *  in the crafting attempt are lost when the attempt fails.
 *
 *  Under the "Cancel" choice you can simply place the Plugin Command "SimpleCrafting cancel".  This
 *  will return any items which may have already been added to the session.
 *
 * === Plugin Commands ===
 *  SimpleCrafting begin           # Start a new crafting session
 *  SimpleCrafting add varId       # Add the item Id stored in variable # varId to the recipe
 *  SimpleCrafting cancel          # End the crafting session without crafting
 *  SimpleCrafting count varId     # Place the count of current ingredients in variable # varId
 *  SimpleCrafting craft           # Attempt to craft an item with the current ingredients
 *  SimpleCrafting restart         # Restarts the session, returning any selected ingredients
 *
 * === Text Message Slash Commands ===
 *  \CItem[n]   # Display the name of the nth ingredient currently selected.
 *                Returns an empty string if no item has been selected in that slot.
 *
 *  \CCount     # Display the number of ingredients currently selected.
 *
 *  \CLast      # Display the name of the last successfully crafted recipe.
 *
 *  You can use the slash commands in your crafting event's text messages to display
 *  the currently selected crafting contents.  An example would be the text:
 *
 *     \>\CCount Ingredients Selected:
 *     \>\CItem[0]   \CItem[1]   \CItem[2]
 *     \>\CItem[3]   \CItem[4]   \CItem[5]
 *     \>\CItem[6]   \CItem[7]   \CItem[8]
 *
 *  This displays the count of currently selected ingredients along with the
 *  names of up to the first nine items.  If an item does not yet exist an
 *  empty string will be returned instead.
 *
 *  If you have recipes with more than nine ingredients you can add a second
 *  text message window inside an If-Then condition.  Using the script command
 *  "count" you can get the current count of ingredients set to a variable and
 *  then check that variable value in the If condition.
 */

 //INTRODUCE NEW GLOBALS
 var $reedoCrafting = null;
 var $reedoRecipes = null;

//Main Script
(function() {
	//--STANDARD PLUGIN PARAMETERS AND COMMANDS------------------------------------------------------
	var parameters = PluginManager.parameters('SimpleCrafting');
	
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SimpleCrafting') {
            switch (args[0]) {
            case 'begin':
                $reedoCrafting.beginSession();
                break;
            case 'add':
                $reedoCrafting.addIngredient($gameVariables.value(Number(args[1])));
                break;
            case 'cancel':
                $reedoCrafting.endSession();
                break;
			case 'count':
				$reedoCrafting.getIngredientCount(Number(args[1]));
				break;
            case 'craft':
                $reedoCrafting.tryCraft(Number(args[1]));
                break;
            case 'restart':
                $reedoCrafting.clearSession();
                break;
            }
        }
    };

	//--DEFINE CRAFT_MANAGER CLASS--------------------------------------------------------------------
	function Craft_Manager() {
		this._sessionItems = [];
		this._returnOnFail = Boolean(parameters['Return Items'] || 'true');
		this.lastCrafted = "(none)"
	};

	// add an item to the current crafting session
	Craft_Manager.prototype.addIngredient = function (itemId) {
		var partyItems = $gameParty.items();
		for (var i = 0; i < partyItems.length; i++) {
			if (partyItems[i].id === itemId) {
				var item = partyItems[i];
				this._sessionItems.push(item);
				$gameParty.gainItem(item, -1, false);
				i = partyItems.length;
			}
		}
		
	};

	// start a new crafting session
	Craft_Manager.prototype.beginSession = function () {
		this.clearSession(true);
		this.lastCrafted = "(none)"
	};
	
	// clear items from the current crafting session, optionally returning them to the party inventory
	Craft_Manager.prototype.clearSession = function (returnItems) {
		if (returnItems) {
			for (var i = 0; i < this._sessionItems.length; i++) {
				$gameParty.gainItem(this._sessionItems[i], 1, false);
			}
		}
		this._sessionItems = [];
	};

	// end (cancel) a crafting session, returning any selected items to the party inventory
	Craft_Manager.prototype.endSession = function () {
		this.clearSession(true);
		this.lastCrafted = "(none)"
	};

	// search for a recipie matching the current list of selected items
	Craft_Manager.prototype.findRecipe = function() {
		var ingredientCount = this._sessionItems.length;
		for (var i = 1; i < $reedoRecipes.length; i++) {
			var recipe = $reedoRecipes[i];
			if (recipe.ingredients.length === ingredientCount) {
				if (recipe.ingredients.toString() === this.getItemNames().toString()) {
					return recipe;
				}
			}
		}
		return undefined;
	};

	// place the count of currently selected items into the specified game variable
	Craft_Manager.prototype.getIngredientCount = function(resultVarId) {
		$gameVariables.setValue(resultVarId, this._sessionItems.length);
	};

	// get an array of strings containing the name of each currently selected item
	Craft_Manager.prototype.getItemNames = function() {
		var result = [];
		for (var i = 0; i < this._sessionItems.length; i++) {
			result.push(this._sessionItems[i].name);
		}
		return result;
	}

	// return the count of currently selected items
	Craft_Manager.prototype.itemCount = function() {
		return this._sessionItems.length;
	};

	// attempt to craft something based on the currently selected items;
	// place the result of the attempt in the specified game switch;
	// if the attempt is successful, grant the party the items made by the recipe;
	// if the attempt fails, return the selected items to the party's inventory if the "Return Items" parameter is 'true'
	Craft_Manager.prototype.tryCraft = function(resultSwId) {
		var recipe = this.findRecipe();
		if (recipe) {
			for (var i = 0; i < recipe.crafts.length; i++) {
				var craftedItemName = recipe.crafts[i];
				for (var j = 1; j < $dataItems.length; j++) {
					if ($dataItems[j].name === craftedItemName) {
						var item = $dataItems[j];
						$gameParty.gainItem(item, 1, false);
						j = $dataItems.length;
					}
				}
			}
			this.lastCrafted = recipe.name;
			$gameSwitches.setValue(resultSwId, true);
			this.clearSession(false);
		} else {
			this.lastCrafted = "(none)"
			$gameSwitches.setValue(resultSwId, false);
			this.clearSession(this._returnOnFail);
		}
	};
	//--END CRAFT_MANAGER CLASS--------------------------------------------------------------------

	//--OVERRIDE DATA_MANAGER CLASS---------------------------------------------------------------
	//ADD RECIPE DATA FILE TO DATAMANAGER
	DataManager._databaseFiles.push({ name: '$reedoRecipes', src: 'CraftingRecipes.json'});
	//CREATE CRAFTING INSTANCE
	var _DataManager_createGameObjects = DataManager.createGameObjects;
	DataManager.createGameObjects = function() {
		_DataManager_createGameObjects.call(this);
		$reedoCrafting = new Craft_Manager();
	};
	//--END DATA_MANAGER CLASS--------------------------------------------------------------------

	//--OVERRIDE WINDOW_BASE CLASS---------------------------------------------------------------
    //PROCESS \CItem[], \CCount, and \CLast ESCAPE CODE IN WINDOW MESSAGE TEXT
    var _Window_Base_ConvertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        text = _Window_Base_ConvertEscapeCharacters.call(this, text);
        text = text.replace(/\x1bCItem\[([0-9]+)\]/gi, function () {
			var itemNames = $reedoCrafting.getItemNames();
			var itemName = itemNames[Number(arguments[1])];
            return (itemName) ? itemName : "";
        }.bind(this));
		text = text.replace(/\x1bCLast/gi, function () {
            return $reedoCrafting.lastCrafted;
        }.bind(this));
		text = text.replace(/\x1bCCount/gi, function () {
            return $reedoCrafting.itemCount();
        }.bind(this));
        return text;
    };
	//--END WINDOW_BASE CLASS--------------------------------------------------------------------

})();