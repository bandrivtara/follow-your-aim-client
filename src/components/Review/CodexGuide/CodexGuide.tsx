import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import {
  CODEX_CONTEXT_ITEMS,
  CODEX_PLAN_ITEMS,
  CODEX_PROMPTS,
} from "./codexPrompts";
import CodexGuideLayout from "./CodexGuide.styled";

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

const CodexGuide = () => {
  const [copiedPromptId, setCopiedPromptId] = useState<string>();
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async (id: string, prompt: string) => {
    try {
      await copyText(prompt);
      setCopyError(false);
      setCopiedPromptId(id);
      window.setTimeout(() => setCopiedPromptId(undefined), 2200);
    } catch {
      setCopiedPromptId(undefined);
      setCopyError(true);
    }
  };

  return (
    <CodexGuideLayout>
      <Card className="review-card codex-hero">
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <AutoAwesomeOutlined color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4" component="h1">
              Codex-помічник
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              Готовий workflow для аналізу тижня, планування й безпечного
              перенесення погодженого плану у Follow Your Aim.
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Alert severity="info" icon={<SecurityOutlined />}>
        Codex спочатку лише читає контекст. Запис дозволяється тільки окремим
        фінальним промптом після перевіреного dry-run.
      </Alert>

      <section className="codex-section" aria-labelledby="codex-start-title">
        <Typography id="codex-start-title" variant="h5" component="h2">
          Як правильно почати у Codex
        </Typography>
        <Card className="review-card">
          <CardContent>
            <ol className="codex-steps">
              <li>
                Відкрий папку репозиторію <strong>follow-your-aim-client</strong>{" "}
                як проєкт у Codex.
              </li>
              <li>
                Створи нову задачу й встав промпт «Планування наступного
                тижня» нижче.
              </li>
              <li>
                Відповідай на запитання Codex по одному: про обмеження, важкі
                дні, незавершені справи та Big 3.
              </li>
              <li>
                Перевір фінальний план і попроси виконати dry-run. На цьому
                етапі Firebase не змінюється.
              </li>
              <li>
                Лише якщо список правильний, скопіюй промпт «Застосування
                погодженого плану».
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="codex-section" aria-labelledby="codex-context-title">
        <Typography id="codex-context-title" variant="h5" component="h2">
          Який контекст отримає Codex
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} mt={1.5}>
          {CODEX_CONTEXT_ITEMS.map((item) => (
            <Chip
              key={item}
              label={item}
              variant="outlined"
              sx={{
                height: "auto",
                "& .MuiChip-label": { py: 0.75, whiteSpace: "normal" },
              }}
            />
          ))}
        </Stack>
      </section>

      <section className="codex-section" aria-labelledby="codex-result-title">
        <Typography id="codex-result-title" variant="h5" component="h2">
          Що міститиме фінальний план
        </Typography>
        <Card className="review-card">
          <CardContent>
            <ul className="codex-check-list">
              {CODEX_PLAN_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="codex-section" aria-labelledby="codex-prompts-title">
        <Typography id="codex-prompts-title" variant="h5" component="h2">
          Готові промпти
        </Typography>
        <Typography color="text.secondary" mt={0.5} mb={1.5}>
          Обери сценарій, скопіюй текст і встав його в задачу Codex цього
          проєкту.
        </Typography>

        {copyError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Не вдалося скопіювати автоматично. Виділи текст промпта вручну.
          </Alert>
        )}

        <div className="codex-grid">
          {CODEX_PROMPTS.map((item) => {
            const isCopied = copiedPromptId === item.id;

            return (
              <Card className="review-card" key={item.id}>
                <CardContent className="codex-card-content">
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Typography variant="h6" component="h3">
                      {item.title}
                    </Typography>
                    {item.requiresConfirmation && (
                      <Chip size="small" color="warning" label="Дозволяє запис" />
                    )}
                  </Stack>
                  <Typography color="text.secondary" mt={0.5}>
                    {item.description}
                  </Typography>
                  <Typography className="codex-prompt" variant="body2">
                    {item.prompt}
                  </Typography>
                  <Button
                    className="codex-copy-button"
                    variant={isCopied ? "contained" : "outlined"}
                    color={item.requiresConfirmation ? "warning" : "primary"}
                    startIcon={
                      isCopied ? <CheckCircleOutline /> : <ContentCopyOutlined />
                    }
                    aria-label={`Скопіювати промпт: ${item.title}`}
                    onClick={() => handleCopy(item.id, item.prompt)}
                  >
                    {isCopied ? "Скопійовано" : "Скопіювати"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="codex-section" aria-labelledby="codex-safety-title">
        <Typography id="codex-safety-title" variant="h5" component="h2">
          Межі безпеки
        </Typography>
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          Big 3 залишається частиною діалогу й не створює нового поля у
          Firebase. Локальний bridge не видаляє дані, працює з наявними
          activityId та за замовчуванням виконує лише dry-run.
        </Alert>
      </section>
    </CodexGuideLayout>
  );
};

export default CodexGuide;
