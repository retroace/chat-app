var user = {
	id: "",
	name: ""
};

var room = {
	name: '',
	token: ''
};

var timer;

$('#m').keyup(function(e){
	e.preventDefault();
	clearInterval(timer);
	$('#favicon').attr('href','/page/img/favicon.ico');
});
$('.showSidebar').hide();

$('#hide-sidebar').click(function(e){
	$('#chat-lists').hide();
	$('.showSidebar').show();
	
	$('#chat-section').css({
		margin: 'auto',
		float: 'none'
	});
});
$('.showSidebar').click(function(e){
	e.preventDefault();
	$('#chat-lists').show();
	$('#chat-section').css({
		margin: '0',
		float: 'right'
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
			
			var isUsernameAvaiable = true;
			
			if (isUsernameAvaiable) {
				// User generated value
				user.id = Math.random().toString(36).substring(3,16) + +new Date;
				user.name = name.val();

				setDataInBrowser(user);

				// hiding name and setting type to hidden
				name.attr({
					'value': name,
					type: 'hidden'
				});

				socket.emit('newUser',user.name);
		
				$('#m').attr('placeholder','Enter a message '+ user.name);
		
				$('#chat-container-title').text(user.name+ " has connected to chat").css('color','green');
				
			}else{
				var error = "<p class='text-error'>Username already exists</p>";
				if ($('.text-error').length == 0) {
					$(error).insertBefore('#name');
				}else{
					$('.text-error').text('Sorry the username already exists');	
				}
			}
			

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
	
	socket.emit('chat message', msg, user.name);

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

socket.on('chat message', function(msg, username){
	
	var message = "<p><span class='username'>"+username+" says:</span><span>"+msg+"</span></p>";
	$(message).appendTo('#chat-message');

	// Emoticons
	$('#chat-message p').emoticonize();

	// Scrolling to the bottom of the chat
	var chatMessage = document.getElementById('chat-message');
	chatMessage.scrollTo(0,chatMessage.scrollHeight);
	
	clearInterval(timer);
	if ($('#m').is(':focus') == false) {
		timer = setInterval(function(){
			if ($('#favicon').attr('href') == '/page/img/favicon2.ico') {
				$('#favicon').attr('href','/page/img/favicon.ico');
			}else if($('#favicon').attr('href') == '/page/img/favicon.ico'){
				$('#favicon').attr('href','/page/img/favicon2.ico');
			}
		},300);
		var random = ['cheerful','plucky']  ;
		var randomNumber = Math.floor(Math.random() * 2);

		playSound('notification');
		
	}
	

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

socket.on('user leave',function(user){
	$('#chat-container-title').text(user+ " has left the chat").css('color','red');
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

function checkSocketForName(name)
{

}


function playSound(filename){
	// var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
	var oggSource = '<source src="/page/sounds/'+filename+'.ogg" type="audio/ogg">';
	var embedSource = '<embed hidden="true" autostart="true" loop="false" src="/page/sounds/' + filename +'.mp3">';
	document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + oggSource + embedSource + '</audio>';
}

$('#happy').click(function(e){
	e.preventDefault();
	playSound('aud');
});
