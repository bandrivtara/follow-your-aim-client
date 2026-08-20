import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { message } from "antd";
import VoiceTextField from "./VoiceTextField";

interface AiReflectionFieldProps {
  title: string;
  description: string;
  prompt: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
}

const AiReflectionField = ({
  title,
  description,
  prompt,
  label,
  placeholder,
  value,
  onChange,
  minRows = 8,
}: AiReflectionFieldProps) => {
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      message.success("Промпт скопійовано");
    } catch {
      message.error("Не вдалося скопіювати промпт");
    }
  };

  return (
    <Box className="ai-reflection-editor">
      <Card className="ai-prompt-card" variant="outlined">
        <CardContent>
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {description}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<ContentCopyOutlined />}
              onClick={copyPrompt}
            >
              Копіювати промпт
            </Button>
          </Box>
        </CardContent>
      </Card>
      <VoiceTextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        minRows={minRows}
      />
    </Box>
  );
};

export default AiReflectionField;
