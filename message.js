message = {
	invalidCredential : "Sorry the credentials you have provided is invalid",
	userLeave : "user has left the chat",

};
function cheer(user) {
	return `${user} has cheered in the chat`;
};

function beer (user,user2){
	return `${user} wants to give beer to ${user2} in the chat`;
};

module.export = {
	message : message,
	cheer: cheer(),
	beer: beer()
};