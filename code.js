
var MYCHAT = {

    // variebles

    input: null,
    currentUser: null,
    currentRoom: null,
    profileImage: null,
    server: new SillyClient(),
    profileImages: [
        'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairFro&accessoriesType=Round&hairColor=BrownDark&facialHairType=Blank&clotheType=Hoodie&clotheColor=PastelOrange&eyeType=Squint&eyebrowType=Default&mouthType=Twinkle&skinColor=Brown',
        'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairDreads02&accessoriesType=Blank&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Red&clotheType=GraphicShirt&clotheColor=Blue01&graphicType=Hola&eyeType=WinkWacky&eyebrowType=RaisedExcitedNatural&mouthType=Smile&skinColor=Light',
        'https://avataaars.io/?avatarStyle=Transparent&topType=Hijab&accessoriesType=Blank&hatColor=Blue03&clotheType=ShirtCrewNeck&clotheColor=Heather&eyeType=Surprised&eyebrowType=UpDown&mouthType=Smile&skinColor=Black',
        'https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairDreads01&accessoriesType=Blank&hairColor=BlondeGolden&facialHairType=Blank&clotheType=Overall&clotheColor=Red&eyeType=Surprised&eyebrowType=RaisedExcited&mouthType=Sad&skinColor=Pale',
        'https://avataaars.io/?avatarStyle=Transparent&topType=LongHairBigHair&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Red&eyeType=Happy&eyebrowType=SadConcerned&mouthType=Twinkle&skinColor=Pale',
        'https://avataaars.io/?avatarStyle=Transparent&topType=Eyepatch&facialHairType=MoustacheFancy&facialHairColor=Blonde&clotheType=Hoodie&clotheColor=Gray02&eyeType=WinkWacky&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Brown',
    ],

    DB: {
        msgs: [],    // to store past messages
        users: []   // to store the users
    },


    // functions
    
    // this function is used to connect to the server
    initServer: function (room_number) {

        var room_name = "JULIACHAT_" + room_number;

        MYCHAT.server.connect("wss://ecv-etic.upf.edu/node/9000/ws", room_name);

        MYCHAT.server.on_ready = MYCHAT.onServerReady.bind(this);
        MYCHAT.server.on_user_connected = MYCHAT.onServerUserConnected.bind(this);
        MYCHAT.server.on_user_disconnected = MYCHAT.onServerUserDisconnected.bind(this);
        MYCHAT.server.on_message = MYCHAT.onServerUserMessage.bind(this);
    },

    // this function is called at the begining to initilize the webapp 
    init: function () {

        MYCHAT.initSelectProfileImage();

        var loginButton = document.querySelector('button#login');
        loginButton.addEventListener("click", MYCHAT.login);

        /* var loginButton = document.querySelector('button#logout');
        loginButton.addEventListener("click", MYCHAT.logout); */

        var sendButton = document.querySelector('button.send');
        sendButton.addEventListener("click", MYCHAT.sendMessage);

        MYCHAT.input = document.querySelector("input.newMessage");
        MYCHAT.input.addEventListener("keydown", MYCHAT.onKeyPress);

        var chat = document.querySelector("#containerChat");
        chat.scrollTop = 100000;
    },

    // to initilize the available avatars
    initSelectProfileImage: function () {

        MYCHAT.profileImages.forEach(element => {
            var image = document.createElement('img');
            image.src = element;
            image.className = 'profileImage';

            image.addEventListener("click", MYCHAT.onImageClick);

            var imageContainer = document.createElement('div');
            imageContainer.className = 'imageContainer';
            imageContainer.appendChild(image);

            var selectProfileImageContainer = document.querySelector('div.selectProfileImageContainer');
            selectProfileImageContainer.appendChild(imageContainer);
        });
    },


    // to execute the login to the chat
    login: function () {
        var room = document.querySelector('input#inputRoom');
        var name = document.querySelector('input#inputUserName');

        if (room.value == "" || name.value == "") {
            return
        }

        var login = document.querySelector('div.loginPage');
        login.style.display = 'none';

        var selectImage = document.querySelector('div.selectProfileImage');
        selectImage.style.display = "flex";

        MYCHAT.currentUser = name.value;
        MYCHAT.currentRoom = room.value;

        room.value = "";
        name.value = "";

    },

    // to select an avatar
    onImageClick: function(){
        MYCHAT.profileImage = this.src;

        var selectImage = document.querySelector('div.selectProfileImage');
        selectImage.style.display = "none";

        var chatePage = document.querySelector('div.chatePage');
        chatePage.style.display = "flex";
        
        MYCHAT.initServer(MYCHAT.currentRoom);
        MYCHAT.startChatPage();

    },

    // start the chat page after selecting the desired avatar 
    startChatPage: function () {
        // set the current room name
        var roomName = document.querySelector("#roomName");
        roomName.innerText = "Room number " + MYCHAT.currentRoom;

        // set the user name   
        var userName = document.querySelector("#myName");
        userName.innerText = MYCHAT.currentUser;

        //set profile image
        var img = document.querySelector("img#myImage");
        img.src = MYCHAT.profileImage;

    },

    /*
    logout: function () {
        var login = document.querySelector('div.loginPage');
        login.style.display = 'flex';

        var chat = document.querySelector('div.chatePage');
        chat.style.display = "none";

        MYCHAT.currentUser = null;
        MYCHAT.currentRoom = null;
        MYCHAT.DB.msgs = null;
        MYCHAT.DB.users = null;

        MYCHAT.clearChat();
        MYCHAT.server.close();
    },
    

    clearChat: function(){
        var chat = document.querySelector("div#containerChat");
        chat.innerHTML = "";
    },
    */

    //this method is called when the server gives the user his ID (ready to start transmiting)
    onServerReady: function (user_id) {
        
       MYCHAT.server.getRoomInfo("JULIACHAT_" + MYCHAT.currentRoom, (info) => {
            
        if(info.clients.length == 1){  // if it is the first user add it to the DB
            var user = {
                name: MYCHAT.currentUser,
                id: MYCHAT.server.user_id,
                profileImage: MYCHAT.profileImage,
            };

            MYCHAT.onUser(user); 
        }

        else{  // if it is not the first user send a message asking for the DB of the room

            msg = {
                type: "getInfo",
            }

            var activeUser = Math.min(...info.clients);
            this.server.sendMessage(msg, activeUser);
        }
            
       });

        this.showInfoMessage("connected to room number " + MYCHAT.currentRoom);
    },

    //this methods is called when a new user is connected
    onServerUserConnected: function (user_id) {
        this.showInfoMessage("somebody joined the room");  // with id:  " + user_id);

        // get the information of the new user
        this.server.sendMessage({type: "getUserInfo"}, user_id);  
    },

    //this methods is called when a user leaves the room
    onServerUserDisconnected: function (user_id) {
        this.showInfoMessage("somebody left the room" ); // with id:  " + user_id);
        
        // delete the user that has left
        for (let index = 0; index <= MYCHAT.DB.users.length; index++) {
            if (MYCHAT.DB.users[index].id === user_id) {
                MYCHAT.unshowDisconnectedUser(user_id);
                MYCHAT.DB.users.splice(index, 1); 
            }
        }
        
    },

    //this methods receives messages from other users (author_id is an unique identifier per user)
    onServerUserMessage: function (user_id, msg) {
        msg = JSON.parse(msg);

        if(msg.type == 'text')   
        {
            this.showOthersMessage(msg);
            this.onMessage(msg);
        }

        if(msg.type == 'getInfo'){
            newmsg = {
                type: "info",
                content: MYCHAT.DB,
            }

            this.server.sendMessage(newmsg, user_id);
        }

        if (msg.type == 'info'){
            msg.content.msgs.forEach(element => {
                this.showOthersMessage(element);
                this.onMessage(element); 
            });

            msg.content.users.forEach(element => {
                if(!(element.id == MYCHAT.server.user_id)){
                    this.showConnectedUser(element);
                }
                this.onUser(element); 
            })

        }

        if(msg.type == 'getUserInfo'){
            var user = {
                name: MYCHAT.currentUser,
                id: MYCHAT.server.user_id,
                profileImage: MYCHAT.profileImage,
            };

            var newMsg = {
                type: 'userInfo',
                content: user,
            }
 
            this.server.sendMessage(newMsg, user_id);
           
            //MYCHAT.onUser(user);
        };

        if(msg.type == 'userInfo'){         
            MYCHAT.onUser(msg.content);
            MYCHAT.showConnectedUser(msg.content);
        }

    },

    // add a new message to the DB
    onMessage: function (msg) {
        this.DB.msgs.push(msg);
    },

    // add a new user to the DB
    onUser: function (usr){
        MYCHAT.DB.users.push(usr);
    },

    // display the current user message
    showMyMessage: function (msg) {
        // create the new message element
        var newMessage = document.createElement("div");
        newMessage.className = "message";
        newMessage.innerText = (msg.content);

        // create the message container
        var newMessageContainer = document.createElement("div");
        newMessageContainer.className = "containerMyMessage";

        // append the new message to the container
        newMessageContainer.appendChild(newMessage);

        // append the container to the chat
        var chat = document.querySelector("#containerChat");
        chat.appendChild(newMessageContainer);
        chat.scrollTop = 100000;
    },

    // display info messages
    showInfoMessage: function (msg) {
        // create the new message element
        var newMessage = document.createElement("div");
        newMessage.className = "message info";
        newMessage.innerText = (msg);

        // create the message container
        var newMessageContainer = document.createElement("div");
        newMessageContainer.className = "containerInfoMessage";

        // append the new message to the container
        newMessageContainer.appendChild(newMessage);

        // append the container to the chat
        var chat = document.querySelector("#containerChat");
        chat.appendChild(newMessageContainer);
        chat.scrollTop = 100000;
    },

    // display other user message
    showOthersMessage: function (msg) {

       // create prfile image container
       var imageContainer = document.createElement('div');
       imageContainer.className = "miniProfileImage";
       var img = document.createElement('img');
       img.src = msg.profileImage;
       img.className = "profileImage";
       imageContainer.appendChild(img);

        // create name element 
        var name = document.createElement("div");
        name.className = "name";
        name.innerText = msg.username;

        // create message element
        var message = document.createElement("div");
        message.innerText = msg.content;

        // append user name and message 
        var newMessage = document.createElement("div");
        newMessage.className = "message";
        newMessage.appendChild(name);
        newMessage.appendChild(message);

        // append to a container and then to the chat
        var newMessageContainer = document.createElement("div");
        newMessageContainer.className = "containerOtherMessage";
        newMessageContainer.appendChild(imageContainer);
        newMessageContainer.appendChild(newMessage);
        var chat = document.querySelector("#containerChat");
        chat.appendChild(newMessageContainer);
        chat.scrollTop = 100000;
    },

    showConnectedUser: function(usr){

         // create profile image container
        var img = document.createElement('img');
        img.className = 'profileImage';
        img.src = usr.profileImage;
        var imageContainer = document.createElement('div');
        imageContainer.className = 'profileImageContainer';
        imageContainer.appendChild(img);

        var profileImage = document.createElement('div');
        profileImage.className = 'profileImage';
        profileImage.appendChild(imageContainer);

        // create user name element
        var userName = document.createElement('div');
        userName.className = 'userName';
        userName.innerText = usr.name;

        // create container
        var containerOneChat = document.createElement('div');
        containerOneChat.className = 'containerOneChat';
        containerOneChat.id = usr.id;

        // append profile image and user name  
        containerOneChat.appendChild(profileImage);
        containerOneChat.appendChild(userName);

        // append the container chats
        var chat = document.querySelector("div.containerChats");
        chat.appendChild(containerOneChat);

    },


    unshowDisconnectedUser(user_id){
        var containerOneChat = document.getElementById(user_id);
        containerOneChat.remove();
    },

    // send messages from the input bar
    sendMessage: function () {
        
        // if the input is nothing
        if (MYCHAT.input.value == "") {
            return;
        }

        // create the object message
        var msg = {
            type: "text",
            content: MYCHAT.input.value,
            username: MYCHAT.currentUser,
            profileImage: MYCHAT.profileImage,
        }

        //add the message to the DB
        MYCHAT.onMessage(msg);

        //show the message in the screen
        MYCHAT.showMyMessage(msg);

        //send message
        MYCHAT.server.sendMessage(msg);

        // clear the input value
        MYCHAT.input.value = "";
    },

    // when pressing enter, send the messasge of the input bar
    onKeyPress: function (event) {
        if (event.code == "Enter") {
            MYCHAT.sendMessage();
        }
    }
}

