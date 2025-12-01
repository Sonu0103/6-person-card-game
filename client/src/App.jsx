import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { OfflineSetup } from './components/OfflineSetup';
import { OfflineGame } from './components/OfflineGame';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { OnlineGame } from './components/OnlineGame';
import { useRoomManager } from './hooks/useRoomManager';

function App() {
  const [view, setView] = useState('LANDING'); // LANDING, OFFLINE_SETUP, OFFLINE_GAME, LOBBY, WAITING_ROOM, ONLINE_GAME
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');

  // Room management
  const { socket, isConnected, currentRoom, error, createRoom, joinRoom, startGame, leaveRoom } = useRoomManager();

  const handlePlayOfflineClick = () => {
    setView('OFFLINE_SETUP');
  };

  const handlePlayOnlineClick = () => {
    // Go directly to lobby
    setView('LOBBY');
  };

  const handleStartOfflineGame = (selectedDifficulty, name) => {
    setDifficulty(selectedDifficulty);
    setPlayerName(name);
    setView('OFFLINE_GAME');
  };

  // Online room handlers
  const handleCreateRoom = (name) => {
    setPlayerName(name);
    createRoom(name);
    setView('WAITING_ROOM');
  };

  const handleJoinRoom = (name, roomCode) => {
    setPlayerName(name);
    joinRoom(roomCode, name);
    setView('WAITING_ROOM');
  };

  const handleStartGame = () => {
    if (currentRoom) {
      startGame(currentRoom.roomId);
      setView('ONLINE_GAME');
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.roomId);
    }
    setView('LANDING');
  };

  const handleBackToMenu = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.roomId);
    }
    setView('LANDING');
    setPlayerName('');
  };

  const handleBackToLobby = () => {
    setView('LOBBY');
  };

  // Listen for game start from other players
  React.useEffect(() => {
    if (socket && currentRoom && currentRoom.status === 'in_progress' && view === 'WAITING_ROOM') {
      setView('ONLINE_GAME');
    }
  }, [socket, currentRoom, view]);

  return (
    <>
      {view === 'LANDING' && (
        <LandingPage
          onPlayOffline={handlePlayOfflineClick}
          onPlayOnline={handlePlayOnlineClick}
        />
      )}

      {view === 'OFFLINE_SETUP' && (
        <OfflineSetup
          onStartGame={handleStartOfflineGame}
          onBack={handleBackToMenu}
        />
      )}

      {view === 'OFFLINE_GAME' && (
        <OfflineGame
          playerName={playerName}
          difficulty={difficulty}
          onLeave={handleBackToMenu}
        />
      )}

      {view === 'LOBBY' && (
        <Lobby
          playerName={playerName}
          socket={socket}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onBack={handleBackToMenu}
        />
      )}

      {view === 'WAITING_ROOM' && currentRoom && (
        <WaitingRoom
          room={currentRoom}
          myId={socket?.id}
          onStartGame={handleStartGame}
          onLeaveRoom={handleBackToLobby}
        />
      )}

      {view === 'ONLINE_GAME' && currentRoom && (
        <OnlineGame
          playerName={playerName}
          roomId={currentRoom.roomId}
          socket={socket}
          onLeave={handleBackToMenu}
        />
      )}
    </>
  );
}

export default App;
