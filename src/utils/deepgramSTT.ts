// Deepgram Speech-to-Text utility using MediaRecorder API

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let stream: MediaStream | null = null;
let recordingStartTime: number = 0;

export function isDeepgramAvailable(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );
}

export function hasActiveRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
}

export function getRecordingDuration(): number {
  if (!recordingStartTime) return 0;
  return Date.now() - recordingStartTime;
}

export async function startRecording(): Promise<void> {
  audioChunks = [];
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';
  mediaRecorder = new MediaRecorder(stream, { mimeType });
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };
  recordingStartTime = Date.now();
  mediaRecorder.start(250); // collect chunks every 250ms for responsiveness
}

export async function stopRecording(): Promise<{
  transcript: string;
  durationMs: number;
}> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      reject(new Error('No active recording'));
      return;
    }
    const duration = Date.now() - recordingStartTime;
    mediaRecorder.onstop = async () => {
      // Stop mic
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
      }

      const mimeType = mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(audioChunks, { type: mimeType });
      audioChunks = [];

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('/.netlify/functions/deepgram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64,
              mimetype: blob.type || 'audio/webm',
            }),
          });
          if (!res.ok) throw new Error(`Deepgram API error: ${res.status}`);
          const data = await res.json();
          resolve({ transcript: data.transcript || '', durationMs: duration });
        } catch (err: unknown) {
          console.error('Deepgram transcription error:', err);
          resolve({ transcript: '', durationMs: duration }); // fail silently
        }
      };
      reader.readAsDataURL(blob);
      mediaRecorder = null;
    };
    mediaRecorder.stop();
  });
}

export function cancelRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  audioChunks = [];
  mediaRecorder = null;
  recordingStartTime = 0;
}
