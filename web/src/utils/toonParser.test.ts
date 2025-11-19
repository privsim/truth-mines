import { describe, it, expect } from 'vitest';
import { parseToon } from './toonParser';

describe('parseToon', () => {
  it('parses simple relation block with one edge', () => {
    const toon = `supports[1]{f,t,w,domain}:
abc123,def456,0.9,philosophy`;

    const edges = parseToon(toon);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toEqual({
      f: 'abc123',
      t: 'def456',
      relation: 'supports',
      w: 0.9,
      domain: 'philosophy',
    });
  });

  it('parses multiple edges in single relation block', () => {
    const toon = `proves[3]{f,t,w,domain}:
t4k2p9,prf001,1.0,mathematics
0ax001,d5k7n8,0.9,mathematics
m7n3k2,m7n3k2,1.0,mathematics`;

    const edges = parseToon(toon);

    expect(edges).toHaveLength(3);
    expect(edges[0].relation).toBe('proves');
    expect(edges[1].relation).toBe('proves');
    expect(edges[2].relation).toBe('proves');
  });

  it('parses multiple relation blocks', () => {
    const toon = `attacks[2]{f,t,w,domain}:
m4k2p9,p8k2n1,0.95,philosophy
d5k7n8,00c001,0.8,philosophy

supports[2]{f,t,w,domain}:
k7x9m2,q3p8n5,0.9,philosophy
m4k2p9,q3p8n5,0.85,philosophy`;

    const edges = parseToon(toon);

    expect(edges).toHaveLength(4);
    expect(edges[0].relation).toBe('attacks');
    expect(edges[1].relation).toBe('attacks');
    expect(edges[2].relation).toBe('supports');
    expect(edges[3].relation).toBe('supports');
  });

  it('handles empty relation blocks', () => {
    const toon = `attacks[0]{f,t,w,domain}:

supports[1]{f,t,w,domain}:
abc123,def456,0.8,mathematics`;

    const edges = parseToon(toon);
    expect(edges).toHaveLength(1);
  });

  it('parses edges without weights (uses undefined)', () => {
    const toon = `cites[1]{f,t,domain}:
abc123,def456,philosophy`;

    const edges = parseToon(toon);

    expect(edges).toHaveLength(1);
    expect(edges[0].w).toBeUndefined();
  });

  it('handles malformed lines gracefully', () => {
    const toon = `supports[2]{f,t,w,domain}:
abc123,def456,0.9,philosophy
invalid-line-without-commas
xyz789,uvw012,0.7,mathematics`;

    const edges = parseToon(toon);

    // Should skip invalid line
    expect(edges).toHaveLength(2);
    expect(edges[0].f).toBe('abc123');
    expect(edges[1].f).toBe('xyz789');
  });

  it('parses real edges.toon sample', () => {
    const toon = `attacks[2]{f,t,w,domain}:
m4k2p9,p8k2n1,0.95,philosophy
d5k7n8,00c001,0.8,philosophy

defines[3]{f,t,w,domain}:
l2p9k4,l2p9k4,1.0,mathematics
00c001,0ax001,0.9,mathematics
0ep001,p8k2n1,0.7,philosophy`;

    const edges = parseToon(toon);

    expect(edges).toHaveLength(5);

    // Check first attack edge
    expect(edges[0]).toEqual({
      f: 'm4k2p9',
      t: 'p8k2n1',
      relation: 'attacks',
      w: 0.95,
      domain: 'philosophy',
    });

    // Check first define edge
    expect(edges[2]).toEqual({
      f: 'l2p9k4',
      t: 'l2p9k4',
      relation: 'defines',
      w: 1.0,
      domain: 'mathematics',
    });
  });

  it('handles empty string', () => {
    const edges = parseToon('');
    expect(edges).toEqual([]);
  });

  it('handles whitespace-only input', () => {
    const edges = parseToon('   \n\n   ');
    expect(edges).toEqual([]);
  });
});
