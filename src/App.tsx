import useSWR from "swr";
import { useCallback, useEffect, useState } from "react";
import AnagrammerInput from "./components/AnagrammerInput";
import AnagramDisplay from "./components/AnagramDisplay";
import FinalAnagram from "./components/FinalAnagram";
import logo from "./assets/alpha-spag-round.jpg";
import DictionaryCheck from "./components/DictionaryCheck";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { DictionaryDisplay } from "./components/DictionaryDisplay";
import { GetDefinitionHelper } from "./services/GetDefinitionHelper";
import { CheatDataInfiniteScroll } from "./components/CheatDataInfiniteScroll";
import { CheatLookUpHelper } from "./services/CheatLookUpHelper";
import { LocalCheatLookUpHelper } from "./services/LocalCheatLookUpHelper";
import ErrorModal from "./components/ErrorModal";
import Button from "./ui/Button";

interface AnaLetters {
  unordered: string[] | string;
  ld: string[] | string;
}

interface TrackedLetter {
  id: number;
  char: string;
  isUsed: boolean;
}

function App() {
  const [error, setError] = useState<any>(null);
  const [letters, setLetters] = useState<TrackedLetter[]>([]);
  const [anaLetters, setAnaLetters] = useState<AnaLetters>({
    unordered: "",
    ld: "",
  });
  const [dictionaryDisplay, setDictionaryDisplay] = useState<any[]>([]);
  const [dictLook, setDictLook] = useState<boolean>(false);
  const [cheatData, setCheatData] = useState<any>(undefined);
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(true);
  const [dictSearchTerm, setDictSearchTerm] = useState<string | null>(null);

  // SWR Hook called cleanly at the top level
  const {
    data: swrDictData,
    isLoading: swrDictLoading,
    error: swrDictError,
  } = useSWR(dictSearchTerm, (word: string) => GetDefinitionHelper(word), {
    revalidateOnFocus: false,
  });

  // Sync SWR result to dictionary display state
  useEffect(() => {
    if (swrDictData) {
      setDictionaryDisplay(swrDictData);
    }
  }, [swrDictData]);

  // Sync SWR error to the app error state
  useEffect(() => {
    if (swrDictError) {
      setError({
        title: swrDictError.name || "Error",
        message:
          swrDictError.message || "An error occurred fetching the definition.",
      });
    }
  }, [swrDictError]);

  const handleAnagrammiser = (inputLetters: string) => {
    const letterArray = inputLetters
      .toLowerCase()
      .split("")
      .map((char, index) => ({
        id: index, // Unique tracking marker for duplicates
        char: char,
        isUsed: false,
      }));
    // Update your letters state to accept this tracked object array layout
    setLetters(letterArray);
  };

  const handleError = (title: string, message: string) => {
    setError({ title, message });
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
          // Flip its flag to true so it moves to your word slot layout
          match.isUsed = true;
        } else {
          // Edge case safeguard: User managed to submit a letter they don't possess
          handleError(
            "Mismatched Letters",
            `You don't have enough instances of the letter "${letter.toUpperCase()}" available.`,
          );
          return;
        }
      }

      // 3. Save the full ledger back to your main state track
      setLetters(updatedLetters);

      // 4. Update your sub-state container for your rendering displays
      // .filter tracks characters cleanly without colliding duplicates
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
  };

  const handleResetAnagramLetters = () => {
    setAnaLetters({ unordered: "", ld: "" });
    setDictLook(false);
    setCheatData(undefined);
    setDictSearchTerm(null);
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
  };

  const handleCheatLookUp = async (
    cheatWord: string[],
    currentLetters: string[],
  ) => {
    let data;
    if (currentLetters.length >= 15) {
      data = await LocalCheatLookUpHelper(
        cheatWord,
        currentLetters,
        handleError,
      );
    } else {
      data = await CheatLookUpHelper(cheatWord, currentLetters, handleError);
    }
    if (data) {
      setCheatData(data);
    }
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
        {/* TOP ROW: Title and Image grouped together on mobile */}
        <div className="flex items-center justify-end md:justify-center md:flex-row gap-4 md:gap-8 w-full">
          {/* IMAGE: Small on right for mobile, large on left for desktop */}
          <img
            src={logo}
            alt="alphabetti spagetti soup"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-64 md:h-64 rounded-full shadow-md md:shadow-lg object-cover shrink-0"
          />

          {/* TITLE: Left-aligned next to image on mobile, centers on desktop if needed */}
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

      {/* {!letters && !showWelcomeText && anaLetters.unordered.length === 0 && ( */}
      <AnagrammerInput
        onAnagrammise={handleAnagrammiser}
        onError={handleError}
      />
      {/* )} */}

      {letters && anaLetters.unordered.length === 0 && (
        <AnagramDisplay
          letters={letters.map((item) => item.char)}
          onLetterSubmit={handleSubmitLetters}
          onError={handleError}
        />
      )}

      {letters && (
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
        />
      )}

      {swrDictLoading && (
        <div className="flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ed800f] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500 animate-pulse">
            Consulting Datamuse dictionary...
          </p>
        </div>
      )}

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
