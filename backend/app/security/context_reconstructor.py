from collections.abc import Mapping
from typing import Any


class SecureContextReconstructor:
    """Build LLM-ready context from analyzed document chunks."""

    REMOVED_CONTENT_PLACEHOLDER = "[REMOVED_UNSAFE_CONTENT]"
    CHUNK_SEPARATOR = "\n\n"

    def reconstruct(self, analysis_results: list[Mapping[str, Any]]) -> dict[str, Any]:
        if not isinstance(analysis_results, list):
            raise TypeError("Analysis results must be a list.")

        accepted_content: list[str] = []
        rejected_chunks = 0

        for index, chunk in enumerate(analysis_results):
            if not isinstance(chunk, Mapping):
                raise ValueError(f"Analysis result at index {index} must be a mapping.")

            sanitized_text = chunk.get("sanitized_text")
            if not isinstance(sanitized_text, str):
                raise ValueError(
                    f"Analysis result sanitized_text at index {index} must be a string."
                )

            stripped_text = sanitized_text.strip()
            if not stripped_text or stripped_text == self.REMOVED_CONTENT_PLACEHOLDER:
                rejected_chunks += 1
                continue

            accepted_content.append(sanitized_text)

        return {
            "secure_context": self.CHUNK_SEPARATOR.join(accepted_content),
            "accepted_chunks": len(accepted_content),
            "rejected_chunks": rejected_chunks,
            "total_chunks": len(analysis_results),
        }
