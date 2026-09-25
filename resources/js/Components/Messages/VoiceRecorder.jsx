import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../lib/useTranslations';

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Records a short voice message via the browser's MediaRecorder API and
 * hands the resulting audio file to `onRecorded` — the parent attaches it to
 * the normal compose form like any other attachment, so sending/cancelling
 * reuses the existing message-send flow rather than a bespoke upload path.
 */
export default function VoiceRecorder({ onRecorded }) {
    const { t } = useTranslations();
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => () => clearInterval(timerRef.current), []);

    async function startRecording() {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
                // Extensions must match what the server's validator expects for
                // each mime type — Symfony's registry maps audio/webm to the
                // "weba" extension (not "webm", which is video/webm's own).
                const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('webm') ? 'weba' : 'mp3';
                onRecorded(new File([blob], `message-vocal.${extension}`, { type: blob.type }));
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setRecording(true);
            setSeconds(0);
            timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        } catch {
            setError(t('messages.micro_refuse', "Impossible d'accéder au micro."));
        }
    }

    function stopRecording() {
        mediaRecorderRef.current?.stop();
        clearInterval(timerRef.current);
        setRecording(false);
    }

    if (recording) {
        return (
            <button
                type="button"
                onClick={stopRecording}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
            >
                <Square className="h-3 w-3" aria-hidden="true" />
                {formatDuration(seconds)}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={startRecording}
            title={error ?? t('messages.message_vocal', 'Message vocal')}
            className={`flex-shrink-0 ${error ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
            <Mic className="h-4 w-4" aria-hidden="true" />
        </button>
    );
}
