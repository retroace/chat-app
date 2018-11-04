var user = {
	id: "",
	name: ""
};

var room = {
	name: '',
	token: ''
};

$('#hide-sidebar').click(function(e){
	$('#chat-lists').hide();
	
	$('#chat-section').css({
		margin: 'auto',
		float: 'none'
	});
});

$('#name-form').submit(function(e){
	e.preventDefault();
	$('#nameSubmit').click();
	return false;
});

$('#clear-chat').click(function(e){
	$('#chat-message').text(" ");
});

// Initializing socket io
var socket = io();

if (typeof(Storage) != 'undefined') {
	var chatData = getDataStoredInBrowser();
}

if (typeof(chatData) != 'undefined' && chatData != null) {
	chatData = JSON.parse(chatData);
	user.id = chatData.id;
	user.name = chatData.name;
	
	console.log('chatSesison stored');
	$('#chat-overlay').hide();

	socket.emit('register', JSON.stringify(user));

}else{

	$('#nameSubmit').click(function(e){
		e.preventDefault();
		var name = $('#name');
		var nameLength = $('#name').val().length; 
		
		if (nameLength > 4) {
			// Hiding chat overlay asking name
			$('#chat-overlay').hide();
			
			// User generated value
			user.id = Math.random().toString(36).substring(3,16) + +new Date;
			user.name = name.val();

			setDataInBrowser(user);

			// hiding name and setting type to hidden
			name.attr('value',name);
			name.attr('type','hidden');

			socket.emit('newUser',user.name);
	
			$('#m').attr('placeholder','Enter a message '+ user.name);
	
			$('#chat-container-title').text(user.name+ " has connected to chat").css('color','green');
			

		}else{
			var error = "<p class='text-error'>Name must be greater than four char</p>"+ nameLength;
			if ($('.text-error').length == 0) {
				$(error).insertBefore('#name');
			}
		}
	})
}

socket.on('totalUsers', function(totalUsers) {
	$('#total-users').text(totalUsers);
	console.log(totalUsers);

});

socket.on('userDisconnected', function(msg) {
	$('#chat-container-title').text(msg).css('color','red');
	
});

$('.action-beer').click(function(e){
	socket.emit('action',user.name +" has cheered")
});

$('#chat-form').submit(function(e){
	e.preventDefault();
	var msgField = $('#m');
	var msg = $('#m').val();

	if (msg.trim().length == 0 ) {
		msgField.attr('autofocus','autofocus');
		msgField.val('');
		return false;
	}
	
	socket.emit('chat message', msg);

	var message = "<p class='user'><span> "+msg+"</span></p>";
	$(message).appendTo('#chat-message');
	
	msgField.val('');
	
	// Scrolling to the bottom of the chat
	var chatMessage = document.getElementById('chat-message');
	chatMessage.scrollTo(0,chatMessage.scrollHeight);

	// Emoticons
	$('#chat-message').emoticonize({
		animate:false,
	});	
	
	return false;
});

$('#m').keyup(function(e) {
	if (e.which == 13) {
		$('#chat-form').submit();
	}
});

socket.on('chat message', function(msg){
	
	var message = "<p><span class='username'>"+user.name+" says:</span><span>"+msg+"</span></p>";
	$(message).appendTo('#chat-message');

	// Scrolling to the bottom of the chat
	var chatMessage = document.getElementById('chat-message');
	chatMessage.scrollTo(0,chatMessage.scrollHeight);
	
	// Emoticons
	$('#chat-message').emoticonize({
		animate:false,
	});
});

socket.on('newUserConnected', function(data){
	$('#chat-container-title').text(data).css('color','green');
});

socket.on('userAction',function(msg,user){
	var message = "<p class='action'>"+msg+"</p>";
	$(message).appendTo('#chat-message');

	// Scrolling to the bottom of the chat
	var chatMessage = document.getElementById('chat-message');
	chatMessage.scrollTo(0,chatMessage.scrollHeight);
});

$('#create-room').submit(function(e){
	e.preventDefault();
	var roomName = $('#room-name').val();
	var roomPassKey = $('#room-pass').val();
	
	var room = {
		name: roomName,
		password : roomPassKey
	};

	socket.emit('createRoom',room);
});

function setDataInBrowser(data)
{
	var data = JSON.stringify(data);
	window.localStorage.setItem('localhostChatUserData',data);
}

function getDataStoredInBrowser()
{
	return window.localStorage.getItem('localhostChatUserData');
}

