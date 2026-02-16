// src/services/chatService.js
import { Platform } from 'react-native';

class ChatService {
    constructor() {
        this.socket = null;
        this.onMessageCallback = null;
        this.onStatusChangeCallback = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.url = null;
        this.isConnected = false;
    }

    connect(patientId, doctorId, token, baseUrl) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.token = token;
        this.baseUrl = baseUrl;

        if (this.socket) {
            this.disconnect();
        }

        // Convert http(s) to ws(s)
        let wsBaseUrl = baseUrl.replace(/^http/, 'ws');

        // Ensure no trailing slash for the base URL
        wsBaseUrl = wsBaseUrl.replace(/\/$/, '');

        this.url = `${wsBaseUrl}/ws/chat/${patientId}/${doctorId}/?token=${token}`;
        this._performConnect();
    }

    _performConnect() {
        console.log('Connecting to WebSocket:', this.url);
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback('connected');
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback('error');
            }
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket Closed:', event.code, event.reason);
            this.isConnected = false;
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback('disconnected');
            }

            // Automatically reconnect if not closed normally
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnect();
            }
        };
    }

    reconnect() {
        this.reconnectAttempts++;
        console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);
        setTimeout(() => {
            if (this.url) {
                this._performConnect();
            }
        }, this.reconnectInterval);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Normal closure');
            this.socket = null;
            this.isConnected = false;
        }
    }

    sendMessage(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                type: 'chat_message',
                message: message
            }));
            return true;
        }
        return false;
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    onStatusChange(callback) {
        this.onStatusChangeCallback = callback;
    }
}

const chatService = new ChatService();
export default chatService;
