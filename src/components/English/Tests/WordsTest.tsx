import React, { createRef, useCallback, useEffect, useState } from "react";
import {
  Paper,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Input,
} from "@mui/material";
import { useGetWordsListQuery } from "store/services/english";

interface Word {
  id: string;
  title: string;
  translation: string;
  example: string;
}

const WordsTest: React.FC = () => {
  const wordsData = useGetWordsListQuery();
  const [testingWords, setTestingWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("learn");

  const handleNextWord = useCallback(() => {
    setShowTranslation(false);
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % testingWords.length);
  }, [testingWords.length]);

  const handleShowTranslation = useCallback(() => {
    setShowTranslation((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && mode === "learn") {
        handleNextWord();
      }
      if (event.key === "ArrowDown" && mode === "learn") {
        handleShowTranslation();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleNextWord, handleShowTranslation, mode]);

  useEffect(() => {
    if (!wordsData.data) return;

    const allWords: Word[] = Object.entries(wordsData.data).map(
      ([wordId, wordData]) => ({
        ...wordData,
        id: wordId,
      })
    );

    setTestingWords(allWords);
  }, [wordsData]);

  const getTestedWord = useCallback(() => {
    return (
      testingWords[currentWordIndex]?.title.replace(/\./g, "").split("") || []
    );
  }, [currentWordIndex, testingWords]);

  const [currentWord, setCurrentWord] = useState<Record<number, string>>({});
  const [elRefs, setElRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);

  useEffect(() => {
    setElRefs((elRefs) =>
      Array(getTestedWord().length)
        .fill(null)
        .map((_, i) => elRefs[i] || createRef())
    );

    const reset: Record<number, string> = {};
    getTestedWord().forEach((_letter, index) => {
      reset[index] = "";
    });

    setCurrentWord(reset);
  }, [getTestedWord]);

  const handleCheckTranslation = () => {
    const answer: Record<number, string> = {};
    getTestedWord().forEach((letter, index) => {
      answer[index] = letter;
    });

    setCurrentWord(answer);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper style={{ width: "600px", height: "300px" }}>
        {testingWords.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-around",
              height: "100%",
            }}
          >
            <ToggleButtonGroup
              color="primary"
              value={mode}
              exclusive
              onChange={(_event, newMode) => setMode(newMode)}
              aria-label="Platform"
            >
              <ToggleButton value="learn">Learn Mode</ToggleButton>
              <ToggleButton value="test">Test Mode</ToggleButton>
            </ToggleButtonGroup>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="wordCounter">
                {currentWordIndex + 1}/{testingWords.length}
              </div>
              <h2>{testingWords[currentWordIndex].translation}</h2>
              {mode === "learn" && showTranslation && (
                <>
                  <p>Translation: {testingWords[currentWordIndex].title}</p>
                  <p> {testingWords[currentWordIndex].example}</p>
                </>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {mode === "test" &&
                  getTestedWord().map((letter, index) => {
                    return (
                      <div
                        style={{
                          marginLeft: "2px",
                          width: "16px",
                        }}
                      >
                        <Input
                          ref={elRefs[index]}
                          value={currentWord[index]}
                          inputProps={{ maxLength: 1 }}
                          onKeyDown={(event) => {
                            if (event.key === "Backspace") {
                              console.log(
                                event,
                                index,
                                getTestedWord().length - 1
                              );
                              if (index === getTestedWord().length - 1) {
                                setCurrentWord((prevValue) => {
                                  return { ...prevValue, [index]: "" };
                                });
                              }
                              setCurrentWord((prevValue) => {
                                return { ...prevValue, [index + 1]: "" };
                              });

                              if (index > 0) {
                                // If index is greater than 0, focus on the previous input
                                elRefs[index - 1].current.lastChild.focus();
                              }
                            }
                          }}
                          onChange={(event) => {
                            console.log(event.target.value, index);
                            setCurrentWord((prevValue) => ({
                              ...prevValue,
                              [index]: event.target.value,
                            }));
                            if (
                              event.target.value.length === 1 &&
                              getTestedWord().length > index + 1
                            ) {
                              elRefs[index + 1].current.lastChild.focus();
                            }
                          }}
                          error={currentWord[index] !== letter}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              {mode === "learn" && (
                <Button onClick={handleShowTranslation}>
                  {showTranslation ? "Hide Translation" : "Show Translation"}
                </Button>
              )}
              {mode === "test" && (
                <Button onClick={handleCheckTranslation}>
                  Check Translation
                </Button>
              )}
              <Button onClick={handleNextWord}>Next Word</Button>
            </div>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default WordsTest;
