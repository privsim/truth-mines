# LLM Integration with TOON Format

This guide shows how to use Truth Mines knowledge graph data with LLMs for reasoning tasks.

## Overview

Truth Mines uses **TOON format** - a compact, token-efficient representation of graph data optimized for LLM context windows while remaining human-readable.

**Benefits:**
- 30-60% fewer tokens than JSON
- Preserves complete graph structure
- Easy to parse and understand
- Ideal for LLM reasoning tasks

---

## Extracting Subgraphs

Use `extract_subgraph.py` to create TOON packs for specific nodes:

```bash
# Extract 2-hop neighborhood around a node
python scripts/extract_subgraph.py \
  --node k7x9m2 \
  --depth 2 \
  --output subgraphs/epistemology.toon

# Output: TOON file with nodes and edges in the neighborhood
```

---

## Example 1: Explain a Claim with Justification

**Goal:** Understand a philosophical claim and its support structure

**TOON Data to Include:**
```bash
python scripts/extract_subgraph.py \
  --node k7x9m2 \
  --depth 2 \
  --output context/knowledge-safety.toon
```

**Prompt Template:**
```
I have a knowledge graph representing epistemological theories. Here's a subgraph around
the claim "Knowledge requires safety":

[Insert TOON content from knowledge-safety.toon]

Based on this graph structure:
1. Explain what the "safety" condition for knowledge means
2. What nodes support this claim? Summarize their arguments
3. Are there any attacks or counterarguments shown?
4. How does this relate to other epistemological theories in the graph?
```

**Expected Output:**
- Explanation of the safety condition
- Summary of supporting evidence
- Analysis of objections
- Connections to related theories

---

## Example 2: Find Weaknesses in an Argument

**Goal:** Identify gaps or vulnerabilities in justification chains

**TOON Data:**
```bash
python scripts/extract_subgraph.py \
  --node p8k2n1 \  # JTB analysis
  --depth 3 \
  --output context/jtb-analysis.toon
```

**Prompt Template:**
```
Here's a knowledge graph showing the Justified True Belief (JTB) analysis of knowledge
and related nodes:

[Insert TOON]

Analyze this argument structure:
1. What are the weakest links in the justification chain?
2. Which attacks (if any) are most compelling?
3. Are there missing connections that would strengthen or weaken the argument?
4. Suggest additional nodes or edges to add to the graph
```

**Expected Output:**
- Identified weak points
- Assessment of counterarguments
- Suggestions for graph improvements

---

## Example 3: Cross-Domain Connection Discovery

**Goal:** Find or suggest connections between domains

**TOON Data:**
```bash
# Extract subgraph including bridge edges
python scripts/extract_subgraph.py \
  --node 00c001 \  # Formal systems concept
  --depth 2 \
  --output context/formal-systems.toon
```

**Prompt Template:**
```
This graph shows a concept of "formal systems" and its connections across philosophy
and mathematics:

[Insert TOON]

Analyze cross-domain relationships:
1. How do philosophical concepts formalize into mathematical structures?
2. What other mathematical theorems could be linked to this philosophical foundation?
3. Suggest new "formalizes" or "models" edges to add
4. Are there inconsistencies in the cross-domain mapping?
```

**Expected Output:**
- Analysis of existing bridges
- Suggested new connections
- Consistency checks

---

## Example 4: Generate Proof Sketches

**Goal:** Use mathematical graph structure to guide proof construction

**TOON Data:**
```bash
python scripts/extract_subgraph.py \
  --node t4k2p9 \  # Fundamental Theorem of Algebra
  --depth 2 \
  --output context/fta.toon
```

**Prompt Template:**
```
Mathematical proof structure for the Fundamental Theorem of Algebra:

[Insert TOON]

Tasks:
1. Generate a proof sketch showing how to derive this theorem from the supporting nodes
2. What lemmas or intermediate results are needed (shown in the graph)?
3. Identify any missing steps in the proof chain
4. Suggest additional "proves" or "lemma_for" edges
```

**Expected Output:**
- Structured proof sketch
- Identification of lemmas
- Missing step detection

---

## Generating TOON Packs Programmatically

### Python

```python
import json
from pathlib import Path

def create_toon_pack(node_id: str, depth: int = 2) -> str:
    """Generate TOON pack for a node."""
    import subprocess

    result = subprocess.run(
        [
            "python",
            "scripts/extract_subgraph.py",
            "--node",
            node_id,
            "--depth",
            str(depth),
            "--output",
            "/dev/stdout",
        ],
        capture_output=True,
        text=True,
    )

    return result.stdout


# Use with LLM
toon_context = create_toon_pack("k7x9m2", depth=2)
prompt = f"""
Analyze this knowledge graph:

{toon_context}

What are the main arguments for this claim?
"""
```

### JavaScript/TypeScript (Browser)

```typescript
// Call WASM engine to get subgraph
const engine = new GraphEngine(styleConfig);
engine.load_nodes_json(nodesJson);
engine.load_edges_toon(edgesToon);

// Get k-hop neighbors
const neighbors = engine.neighbors(nodeId, 2);

// Generate TOON (would need TOON export method on engine)
const toonPack = engine.export_subgraph_toon(nodeId, 2);
```

---

## TOON Format Reference

### Node Table
```
nodes[N]{id,type,domain,title}:
abc123,proposition,philosophy,Knowledge requires safety
def456,theorem,mathematics,Fundamental Theorem
```

### Edge Tables (by relation)
```
supports[3]{f,t,w,domain}:
abc123,def456,0.9,philosophy
ghi789,def456,0.85,philosophy
jkl012,def456,0.7,philosophy

proves[1]{f,t,w,domain}:
def456,xyz999,1.0,mathematics
```

---

## Tips for LLM Prompting

**1. Provide Context:**
- Explain what the graph represents
- Define any domain-specific terminology
- Clarify relation meanings

**2. Be Specific:**
- Ask focused questions
- Request structured output
- Specify reasoning format desired

**3. Leverage Structure:**
- Reference edge types (supports, attacks, proves)
- Ask about paths and connections
- Query about missing links

**4. Iterate:**
- Start with small subgraphs
- Refine based on LLM responses
- Add suggested connections back to graph

---

## Next Steps

1. Extract subgraph for your area of interest
2. Choose appropriate prompt template
3. Send to your preferred LLM (GPT-4, Claude, etc.)
4. Analyze responses
5. Update graph based on insights
6. Iterate

See `notebooks/llm-exploration.ipynb` for interactive examples.
