import useSWR from 'swr';
import { useCallback, useEffect, useState } from "react";
import AnagrammerInput from "./components/AnagrammerInput";
import AnagramDisplay from "./components/AnagramDisplay";
import FinalAnagram from "./components/FinalAnagram";
import logo from "./assets/alpha-spag-round.jpg";
import DictionaryCheck from "./components/DictionaryCheck";
import { Helmet, HelmetProvider } from "react-helmet-async";
import DictionaryDisplay from "./components/DictionaryDisplay";
import { GetDefinitionHelper } from "./services/GetDefinitionHelper";
import { CheatDataInfiniteScroll } from "./components/CheatDataInfiniteScroll";
import { CheatLookUpHelper } from "./services/CheatLookUpHelper";
import { LocalCheatLookUpHelper } from "./services/LocalCheatLookUpHelper";
import Button from "./ui/Button";

/**
 * Types for the Anagram state
 */
interface AnaLetters {
  unordered: string[] | string;
  ld: string[] | string;
}

function App() {
  const [error, setError] = useState<any>(null);
  const [letters, setLetters] = useState<string[] | "">("");
  const [anaLetters, setAnaLetters] = useState<AnaLetters>({ unordered: "", ld: "" });
  const [dictionaryDisplay, setDictionaryDisplay] = useState<any[]>([]);
  const [dictLook, setDictLook] = useState<boolean>(false);
  const [cheatData, setCheatData] = useState<any>(undefined);
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(true);
  const [dictSearchTerm, setDictSearchTerm] = useState<string | null>(null);

  // SWR Hook called cleanly at the top level
  const { data: swrDictData, isLoading: swrDictLoading, error: swrDictError } = useSWR(
    dictSearchTerm,
    (word: string) => GetDefinitionHelper(word),
    { revalidateOnFocus: false }
  );

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
        message: swrDictError.message || "An error occurred fetching the definition.",
      });
    }
  }, [swrDictError]);

  const handleAnagrammiser = (inputLetters: string) => {
    const letterArray = inputLetters.toLowerCase().split("");
    setLetters(letterArray);
  };

  const handleSubmitLetters = useCallback((letterData: string[]) => {
    const usedLetters = new Set(letters);

    for (const letter of letterData) {
      if (usedLetters.has(letter)) {
        usedLetters.delete(letter);
      }
    }

    setAnaLetters({ unordered: Array.from(usedLetters), ld: letterData });
  }, [letters]);

  const handleResetAnagram = () => {
    setAnaLetters({ unordered: "", ld: "" });
    setLetters("");
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
  
  const handleError = (title: string, message: string) => {
    setError({ title, message });
  };

  const handleCheatLookUp = async (cheatWord: string[], currentLetters: string[]) => {
    let data;
    if (currentLetters.length >= 15) {
      data = await LocalCheatLookUpHelper(cheatWord, currentLetters, handleError);
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
      
      <header className="w-full flex flex-col md:flex-row justify-center items-center gap-6 p-6 md:p-10">
        <img
          src={logo}
          alt="alphabetti spagetti soup"
          className="w-32 h-32 md:w-82 md:h-82 rounded-full shadow-lg"
        />
        <div className="flex flex-col text-center md:text-left ">
          <h1 className="text-2xl md:text-6xl font-bold ">
            The Ana-gram-miser
          </h1>
          <h2 className="text-lg md:text-2xl font-bold text-[#ed800f] mt-1">
            Solve anagrams — visualise, check words in a dictionary or cheat...
          </h2>
        </div>
      </header>

      {error && (
        <div>
          <div>
            <div className="max-w-xl mx-auto mt-10 p-8 bg-orange-50 rounded-2xl shadow-sm text-center"/>
            <header>
              <h2>{error.title}</h2>
            </header>
            <div>
              <p>{error.message}</p>
            </div>
            <Button onClick={() => setError(null)}>Okay</Button>
          </div>
        </div>
      )}

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

      {!letters && !showWelcomeText && anaLetters.unordered.length === 0 && (
        <AnagrammerInput onAnagrammise={handleAnagrammiser} onError={handleError} />
      )}
      
      {letters && anaLetters.unordered.length === 0 && (
        <AnagramDisplay letters={letters} onLetterSubmit={handleSubmitLetters} onError={handleError} />
      )}
      
      {letters && (
        <FinalAnagram
          anaLetters={anaLetters}
          resetAna={handleResetAnagram}
          resetAnaLetters={handleResetAnagramLetters}
          dictLookUp={() => setDictLook(true)}
          cheatLookUp={handleCheatLookUp}
          letters={letters}
        />
      )}
      
      {dictLook && <DictionaryCheck onDictLookUp={handleDictLookUp} onError={handleError} />}

      {swrDictLoading && (
        <div className="flex flex-col items-center justify-center p-8 space-y-3">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ed800f] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500 animate-pulse">
            Consulting Datamuse dictionary...
          </p>
        </div>
      )}
      
      {dictionaryDisplay.length > 0 && (
        <DictionaryDisplay wordDisplay={dictionaryDisplay} onConfirm={handleRemoveDisplay} />
      )}
      
      {cheatData && (
        <CheatDataInfiniteScroll
          cheatData={cheatData}
          letters={letters as string[]}
          onConfirm={handleRemoveCheatDisplay}
        />
      )}
    </HelmetProvider>
  );
}

export default App;