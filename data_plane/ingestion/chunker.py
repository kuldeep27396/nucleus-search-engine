class RecursiveTextChunker:
    """
    Splits text documents recursively by paragraph, sentence, and word boundaries.
    """

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 64):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", ". ", " ", ""]

    def split_text(self, text: str) -> list[str]:
        """Splits raw document text into overlapping chunks."""
        text = text.strip()
        if not text:
            return []

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + self.chunk_size

            if end >= text_length:
                chunks.append(text[start:].strip())
                break

            # Try to break at a natural separator near end
            chunk_slice = text[start:end]
            break_pos = -1

            for sep in self.separators:
                if sep:
                    pos = chunk_slice.rfind(sep)
                    if pos != -1 and pos > self.chunk_overlap:
                        break_pos = pos + len(sep)
                        break

            if break_pos != -1:
                chunk_text = text[start : start + break_pos].strip()
                start = start + break_pos - self.chunk_overlap
            else:
                chunk_text = chunk_slice.strip()
                start = end - self.chunk_overlap

            if chunk_text:
                chunks.append(chunk_text)

        return chunks
