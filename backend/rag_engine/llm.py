"""
llm.py
------
Sends a prompt (query + retrieved context) to a local Ollama model
and returns the generated answer.
"""

from langchain_ollama import ChatOllama


# Model name must match what you pulled with `ollama pull <name>`
MODEL_NAME = "llama3.2"

_llm = ChatOllama(model=MODEL_NAME, temperature=0.2)


def build_prompt(query: str, context_chunks: list) -> str:
    """
    Combine the retrieved chunks into a context block and
    build the final prompt sent to the LLM.
    """
    if not context_chunks:
        context_text = "No relevant context was found."
    else:
        context_text = "\n\n".join(
            f"[Source: {c.get('document_id', 'unknown')}] {c.get('content', '')}"
            for c in context_chunks
        )

    prompt = f"""You are a helpful assistant that answers questions using ONLY the context provided below.
If the answer is not in the context, say "I don't have enough information to answer that."

Context:
{context_text}

Question: {query}

Answer:"""

    return prompt


def generate_answer(query: str, context_chunks: list) -> str:
    """
    Build the prompt and get a response from the LLM.
    """
    prompt = build_prompt(query, context_chunks)
    response = _llm.invoke(prompt)
    return response.content


# --- Test this file directly ---
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print('Usage: python llm.py "your question here"')
        sys.exit(1)

    query = sys.argv[1]

    # Fake context for a quick standalone test (no retrieval needed yet)
    fake_context = [
        {
            "document_id": "doc_test_001",
            "content": "Employees are entitled to 12 casual leaves per calendar year.",
        }
    ]

    print(f"Query: {query}\n")
    print("Generating answer...\n")
    answer = generate_answer(query, fake_context)
    print("Answer:")
    print(answer)