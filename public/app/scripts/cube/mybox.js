Game.script("mybox",  {
	start : function() {
		this.lol = "LOL";
	},

	update : function() {
		this.mesh.rotation.x += 0.01;
		player.rot.x = this.mesh.rotation.x;
		iosocket.emit("playerMove",player);
	}
})