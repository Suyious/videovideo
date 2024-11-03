import { useEffect, useRef, useState } from "react"

export default function usePeer() {

    const servers = {
        iceServers: [{
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }]
    }

    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connected, setConnected] = useState<boolean>(false);

    const [temporary, setTemporary] = useState<boolean>(false);


    const init = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
        setLocalStream(stream);
    }

    const createPeerConnection = (callback: (value: RTCSessionDescriptionInit | null) => void) => {
        peerConnection.current = new RTCPeerConnection(servers);
        const newRemoteStream = new MediaStream();
        setRemoteStream(newRemoteStream);

        if(localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.current?.addTrack(track, localStream);
            })
        }

        if(peerConnection.current) {
            peerConnection.current.ontrack = async (event) => {
                event.streams[0].getTracks().forEach(track => {
                    newRemoteStream.addTrack(track);
                })
            }
        }

        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate && peerConnection.current?.localDescription) {
                callback(peerConnection.current.localDescription);
            }
        }
    }

    const createOffer = async (callback: (value: RTCSessionDescriptionInit | null) => void) => {
        createPeerConnection(callback)
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
    }

    const createAnswer = async (offer: RTCSessionDescriptionInit | null ,callback: (value: RTCSessionDescriptionInit | null) => void) => {
        createPeerConnection(callback);

        if (!offer) return alert("NO OFFER");

        await peerConnection.current?.setRemoteDescription(offer);

        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);

        setTemporary(true);

    }
    
    const addAnswer = async (answer: RTCSessionDescriptionInit | null) => {
        if (!answer) return alert('NO ANSWER');

        if(peerConnection.current) {
            if (!peerConnection.current.currentRemoteDescription) {
                peerConnection.current.setRemoteDescription(answer);
                setConnected(true);
            }
        }
    }

    const disconnect = () => {
        if(peerConnection.current) {
            peerConnection.current.close();
            setRemoteStream(null);
            setConnected(false);
        }
    }

    useEffect(() => {
        init();
    }, [])

    return {
        localStream,
        remoteStream,
        createOffer,
        createAnswer,
        addAnswer,
        connected,
        setConnected,
        disconnect,
        temporary,
    }
}