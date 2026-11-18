import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api, { endpoints } from '../services/api';
import {
  Send,
  Search,
  User,
  Paperclip,
  Video,
  Phone,
  Check,
  CheckCheck,
  MessageSquare,
  Smile,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef(null);

  // Load all employees / team members for the chat sidebar
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get(endpoints.users.list);
      return res.data.users || [];
    },
  });

  // Check URL query for default selected user
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (targetUserId && users?.length) {
      const found = users.find((u) => u._id === targetUserId);
      if (found) setSelectedUser(found);
    } else if (!selectedUser && users?.length) {
      // Pick first user who isn't self
      const firstOther = users.find((u) => u._id !== user?._id);
      if (firstOther) setSelectedUser(firstOther);
    }
  }, [searchParams, users, user]);

  // Load messages for the selected user
  const { data: messages, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', selectedUser?._id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const res = await api.get(endpoints.messages.list, {
        params: { receiverId: selectedUser._id },
      });
      return res.data.messages || [];
    },
    enabled: !!user && !!selectedUser,
    refetchInterval: 3000, // Poll every 3 seconds as well for guaranteed real-time delivery
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (!socket || !user) return;

    // Join personal socket room
    socket.emit('join_user', user._id);

    const handleReceiveMessage = (newMsg) => {
      if (
        (newMsg.sender?._id === selectedUser?._id && newMsg.receiver?._id === user._id) ||
        (newMsg.sender?._id === user._id && newMsg.receiver?._id === selectedUser?._id)
      ) {
        queryClient.setQueryData(['messages', selectedUser?._id], (old = []) => {
          if (old.some((m) => m._id === newMsg._id)) return old;
          return [...old, newMsg];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, selectedUser, user, queryClient]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (text) => {
      const res = await api.post(endpoints.messages.list, {
        receiverId: selectedUser._id,
        content: text,
        messageType: 'text',
      });
      return res.data.message;
    },
    onSuccess: (newMsg) => {
      queryClient.setQueryData(['messages', selectedUser._id], (old = []) => [...old, newMsg]);
      if (socket) {
        socket.emit('send_message', {
          ...newMsg,
          room: `user_${selectedUser._id}`,
        });
      }
      setMessageInput('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;
    sendMutation.mutate(messageInput.trim());
  };

  const otherUsers = (users || []).filter((u) => u._id !== user?._id);
  const filteredUsers = otherUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.designation?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Left Sidebar: Team Members List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-900 text-lg mb-3">Team Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {usersLoading ? (
            <div className="text-center py-10 text-gray-400 text-xs">Loading members...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 px-4">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No other team members yet.</p>
              <button
                onClick={() => navigate('/employees')}
                className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
              >
                + Add Employee First
              </button>
            </div>
          ) : (
            filteredUsers.map((emp) => {
              const isSelected = selectedUser?._id === emp._id;
              return (
                <button
                  key={emp._id}
                  onClick={() => setSelectedUser(emp)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-indigo-50/80 border-r-4 border-indigo-600' : 'hover:bg-gray-100/70'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {emp.name?.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        emp.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">{emp.name}</p>
                      <span className="text-[10px] text-gray-400">
                        {emp.role === 'admin' ? 'Admin' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {emp.designation || emp.email}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Room */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    selectedUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{selectedUser.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedUser.designation || 'Team Member'} •{' '}
                  <span className={selectedUser.status === 'online' ? 'text-green-600' : 'text-gray-400'}>
                    {selectedUser.status === 'online' ? 'Active Now' : 'Offline'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigate(
                    `/meeting?to=${selectedUser._id}&name=${encodeURIComponent(
                      selectedUser.name
                    )}&email=${encodeURIComponent(selectedUser.email)}`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
                title="Start Video Meeting with this person"
              >
                <Video className="w-4 h-4" />
                Video Call
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
            {msgLoading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Loading conversation...</div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No messages yet with {selectedUser.name}.</p>
                <p className="text-[11px] text-gray-400 mt-1">Say hello to start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                          isMe ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type a message to ${selectedUser.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sendMutation.isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-700">Select an Employee to Chat</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Pick a team member from the left list to view your real-time conversation and start messaging.
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
