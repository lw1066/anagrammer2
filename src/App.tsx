import useSWR from "swr";
import { useCallback, useEffect, useState } from "react";
import AnagrammerInput from "./components/AnagrammerInput";
import { AnagramDisplay } from "./components/AnagramDisplay";
import { FinalAnagram } from "./components/FinalAnagram";
import logo from "./assets/alpha-spag-round.jpg";
import { DictionaryCheck } from "./components/DictionaryCheck";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { DictionaryDisplay } from "./components/DictionaryDisplay";
import {
  GetDefinitionHelper,
  type DefinitionItem,
} from "./services/GetDefinitionHelper";
import { CheatDataInfiniteScroll } from "./components/CheatDataInfiniteScroll";
import { CheatLookUpHelper } from "./services/CheatLookUpHelper";
import { ErrorModal } from "./components/ErrorModal";
import { Button } from "./ui/Button";

interface AnaLetters {
  unordered: string[] | string;
  ld: string[] | string;
}

interface TrackedLetter {
  id: number;
  char: string;
  isUsed: boolean;
}

interface CheatParams {
  cheatWord: string[];
  currentLetters: string[];
}

function App() {
  const [error, setError] = useState<any>(null);
  const [letters, setLetters] = useState<TrackedLetter[]>([]);
  const [anaLetters, setAnaLetters] = useState<AnaLetters>({
    unordered: "",
    ld: "",
  });
  const [dictionaryDisplay, setDictionaryDisplay] = useState<DefinitionItem[]>(
    [],
  );
  const [dictLook, setDictLook] = useState<boolean>(false);
  const [cheatData, setCheatData] = useState<DefinitionItem[] | undefined>(
    undefined,
  );
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(true);

  const [dictSearchTerm, setDictSearchTerm] = useState<string | null>(null);
  const [cheatParams, setCheatParams] = useState<CheatParams | null>(null);

  const handleError = useCallback((title: string, message: string) => {
    setError({ title, message });
  }, []);

  const {
    data: swrDictData,
    isLoading: swrDictLoading,
    error: swrDictError,
  } = useSWR(dictSearchTerm, (word: string) => GetDefinitionHelper(word), {
    revalidateOnFocus: false,
  });

  const {
    data: swrCheatData,
    isLoading: swrCheatLoading,
    error: swrCheatError,
  } = useSWR(
    cheatParams,
    async (params: CheatParams | null) => {
      if (!params) return null;

      const { cheatWord, currentLetters } = params;

      const data = await CheatLookUpHelper(
        cheatWord,
        currentLetters,
        handleError,
      );

      return data;
    },
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (swrDictData) {
      setDictionaryDisplay(swrDictData);
    }
  }, [swrDictData]);

  useEffect(() => {
    if (swrDictError) {
      handleError(
        "An error occurred fetching dictionary data.",
        swrDictError.message || "An error occurred fetching the definition.",
      );
    }
  }, [swrDictError, handleError]);

  useEffect(() => {
    if (swrCheatData) {
      setCheatData(swrCheatData);
    }
  }, [swrCheatData]);

  useEffect(() => {
    if (swrCheatError) {
      handleError(
        "An error occurred fetching cheat data.",
        swrCheatError.message || "An error occurred fetching the cheat data.",
      );
    }
  }, [swrCheatError, handleError]);

  const handleAnagrammiser = (inputLetters: string) => {
    const letterArray = inputLetters
      .toLowerCase()
      .split("")
      .map((char, index) => ({
        id: index,
        char: char,
        isUsed: false,
      }));
    setLetters(letterArray);
  };

  const handleSubmitLetters = useCallback(
    (letterData: string[]) => {
      const updatedLetters = letters.map((item) => ({
        ...item,
        isUsed: false,
      }));

      for (const letter of letterData) {
        if (!letter) continue;

        let match = updatedLetters.find(
          (updatedLetter) =>
            updatedLetter.char === letter && !updatedLetter.isUsed,
        );

        if (!match) {
          match = updatedLetters.find(
            (letter) => !letter.isUsed && letter.char === "?",
          );
        }

        if (match) {
          match.isUsed = true;
        } else {
          handleError(
            "Mismatched Letters",
            `You don't have enough instances of the letter "${letter.toUpperCase()}" available.`,
          );
          return;
        }
      }

      setLetters(updatedLetters);

      const unorderedPool = updatedLetters
        .filter((letter) => !letter.isUsed)
        .map((letter) => letter.char);

      setAnaLetters({
        unordered: unorderedPool,
        ld: letterData,
      });
    },
    [letters, handleError],
  );

  const handleResetAnagram = () => {
    setAnaLetters({ unordered: "", ld: "" });
    setLetters([]);
    setDictLook(false);
    setCheatData(undefined);
    setDictSearchTerm(null);
    setCheatParams(null);
  };

  const handleResetAnagramLetters = () => {
    setAnaLetters({ unordered: "", ld: "" });
    setDictLook(false);
    setCheatData(undefined);
    setDictSearchTerm(null);
    setCheatParams(null);
  };

  const handleDictLookUp = (word: string) => {
    setDictSearchTerm(word);
  };

  const handleRemoveDisplay = () => {
    setDictionaryDisplay([]);
    setDictSearchTerm(null);
  };

  const handleRemoveCheatDisplay = () => {
    setCheatData(undefined);
    setCheatParams(null);
  };

  const handleCheatLookUp = (cheatWord: string[], currentLetters: string[]) => {
    const wildcardCount = currentLetters.filter((char) => char === "?").length;

    if (wildcardCount > 10) {
      handleError(
        "Too Many Wildcards",
        "Please limit your search to a maximum of 10 wildcards. Exceeding this annoys the dictionary server.",
      );
      return;
    }
    setCheatParams(null);
    setCheatData(undefined);
    setCheatParams({ cheatWord, currentLetters });
  };

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Ana-gram-miser</title>
        <link rel="canonical" href="http://anagrammiser.netlify.app" />
        <meta name="description" content="Anagram solver" />
      </Helmet>

      <header className="w-full max-w-4xl mx-auto p-4 md:p-10 flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-end md:justify-center md:flex-row gap-4 md:gap-8 w-full">
          <img
            src={logo}
            alt="alphabetti spagetti soup"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-64 md:h-64 rounded-full shadow-md md:shadow-lg object-cover shrink-0"
          />
          <div className="flex flex-col text-left md:text-left">
            <h1 className="text-xl sm:text-2xl md:text-6xl font-bold tracking-tight text-gray-950">
              The Ana-gram-miser
            </h1>
            <h2 className="text-xs sm:text-sm md:text-2xl font-semibold text-[#ed800f] mt-1 leading-relaxed">
              Solve anagrams — visualise, check words in a dictionary or
              cheat...
            </h2>
          </div>
        </div>
      </header>

      {showWelcomeText && (
        <div className="max-w-xl mx-auto mt-10 p-8 bg-orange-50 rounded-2xl shadow-sm text-center">
          <div className="space-y-4">
            <p className="font-bold">Enter your letters to get started.</p>
            <p>Enter ? for each missing letter.</p>
            <div className="pt-4 hover:pointer flex justify-center">
              <Button onClick={() => setShowWelcomeText(false)}>
                Let's Go
              </Button>
            </div>
          </div>
        </div>
      )}

      {letters.length === 0 &&
        !showWelcomeText &&
        anaLetters.unordered.length === 0 && (
          <AnagrammerInput
            onAnagrammise={handleAnagrammiser}
            onError={handleError}
          />
        )}

      {letters.length > 0 && anaLetters.unordered.length === 0 && (
        <AnagramDisplay
          letters={letters.map((item) => item.char)}
          onLetterSubmit={handleSubmitLetters}
          onError={handleError}
        />
      )}

      {letters.length > 0 && !dictLook && (
        <FinalAnagram
          anaLetters={anaLetters}
          resetAna={handleResetAnagram}
          resetAnaLetters={handleResetAnagramLetters}
          dictLookUp={() => setDictLook(true)}
          cheatLookUp={handleCheatLookUp}
          letters={letters.map((letter) => letter.char)}
        />
      )}

      {dictLook && (
        <DictionaryCheck
          onDictLookUp={handleDictLookUp}
          onError={handleError}
          onClose={() => setDictLook(false)}
        />
      )}

      {swrDictLoading ||
        (swrCheatLoading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ed800f] rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-500 animate-pulse">
              Consulting Datamuse dictionary...
            </p>
          </div>
        ))}

      {dictionaryDisplay.length > 0 && (
        <DictionaryDisplay
          wordDisplay={dictionaryDisplay}
          onConfirm={handleRemoveDisplay}
        />
      )}

      {error && (
        <ErrorModal
          title={error.title}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}

      {/* Condition to render cheat scroll when data is ready */}
      {cheatData && (
        <CheatDataInfiniteScroll
          cheatData={cheatData}
          letters={letters.map((letter) => letter.char)}
          onConfirm={handleRemoveCheatDisplay}
        />
      )}
    </HelmetProvider>
  );
}

export default App;
