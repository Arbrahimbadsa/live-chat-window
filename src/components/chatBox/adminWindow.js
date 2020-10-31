import React, { useEffect, useState } from 'react';
import './firebase';
import firebase from 'firebase';
import {Launcher} from 'react-chat-window';
import {v4 as uuidv4} from 'uuid';

const db = firebase.database();

const roomsRef = db.ref('rooms');

const Room = ({name, click}) => {

    return (
        <div onClick={click} className='room'>
            <p> {name} </p>
        </div>
    );
}

const AdminWindow = () => {

    const [rooms, setRooms] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showLauncher, setShowLauncher] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(5);
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [roomName, setRoomName] = useState('');

    useEffect(() => {

        roomsRef.on('child_added', (snap) => {
            setRooms(rms => [...rms, snap.key]);
        });

    }, []);

    useEffect(() => {
        setMessages([]); // always clear messages first
        if (roomId) {

            const ref = db.ref('rooms/' + roomId).orderByChild('time');
            ref.on('child_added', (snap) => {
                //console.log(snap.val());
                const val = snap.val();
                let author = val.roomId === roomId ? 'me' : 'them';
                sendMessage(author, val.data);
                setNewMessageCount(count => count + 1);
            });

        }
    }, [roomId]);

    const sendMessage = (author, data) => {
        if (data.text) {
            setMessages(msgs => [...msgs, {author: author, type: 'text', data}]);
        }
    }

    const onMessageWasSent = (message) => {
        const messageId = uuidv4();
        const roomRef = db.ref('rooms/' + roomId);
        const msgRef = roomRef.child(messageId);
        msgRef.set({...message, roomId, time: firebase.database.ServerValue.TIMESTAMP});
    }

    const handleLauncherClick = () => {
        setIsOpen(!isOpen);
        setNewMessageCount(0);
    }

    const handleRoomClick = (data) => {
        setRoomId(data.key);
        setRoomName(data.name);
        setShowLauncher(true);
        setIsOpen(true);
    }
  
    return (
        <div className='admin-window'>
            <div className='admin-window-header'>
                <h3>All Rooms</h3>
                <p>You have {rooms.length} rooms. Select a room to start replying.</p>
            </div>
            <div className="rooms">
                {rooms ? rooms.map((roomKey, i) => <Room 
                id={roomKey} 
                name={'Room ' + (i+1)} 
                key={i} 
                click={() => handleRoomClick({key: roomKey, name: 'Room ' + (i+1)})}
                />) : 'Loading...' }
            </div>
            {showLauncher ? <Launcher
            agentProfile={{
                teamName: roomName,
                imageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png'
            }}
            messageList={messages}
            newMessagesCount={newMessageCount}
            isOpen={isOpen}
            handleClick={handleLauncherClick}
            onMessageWasSent={onMessageWasSent}
             /> : null}
        </div>
    );
}

export default AdminWindow;