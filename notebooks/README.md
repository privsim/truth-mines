# Truth Mines - LLM Integration Notebooks

Interactive Jupyter notebooks demonstrating LLM integration with Truth Mines knowledge graphs via TOON format.

## Setup

```bash
# Install Jupyter
pip install jupyter

# Optional: Install LLM client libraries
pip install openai anthropic
```

## Notebooks

### llm-exploration.ipynb

Demonstrates the complete workflow:
1. Extract subgraph as TOON
2. Construct LLM prompt with graph context
3. Send to LLM (OpenAI example)
4. Analyze responses
5. Add insights back to graph

**Use Cases:**
- Explain claims with justification
- Find argument weaknesses
- Discover cross-domain connections
- Generate proof sketches

## Running

```bash
# Start Jupyter
jupyter notebook

# Or use Jupyter Lab
jupyter lab
```

Then open `llm-exploration.ipynb` and run cells sequentially.

## TOON Format Benefits

- **Compact:** 30-60% fewer tokens than JSON
- **Structured:** Preserves graph topology
- **Readable:** Human and LLM friendly
- **Complete:** Lossless representation

## Example Workflow

1. **Identify node of interest** in graph
2. **Extract subgraph:** `python scripts/extract_subgraph.py --node <id> --depth 2 --output context.toon`
3. **Create prompt** with TOON context
4. **Send to LLM** (GPT-4, Claude, etc.)
5. **Review response** for insights
6. **Update graph** with new knowledge
7. **Validate:** `python scripts/validate.py`
8. **Commit** to Git

## See Also

- [LLM Integration Guide](../docs/llm-integration.md) - Detailed prompt templates
- [TOON Format Spec](../docs/toon-format.md) - Format specification (if created)
- [Example Prompts](../docs/llm-integration.md#example-prompts) - Ready-to-use templates
