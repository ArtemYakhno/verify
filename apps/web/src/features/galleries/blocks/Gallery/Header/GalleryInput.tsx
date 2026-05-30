import { useEffect, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/common/components/ui/input-group";
import { Search } from "lucide-react";

interface GalleryInputProps {
  search: string;
  onSetSearch: (search: string) => void;
}

const DEBOUNCE_DELAY = 400;

export const GalleryInput = ({
  search,
  onSetSearch,
}: GalleryInputProps) => {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    // Sync local input state only for external URL-driven updates (reset/back/forward).
    //eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(search);
  }, [search]);

  useEffect(() => {
    if (inputValue === search) return;

    const timeoutId = window.setTimeout(() => {
      onSetSearch(inputValue);
    }, DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [inputValue, search, onSetSearch]);

  return (
    <InputGroup className="w-full  lg:w-[400px]">
      <InputGroupAddon align="inline-start">
        <div
          aria-hidden="true"
          className="pointer-events-none flex items-center justify-center"
        >
          <Search className="text-placeholder size-6" />
        </div>
      </InputGroupAddon>

      <InputGroupInput
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search by title"
      />
    </InputGroup>
  );
};