import React, { useEffect, useState } from 'react';
import {v4 as uuidv4} from 'uuid';
import './firebase';
import firebase from 'firebase';
import {Launcher} from 'react-chat-window';

const db = firebase.database();

const getUUID = () => {
    let uuid;
    let storageId = localStorage.getItem('uuid');
    if (storageId == null) {
        uuid = uuidv4();
        localStorage.setItem('uuid', uuid);
        return uuid;
    } else {
        return localStorage.getItem('uuid');
    }
}

let roomId = getUUID();;

let roomRef = db.ref('rooms/' + roomId);

const ChatWindow = () => {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // load messages
    useEffect(() => {

        // get the messages once and set it to the state
        // roomRef.once('value').then(data => {
        //     const keys = Object.keys(data.val());
        //     const val = data.val();
            
        //     keys.forEach(key => setMessages(msgs => [...msgs, val[key]]));

        // });

        const sortByTimeRef = roomRef.orderByChild('time');

        sortByTimeRef.on('child_added', (snap) => {
            const val = snap.val();
            let author = val.roomId === roomId ? 'me' : 'them';
            sendMessage(author, val.data); // send message to client
            setNewMessageCount(count => count + 1);
        });

    }, []); // runs only once after the element mounted

    const sendMessage = (author, data) => {
        if (data.text) {
            setMessages(msgs => [...msgs, {author: author, type: 'text', data}]);
        }
    }

    const onMessageWasSent = message => {

        //setMessages([...messages, message]); // don't update the state here since we have added child_added event. It will be automatically triggered when a new child or message is added in the room.
        
        // add to firebase when message was sent from client
        const messageId = uuidv4();
        const msgRef = roomRef.child(messageId);
        msgRef.set({...message, roomId, time: firebase.database.ServerValue.TIMESTAMP}); // set to user/current-uuid

    }

    const launcherHandleClick = () => {
        setIsOpen(!isOpen);
        setNewMessageCount(0);
    }

    return (
        <div className='chat-window'>
            <p style={{margin: '10px'}}>Go to /admin to see the admin window.</p>
            <Launcher
            agentProfile={{
                teamName: 'Eqsist',
                imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
            }}
            messageList={messages}
            onMessageWasSent={onMessageWasSent}
            newMessagesCount={newMessageCount}
            handleClick={launcherHandleClick}
            isOpen={isOpen}
            />
        </div>
    );
}

export default ChatWindow;