import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseBlob, selectCover } from "music-metadata";
import { basename, type AssetFile } from "../../shell/filesystem";
import { previewAssetPatterns } from "./previewLabels";
import {
  EmbedFallback,
  EmbedLink,
  MusicPreviewButton,
  MusicPreviewButtonIcon,
  MusicPreviewCard,
  MusicPreviewCopy,
  MusicPreviewControlCluster,
  MusicPreviewControls,
  MusicPreviewCover,
  MusicPreviewHeader,
  MusicPreviewMeta,
  MusicPreviewProgressGroup,
  MusicPreviewRange,
  MusicPreviewSubtitle,
  MusicPreviewSurface,
  MusicPreviewTimeRow,
  MusicPreviewTitle,
  MusicPreviewVolumeWrap,
  PreviewAudio,
  PreviewEmbedFrame,
  PreviewImage,
  PreviewVideo,
} from "../styles/PreviewPane.styled";

type AudioMetadataState = {
  album: string;
  artist: string;
  coverUrl: string | null;
  title: string;
};

const formatClock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const safeSeconds = Math.floor(seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const stripExtension = (value: string) => value.replace(/\.[^.]+$/, "");

const getFallbackCoverBackground = (fileName: string) => {
  const seed = Array.from(fileName).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 3),
    0
  );
  const hueA = seed % 360;
  const hueB = (seed * 1.8 + 70) % 360;
  const hueC = (seed * 2.7 + 140) % 360;

  return `
    radial-gradient(circle at 18% 22%, hsla(${hueA}, 88%, 74%, 0.92), transparent 42%),
    radial-gradient(circle at 82% 18%, hsla(${hueB}, 84%, 64%, 0.74), transparent 36%),
    linear-gradient(145deg, hsla(${hueC}, 58%, 18%, 1), hsla(${hueA}, 62%, 10%, 1))
  `;
};

const AudioPreview: React.FC<{ file: AssetFile }> = ({ file }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [volumeValue, setVolumeValue] = useState(0.78);
  const fileName = basename(file.path);
  const fallbackCoverBackground = useMemo(
    () => getFallbackCoverBackground(fileName),
    [fileName]
  );
  const [metadata, setMetadata] = useState<AudioMetadataState>({
    album: stripExtension(fileName),
    artist: stripExtension(fileName),
    coverUrl: null,
    title: stripExtension(fileName),
  });

  const syncProgress = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextCurrentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    setCurrentTime(nextCurrentTime);
    setProgressValue(nextCurrentTime);
    setDuration(nextDuration);
  }, []);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volumeValue;
  }, [volumeValue]);

  useEffect(() => {
    let disposed = false;
    let ownedCoverUrl: string | null = null;

    void fetch(file.src)
      .then(response => response.blob())
      .then(async blob => {
        const parsedMetadata = await parseBlob(blob).catch(() => null);

        if (disposed) {
          return;
        }

        const cover = selectCover(parsedMetadata?.common.picture);

        if (cover) {
          const coverBytes = new Uint8Array(new ArrayBuffer(cover.data.byteLength));
          coverBytes.set(cover.data);
          ownedCoverUrl = URL.createObjectURL(
            new Blob([coverBytes], { type: cover.format })
          );
        }

        setMetadata({
          album: parsedMetadata?.common.album ?? stripExtension(fileName),
          artist:
            parsedMetadata?.common.artist ??
            parsedMetadata?.common.albumartist ??
            stripExtension(fileName),
          coverUrl: ownedCoverUrl,
          title: parsedMetadata?.common.title ?? stripExtension(fileName),
        });
      })
      .catch(() => {
        if (disposed) {
          return;
        }

        setMetadata({
          album: stripExtension(fileName),
          artist: stripExtension(fileName),
          coverUrl: null,
          title: stripExtension(fileName),
        });
      });

    return () => {
      disposed = true;

      if (ownedCoverUrl) {
        URL.revokeObjectURL(ownedCoverUrl);
      }
    };
  }, [file.src, fileName]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);
      syncProgress();
    };

    const handleTimeUpdate = () => {
      syncProgress();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setProgressValue(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [syncProgress]);

  const coverBackground = metadata.coverUrl
    ? `url("${metadata.coverUrl}")`
    : fallbackCoverBackground;

  return (
    <MusicPreviewCard $backdrop={coverBackground}>
      <MusicPreviewHeader>
        <MusicPreviewMeta>
          <MusicPreviewCover $background={coverBackground} />
          <MusicPreviewCopy>
            <MusicPreviewTitle>{metadata.title}</MusicPreviewTitle>
            <MusicPreviewSubtitle>{metadata.artist}</MusicPreviewSubtitle>
            <MusicPreviewSubtitle>{metadata.album}</MusicPreviewSubtitle>
          </MusicPreviewCopy>
        </MusicPreviewMeta>
        <MusicPreviewControls>
          <MusicPreviewControlCluster>
            <MusicPreviewButton
              $primary
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              onClick={() => {
                void togglePlayback();
              }}
              type="button"
            >
              <MusicPreviewButtonIcon $kind={isPlaying ? "pause" : "play"} />
            </MusicPreviewButton>
          </MusicPreviewControlCluster>
          <MusicPreviewVolumeWrap>
            <span>Vol</span>
            <MusicPreviewRange
              aria-label="Audio volume"
              max={1}
              min={0}
              onChange={event => {
                setVolumeValue(Number(event.target.value));
              }}
              step={0.01}
              type="range"
              value={volumeValue}
            />
          </MusicPreviewVolumeWrap>
        </MusicPreviewControls>
      </MusicPreviewHeader>
      <MusicPreviewSurface>
        <MusicPreviewProgressGroup>
          <MusicPreviewRange
            aria-label="Audio playback progress"
            max={duration > 0 ? duration : 0}
            min={0}
            onChange={event => {
              const nextValue = Number(event.target.value);
              setProgressValue(nextValue);

              if (audioRef.current) {
                audioRef.current.currentTime = nextValue;
              }
            }}
            step={0.1}
            type="range"
            value={progressValue}
          />
          <MusicPreviewTimeRow>
            <span>{formatClock(currentTime)}</span>
            <span>{formatClock(duration)}</span>
          </MusicPreviewTimeRow>
        </MusicPreviewProgressGroup>
      </MusicPreviewSurface>
      <PreviewAudio preload="metadata" ref={audioRef} src={file.src} />
    </MusicPreviewCard>
  );
};

/**
 * Chooses the best built-in renderer for binary assets based on file extension.
 */
const MediaPreview: React.FC<{ file: AssetFile }> = ({ file }) => {
  if (previewAssetPatterns.image.test(file.path)) {
    return <PreviewImage alt={basename(file.path)} src={file.src} />;
  }

  if (previewAssetPatterns.audio.test(file.path)) {
    return <AudioPreview file={file} />;
  }

  if (previewAssetPatterns.video.test(file.path)) {
    return <PreviewVideo controls src={file.src} />;
  }

  if (previewAssetPatterns.document.test(file.path)) {
    return <PreviewEmbedFrame src={file.src} title={basename(file.path)} />;
  }

  return (
    <EmbedFallback>
      <span>
        This is a binary file: <code>{basename(file.path)}</code>. Open{" "}
        <EmbedLink href={file.src} rel="noreferrer" target="_blank">
          raw file
        </EmbedLink>
        .
      </span>
    </EmbedFallback>
  );
};

export default MediaPreview;
