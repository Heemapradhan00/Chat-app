const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const mysql = require('mysql2');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'my_chat',  // Change to your MySQL username
    password: 'msu@123',  // Change to your MySQL password
    database: 'chat_db'  // The database you created
});

// Check MySQL connection
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database as ID ' + connection.threadId);
});

// Serve the chat application
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/caeser.html');
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Load messages from the database
    connection.query('SELECT * FROM messages ORDER BY created_at ASC', (err, results) => {
        if (err) throw err;
        socket.emit('load messages', results);
    });

    socket.on('send message', (data) => {
        // Insert message into the database
        connection.query('INSERT INTO messages (username, message) VALUES (?, ?)', [data.username, data.message], (err) => {
            if (err) throw err;
            // Broadcast the message to all clients
            io.emit('receive message', data);
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
