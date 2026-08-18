import { useEffect, useRef, useState } from "react";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import StopCircleOutlined from "@mui/icons-material/StopCircleOutlined";
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import { message } from "antd";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface IProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const getSpeechRecognition = () => {
  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return (
    browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
  );
};

const VoiceTextField = ({ label, placeholder, value, onChange }: IProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
    },
    [],
  );

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      message.info(
        "Браузер не підтримує цю кнопку. Скористайся диктуванням телефонної клавіатури.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "uk-UA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onChange([value.trim(), transcript].filter(Boolean).join(" "));
      }
    };
    recognition.onerror = () => {
      message.error("Не вдалося розпізнати голос. Спробуй ще раз.");
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return (
    <TextField
      fullWidth
      multiline
      minRows={3}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip
              title={isListening ? "Зупинити диктування" : "Диктувати голосом"}
            >
              <IconButton
                edge="end"
                color={isListening ? "error" : "primary"}
                aria-label={
                  isListening ? "Зупинити диктування" : "Диктувати голосом"
                }
                onClick={toggleDictation}
              >
                {isListening ? <StopCircleOutlined /> : <MicNoneOutlined />}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default VoiceTextField;
