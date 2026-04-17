import json, math, sys

def cosine(a, b):
    dot = sum(x*y for x,y in zip(a,b))
    return dot / (math.sqrt(sum(x**2 for x in a)) * math.sqrt(sum(x**2 for x in b)))

with open('scripts/tag-embeddings.json') as f:
    data = json.load(f)

tags = {t['name']: t['embedding'] for t in data}

# Test 1 — dimensions
errors = [f"{t['name']}: {len(t['embedding'])} dims" for t in data if len(t['embedding']) != 768]
print(f"Total tags: {len(data)}")
if errors:
    print("❌ Dimension errors:"); [print(f"  {e}") for e in errors]; sys.exit(1)
else:
    print("✅ All tags have 768 dims")

# Test 2 — similarity
print("\nSame cluster (expect > 0.7):")
print(f"  fintech  <-> payments:  {cosine(tags['fintech'],  tags['payments']):.3f}")
print(f"  llm      <-> rag:       {cosine(tags['llm'],      tags['rag']):.3f}")
print(f"  cloud    <-> database:  {cosine(tags['cloud'],    tags['database']):.3f}")

print("\nDifferent cluster (expect < 0.5):")
print(f"  fintech  <-> robotics:  {cosine(tags['fintech'],  tags['robotics']):.3f}")
print(f"  llm      <-> latam:     {cosine(tags['llm'],      tags['latam']):.3f}")
print(f"  gaming   <-> pre-seed:  {cosine(tags['gaming'],   tags['pre-seed']):.3f}")