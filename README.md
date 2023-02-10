# JuliaColl.github.io

Small project for the Virtual Communication Environments subject. 
Goal: Create a useful application with one simple use-case, communicate people.

- Login page:
When entering the web there appers a login page where the user can choose a user name and a room to enter.

- Avatar page:
After the login, the user must select the desired avatar. They can choose between six diferent avatars. The avatars are from this web: https://getavataaars.com

- Chat page:
Then the user enters the room (the connection with the server is allready done). If it is the 
first user to connect to that room it means that there are not previous messages. Otherwise, 
the user sends a message asking for the log with all the previous messages and a list with
the current users connected to the room (the database of the room). 
At the top-left of the page we can see our avatar and our user name.
At the top-right of the page we can see the room number that we are connected to.
At the left we have a list with the users connected to the room (with its user name and avatar).
At the rigth we have the chat and the input bar where we can send our messages. 
The messages can be send by pressing enter or by clicking on the send buttom (at the bottom-right).
When a user disconnects, we remove it from the list of current users of the room. 


- Message structure:
	- Type: string defining the message type
	- username: string containing user name
	- content: it depends on type

- Message types:
	- text: the content is a message of the chat
	- getInfo: to ask for the room information, that is, all the messages and the connected users (the database)
	- info: the content is the database of the room
	- getUserInfo: to ask for the information of a user, that is, its user name, its id and its profile image.
	- userInfo: the content is the information of a user.

Future improvements:
My idea was to be able to click on the connected users profile and enter to a private chat with them but I did not had time to do it. 
Also I was implementing a logout button to change between rooms without refreshing the page but I hadn't got time to finish it. 
