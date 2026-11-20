import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'starting' | 'ready' | 'error';

/** Turn getUserMedia failures into something a person can act on. */
function describeCameraError(err: unknown): string {
  const name = err instanceof DOMException || err instanceof Error ? err.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera access was blocked. Allow the camera for this site in your browser settings, then try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No front camera was found on this device.';
    case 'NotReadableError':
    case 'AbortError':
      return 'The camera is busy. Close other apps or tabs using it, then try again.';
    default:
      return 'The camera could not be started. Please try again.';
  }
}

/**
 * Starts the front ("selfie") camera and streams it into `videoRef`.
 * Stops every track on unmount so the camera light turns off.
 * Never throws: failures surface as `status: 'error'` with a readable message.
 */
export function useFrontCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>('starting');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus('starting');
    setError(null);

    (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError(
          window.isSecureContext
            ? "This browser doesn't support camera access."
            : 'The camera only works over a secure (https://) link. Open GlowBlocks from its https address.',
        );
        setStatus('error');
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (video) {
          video.srcObject = s;
          await video.play().catch(() => {
            /* autoplay is allowed for muted inline video; ignore rare refusals */
          });
        }
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(describeCameraError(err));
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { videoRef, status, error, retry };
}

/** Grab the current video frame as a JPEG. `mirror` matches the selfie-style preview. */
export function captureFrame(video: HTMLVideoElement, mirror: boolean): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return reject(new Error('Camera is not ready yet'));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas is not supported'));
    if (mirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode photo'))), 'image/jpeg', 0.92);
  });
}

export function photoFile(blob: Blob): File {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return new File([blob], `glowblocks-${stamp}.jpg`, { type: 'image/jpeg' });
}

/** True when the native share sheet can take image files (phones: "Save Image" → Photos). */
export function canShareFiles(file: File): boolean {
  try {
    return Boolean(navigator.canShare?.({ files: [file] }));
  } catch {
    return false;
  }
}

export async function sharePhoto(file: File): Promise<'shared' | 'cancelled'> {
  try {
    await navigator.share({ files: [file], title: 'GlowBlocks photo' });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    throw err;
  }
}

export function downloadPhoto(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
