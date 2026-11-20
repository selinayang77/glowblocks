import { useEffect, useRef, useState } from 'react';
import {
  canShareFiles,
  captureFrame,
  downloadPhoto,
  photoFile,
  sharePhoto,
  useFrontCamera,
} from '../lib/camera';
import { Slider } from './Slider';

interface CameraPanelProps {
  intensity: number;
  onIntensityChange: (v: number) => void;
  onClose: () => void;
}

const TIMER_OPTIONS = [0, 3, 10] as const;
type TimerSeconds = (typeof TIMER_OPTIONS)[number];

interface Shot {
  file: File;
  url: string;
}

/**
 * Selfie camera that sits inside the light view: the preview is framed in the
 * middle of the screen so the chosen colour keeps lighting the face around it.
 */
export function CameraPanel({ intensity, onIntensityChange, onClose }: CameraPanelProps) {
  const { videoRef, status, error, retry } = useFrontCamera();
  const [timer, setTimer] = useState<TimerSeconds>(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);
  const [flash, setFlash] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const shotRef = useRef<Shot | null>(null);
  shotRef.current = shot;

  // Free the preview image when the panel closes.
  useEffect(() => () => {
    if (shotRef.current) URL.revokeObjectURL(shotRef.current.url);
  }, []);

  const take = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const blob = await captureFrame(video, true);
      const file = photoFile(blob);
      setShot({ file, url: URL.createObjectURL(file) });
      setFlash(true);
      window.setTimeout(() => setFlash(false), 250);
    } catch {
      setMessage("Couldn't take the photo. Please try again.");
    }
  };

  // Countdown: tick once a second, shoot at zero.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void take();
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const onShutter = () => {
    setMessage(null);
    if (countdown !== null) return setCountdown(null); // second tap cancels
    if (timer === 0) void take();
    else setCountdown(timer);
  };

  const retake = () => {
    if (shot) URL.revokeObjectURL(shot.url);
    setShot(null);
    setMessage(null);
  };

  const share = async () => {
    if (!shot) return;
    try {
      const r = await sharePhoto(shot.file);
      if (r === 'shared') setMessage('Shared!');
    } catch {
      downloadPhoto(shot.file);
      setMessage('Sharing failed. Download requested. Check your browser’s downloads.');
    }
  };

  const download = () => {
    if (!shot) return;
    downloadPhoto(shot.file);
    setMessage('Download requested. Check your browser’s downloads.');
  };

  const nextTimer = () => setTimer((t) => TIMER_OPTIONS[(TIMER_OPTIONS.indexOf(t) + 1) % TIMER_OPTIONS.length]);
  const shareable = shot ? canShareFiles(shot.file) : false;

  return (
    <div className="camera" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="light__close" onClick={onClose} aria-label="Close camera">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Back</span>
      </button>

      <div className="camera__stage">
        <div className={`camera__frame ${flash ? 'is-flash' : ''}`}>
          <video
            ref={videoRef}
            className="camera__video"
            playsInline
            muted
            autoPlay
            hidden={Boolean(shot) || status !== 'ready'}
          />
          {shot && <img className="camera__photo" src={shot.url} alt="Your photo" />}

          {status === 'starting' && !shot && (
            <div className="camera__status" role="status">
              <span className="spinner" aria-hidden="true" />
              Starting camera…
            </div>
          )}
          {status === 'error' && (
            <div className="camera__status" role="alert">
              <p>{error}</p>
              <button type="button" className="btn btn--primary" onClick={retry}>
                Try again
              </button>
            </div>
          )}
          {countdown !== null && countdown > 0 && (
            <div className="camera__countdown" aria-live="assertive">
              {countdown}
            </div>
          )}
        </div>
      </div>

      <div className="camera__bar">
        {message && <p className="camera__message" role="status">{message}</p>}

        {shot ? (
          <div className="camera__review">
            <button type="button" className="btn btn--ghost" onClick={retake}>
              Retake
            </button>
            {shareable && (
              <button type="button" className="btn btn--primary" onClick={share}>
                Save / Share
              </button>
            )}
            <button type="button" className={`btn ${shareable ? 'btn--ghost' : 'btn--primary'}`} onClick={download}>
              Download
            </button>
          </div>
        ) : (
          <>
            <Slider
              id="camera-intensity"
              label="Light intensity"
              min={0.05}
              max={1}
              step={0.01}
              value={intensity}
              valueText={`${Math.round(intensity * 100)}%`}
              onChange={onIntensityChange}
            />
            <div className="camera__controls">
              <button
                type="button"
                className="btn btn--ghost camera__timer"
                onClick={nextTimer}
                disabled={countdown !== null}
                aria-label={`Self-timer: ${timer === 0 ? 'off' : `${timer} seconds`}. Tap to change.`}
              >
                ⏱ {timer === 0 ? 'Off' : `${timer}s`}
              </button>
              <button
                type="button"
                className={`shutter ${countdown !== null ? 'is-counting' : ''}`}
                onClick={onShutter}
                disabled={status !== 'ready'}
                aria-label={countdown !== null ? 'Cancel timer' : 'Take photo'}
              />
              <span className="camera__spacer" aria-hidden="true" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
