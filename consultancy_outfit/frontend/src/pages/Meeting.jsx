import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Share2,
  Mail,
  Copy,
  Users,
  Check,
  PhoneOff,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Meeting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [copied, setCopied] = useState(false);

  // Read URL query parameters
  useEffect(() => {
    const queryRoom = searchParams.get('room');
    const queryEmail = searchParams.get('email');
    const queryName = searchParams.get('name');

    if (queryRoom) {
      setRoomId(queryRoom);
      setIsJoined(true);
    } else {
      // Generate clean room code
      const generatedRoom = 'team-' + Math.random().toString(36).substring(2, 8);
      setRoomId(generatedRoom);
    }

    if (queryEmail) setTargetEmail(queryEmail);
    if (queryName) setTargetName(queryName);
  }, [searchParams]);

  const joinMeeting = (customRoom) => {
    const room = customRoom || roomId;
    if (!room.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setIsJoined(true);
    toast.success(`Joined room: ${room}`);
  };

  const leaveMeeting = () => {
    setIsJoined(false);
    toast.success('Meeting ended');
  };

  const meetingLink = `${window.location.origin}/meeting?room=${encodeURIComponent(roomId)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast.success('Meeting link copied! Send it to your team member.');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `👋 Hi! Please join our live video meeting room on Employees Team platform:\n\n${meetingLink}\n\nClick link to join directly from phone or laptop.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const sendEmailInvite = () => {
    const emailTo = targetEmail || '';
    const subject = encodeURIComponent(`Invitation to Video Call: ${user?.name || 'Team Member'}`);
    const body = encodeURIComponent(
      `Hi ${targetName || 'Team Member'},\n\nPlease join our live video meeting room:\n${meetingLink}\n\nLooking forward to speaking with you!\n\nBest regards,\n${user?.name || 'Consultancy Outfit'}`
    );
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, '_blank');
  };

  // Safe sanitized room name for WebRTC iframe
  const sanitizedRoom = (roomId || 'default-room').replace(/[^a-zA-Z0-9-_]/g, '');
  const jitsiUrl = `https://meet.jit.si/EmployeesTeam_${sanitizedRoom}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${encodeURIComponent(user?.name || 'Team Member')}"`;

  if (!isJoined) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-lg w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Direct Video & Audio Call</h2>
          <p className="text-sm text-gray-500 mt-1">
            Connect face-to-face with your employees or clients in high definition with 2-way audio & video.
          </p>

          {targetName && (
            <div className="mt-5 p-4 bg-indigo-50 rounded-2xl text-left border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Calling Employee
                </span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{targetName}</p>
                {targetEmail && <p className="text-xs text-gray-600">{targetEmail}</p>}
              </div>
              <button
                type="button"
                onClick={sendEmailInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Invite
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block text-left mb-1.5">
                Meeting Room Code
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. room-alpha"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-center text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => joinMeeting()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start / Join Live Meeting
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Direct Invite Link:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="flex items-center gap-1 text-green-600 hover:underline font-semibold"
                title="Send link on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-gray-950 rounded-2xl overflow-hidden flex flex-col relative text-white border border-gray-800 shadow-2xl">
      {/* Top Meeting Control Bar */}
      <div className="p-3.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sm">Room: {roomId}</span>
          {targetName && (
            <span className="text-xs bg-gray-800 text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-700">
              In Call: {targetName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
            title="Share Call Link on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors border border-gray-700"
            title="Copy meeting link to invite another device"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied' : 'Copy Link'}
          </button>
          <button
            type="button"
            onClick={leaveMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            End Call
          </button>
        </div>
      </div>

      {/* Embedded Live 2-Way WebRTC Video Calling Room */}
      <div className="flex-1 w-full h-full relative bg-gray-950">
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          className="w-full h-full border-0"
          title="Live Video Meeting"
        />
      </div>
    </div>
  );
};

export default Meeting;
