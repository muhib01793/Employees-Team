import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Mail,
  Copy,
  Monitor,
  Users,
  Check,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Meeting = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [copied, setCopied] = useState(false);

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Read URL params
  useEffect(() => {
    const queryRoom = searchParams.get('room');
    const queryEmail = searchParams.get('email');
    const queryName = searchParams.get('name');

    if (queryRoom) {
      setRoomId(queryRoom);
      joinMeeting(queryRoom);
    } else {
      // Generate default room code
      const generatedRoom = 'room-' + Math.random().toString(36).substring(2, 8);
      setRoomId(generatedRoom);
    }

    if (queryEmail) setTargetEmail(queryEmail);
    if (queryName) setTargetName(queryName);
  }, [searchParams]);

  // Handle local camera & mic stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera/Mic permission denied or not available:', err.message);
      toast.error('Camera/Mic access not available or blocked in this browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const joinMeeting = async (customRoom) => {
    const room = customRoom || roomId;
    if (!room.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setIsJoined(true);
    await startCamera();
    if (socket) {
      socket.emit('join_room', room);
    }
    toast.success(`Joined room: ${room}`);
  };

  const leaveMeeting = () => {
    stopCamera();
    setIsJoined(false);
    toast.success('Meeting ended');
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    } else {
      setIsCameraOn(!isCameraOn);
    }
  };

  const shareScreen = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
          setIsScreenSharing(false);
        };
      } else {
        if (localVideoRef.current && streamRef.current) {
          localVideoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.warn('Screen share error:', err);
    }
  };

  const meetingLink = `${window.location.origin}/meeting?room=${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmailInvite = () => {
    const emailTo = targetEmail || '';
    const subject = encodeURIComponent(`Invitation to Video Call: ${user?.name || 'Team Member'}`);
    const body = encodeURIComponent(
      `Hi ${targetName || 'Team Member'},\n\nPlease join our consultancy video meeting room:\n${meetingLink}\n\nLooking forward to speaking with you!\n\nBest regards,\n${user?.name || 'Consultancy Outfit'}`
    );
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, '_blank');
  };

  if (!isJoined) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Direct Video & Audio Call</h2>
          <p className="text-sm text-gray-500 mt-1">
            Start a call and invite your team members or clients directly via email or link.
          </p>

          {targetName && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-xl text-left border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-500 font-semibold uppercase">Calling Employee</p>
                <p className="text-sm font-bold text-gray-900">{targetName}</p>
                {targetEmail && <p className="text-xs text-gray-600">{targetEmail}</p>}
              </div>
              <button
                onClick={sendEmailInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </button>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block text-left mb-1">
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
              onClick={() => joinMeeting()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Start / Join Meeting
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Direct Call Link:</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] bg-gray-950 rounded-2xl overflow-hidden flex flex-col relative text-white border border-gray-800">
      {/* Top Meeting Bar */}
      <div className="p-4 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-sm">Room: {roomId}</span>
          {targetName && (
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
              Calling: {targetName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={sendEmailInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors"
            title="Send Email Invitation with direct link"
          >
            <Mail className="w-3.5 h-3.5" />
            Email Invite
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors border border-gray-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied' : 'Copy Call Link'}
          </button>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="flex-1 p-4 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="relative w-full max-w-4xl h-full max-h-[500px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
          />

          {!isCameraOn && (
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <p className="mt-3 font-semibold text-gray-300 text-base">{user?.name} (Camera Off)</p>
            </div>
          )}

          {/* Participant Label */}
          <div className="absolute bottom-4 left-4 bg-gray-950/70 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium border border-gray-700 flex items-center gap-2">
            <span>{user?.name} (You)</span>
            {!isMicOn && <MicOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      </div>

      {/* Bottom Meeting Controls */}
      <div className="p-4 bg-gray-900/90 border-t border-gray-800 flex items-center justify-center gap-4 z-10">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl font-semibold transition-colors flex items-center justify-center ${
            isMicOn
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3.5 rounded-2xl font-semibold transition-colors flex items-center justify-center ${
            isCameraOn
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={shareScreen}
          className={`p-3.5 rounded-2xl font-semibold transition-colors flex items-center justify-center ${
            isScreenSharing
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={leaveMeeting}
          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors flex items-center gap-2 text-sm shadow-lg shadow-red-600/30"
          title="End Meeting"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </button>
      </div>
    </div>
  );
};

export default Meeting;
